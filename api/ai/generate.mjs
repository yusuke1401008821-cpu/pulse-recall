const DEFAULT_PROVIDER = "gemini";
const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const MAX_INLINE_FILE_BYTES = 4 * 1024 * 1024;
const MAX_INLINE_FILE_COUNT = 6;
const MAX_TOTAL_INLINE_FILE_BYTES = 7 * 1024 * 1024;
const MAX_PROMPT_CHARS = 180000;
const AI_REQUEST_TIMEOUT_MS = 35 * 1000;
const AI_RETRY_LIMIT = 1;

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return jsonResponse({ code: "METHOD_NOT_ALLOWED", error: "Method not allowed" }, 405);
    }

    if (process.env.AI_ENABLED === "false") {
      return jsonResponse({ code: "AI_DISABLED", error: "AI generation is disabled." }, 503);
    }

    const provider = String(process.env.AI_PROVIDER || DEFAULT_PROVIDER).trim().toLowerCase();
    if (provider !== "gemini") {
      return jsonResponse({ code: "AI_UNSUPPORTED_PROVIDER", error: "Only Gemini is configured in this build." }, 501);
    }

    const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return jsonResponse({ code: "AI_NOT_CONFIGURED", error: "GEMINI_API_KEY is not configured." }, 503);
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      return jsonResponse({ code: "BAD_FORM_DATA", error: "Request body could not be parsed." }, 400);
    }

    const task = String(formData.get("task") || "").trim();
    const payload = parsePayload(formData.get("payload"));
    const files = collectFiles(formData);
    const model = String(process.env.AI_MODEL || DEFAULT_MODEL).trim();

    try {
      let result;
      if (task === "deck_from_pdf") {
        result = await handleDeckFromPdf({ apiKey, model, payload, files });
      } else if (task === "quiz_from_selection") {
        result = await handleQuizFromSelection({ apiKey, model, payload });
      } else if (task === "question_slide_refine") {
        result = await handleQuestionSlideRefine({ apiKey, model, payload });
      } else {
        return jsonResponse({ code: "UNKNOWN_TASK", error: "Unknown AI task." }, 400);
      }

      return jsonResponse({
        provider,
        model,
        ...result,
      });
    } catch (error) {
      return handleAiError(error);
    }
  },
};

async function handleDeckFromPdf({ apiKey, model, payload, files }) {
  const focus = cleanText(payload.focus || "medical");
  const subject = cleanText(payload.subject || "");
  const instructions = cleanText(payload.instructions || "");
  const deckName = cleanText(payload.deckName || "");
  const limit = clampNumber(payload.limit, 4, 30, 12);
  const pastedText = cleanText(payload.pastedText || "");
  const sourceName = cleanText(payload.sourceName || files[0]?.name || "資料");
  const sourceManifest = Array.isArray(payload.sourceManifest) ? payload.sourceManifest.slice(0, 12) : [];
  const selectedChunks = normalizeSourceChunks(payload.selectedChunks).slice(0, 24);
  const fileParts = await buildFileParts(files);

  if (!fileParts.length && !pastedText && !selectedChunks.length) {
    throw createAiError("INVALID_INPUT", "No source document was provided.", 400);
  }
  const chunkGroups = splitIntoChunks(selectedChunks, 6);
  const normalizedGroups = chunkGroups.length ? chunkGroups : [[{ sourceLabel: sourceName, sourcePage: null, text: pastedText || "(添付ファイルを参照)" }]];
  const cards = [];

  for (const [groupIndex, chunkGroup] of normalizedGroups.entries()) {
    const prompt = trimPrompt(`
あなたは医学部学習と英語学習用の暗記カード作成アシスタントです。
与えられた資料だけを根拠に、保存前レビュー用のカード候補を作ってください。

条件:
- deckName: ${deckName || "未指定"}
- focus: ${focus || "general"}
- subject: ${subject || "未指定"}
- limit: ${Math.max(2, Math.ceil(limit / normalizedGroups.length))}
- instructions: ${instructions || "特記事項なし"}
- sourceManifest: ${JSON.stringify(sourceManifest)}
- 事実を補わない
- 資料に書かれていない知識は作らない
- chunk ごとに根拠を持つ問題だけ返す
- evidenceSnippet は短く、資料中の根拠をそのまま抜き出す
- sourceLabel と sourcePage をできるだけ付ける
- confidence は 0 から 1

返答は JSON のみ:
{
  "sourceLabel": "資料名",
  "cards": [
    {
      "front": "問題",
      "back": "答え",
      "hint": "短いヒント",
      "topic": "分野",
      "tags": ["タグ1", "タグ2"],
      "note": "補足",
      "example": "例文や症例",
      "sourceLabel": "資料名",
      "sourcePage": 1,
      "evidenceSnippet": "資料中の根拠",
      "confidence": 0.0
    }
  ]
}

selectedChunks:
${JSON.stringify(chunkGroup)}

本文テキスト:
${groupIndex === 0 ? pastedText || "(必要なら添付ファイルを参照)" : "(上の chunk を優先して使う)"}
    `);

    const data = await callGeminiJson({
      apiKey,
      model,
      prompt,
      fileParts: groupIndex === 0 ? fileParts : [],
      temperature: 0.1,
      allowRepair: true,
    });
    cards.push(...normalizeDeckCards(data.cards));
  }

  return {
    sourceLabel: sourceName,
    cards: dedupeDeckCards(cards).slice(0, limit),
  };
}

async function handleQuizFromSelection({ apiKey, model, payload }) {
  const mode = cleanText(payload.mode || "test");
  const size = clampNumber(payload.size, 3, 20, 8);
  const filterLabel = cleanText(payload.filterLabel || "すべてのデッキ");
  const sourceTitle = cleanText(payload.sourceTitle || "出題元");
  const sourceDescription = cleanText(payload.sourceDescription || "");
  const focus = cleanText(payload.focus || "medical");
  const cards = Array.isArray(payload.cards) ? payload.cards.slice(0, 36) : [];
  if (!cards.length) {
    throw createAiError("INVALID_INPUT", "No source cards were provided.", 400);
  }

  const prompt = trimPrompt(`
あなたは医学部と英語学習の小テスト作成アシスタントです。
以下の保存済みカードだけを根拠に、${size}問の${mode === "choice" ? "4択クイズ" : "記述小テスト"}案を作成してください。

条件:
- 参照範囲: ${filterLabel}
- 出題元: ${sourceTitle}
- 補足: ${sourceDescription || "なし"}
- focus: ${focus}
- 各問題は必ず sourceIndex を1つ選び、そのカードに根拠を持たせる
- sourceIndex は下の cards 配列にある番号をそのまま使う
- 4択モードでは options を4つ返し、正しい選択肢だけ isCorrect=true にする
- 記述モードでは options を返さない
- explanation は短い解説、evidenceSnippet は根拠カードの要点
- 事実を補わず、cards の情報だけで作る

返答は JSON のみ:
{
  "quizItems": [
    {
      "prompt": "問題文",
      "answer": "正答",
      "explanation": "短い解説",
      "topic": "分野",
      "tags": ["タグ"],
      "sourceIndex": 1,
      "sourceLabel": "デッキ名",
      "sourcePage": null,
      "evidenceSnippet": "根拠",
      "confidence": 0.0,
      "options": [
        { "label": "選択肢1", "isCorrect": true },
        { "label": "選択肢2", "isCorrect": false },
        { "label": "選択肢3", "isCorrect": false },
        { "label": "選択肢4", "isCorrect": false }
      ]
    }
  ]
}

cards:
${JSON.stringify(cards)}
  `);

  const data = await callGeminiJson({ apiKey, model, prompt, temperature: 0.05, allowRepair: true });
  return {
    quizItems: normalizeQuizItems(data.quizItems, mode),
  };
}

async function handleQuestionSlideRefine({ apiKey, model, payload }) {
  const questions = normalizeQuestionRefineInputs(payload.questions).slice(0, 24);
  const sourceManifest = payload?.sourceManifest && typeof payload.sourceManifest === "object" ? payload.sourceManifest : {};
  if (!questions.length) {
    throw createAiError("INVALID_INPUT", "Questions or slide candidates are missing.", 400);
  }

  const questionMatches = [];
  for (const questionGroup of splitIntoChunks(questions, 6)) {
    const prompt = trimPrompt(`
あなたは過去問と講義スライドの対応づけを手伝う学習アシスタントです。
各設問ごとに付いている候補ページだけを使って、近いスライド候補を最大3件返してください。

条件:
- sourceManifest: ${JSON.stringify(sourceManifest)}
- questionMatches は questionId ごとに返す
- matches がない設問は空配列
- confidence は 0 から 1
- reason は「なぜそのスライド候補なのか」を1文で簡潔に
- evidenceSnippet は candidates の本文から短く抜粋
- candidates 以外の資料は参照しない
- 事実を補わない

返答は JSON のみ:
{
  "questionMatches": [
    {
      "questionId": "id",
      "label": "問1",
      "matches": [
        {
          "sourceName": "スライド名",
          "pageNumber": 1,
          "evidenceSnippet": "根拠文",
          "reason": "対応理由",
          "confidence": 0.0
        }
      ]
    }
  ]
}

questions:
${JSON.stringify(questionGroup)}
    `);

    const data = await callGeminiJson({ apiKey, model, prompt, temperature: 0.05, allowRepair: true });
    questionMatches.push(...normalizeQuestionMatches(data.questionMatches));
  }
  return {
    questionMatches,
  };
}

async function callGeminiJson({ apiKey, model, prompt, fileParts = [], temperature = 0.1, allowRepair = false }) {
  let attempt = 0;
  let repairPrompt = prompt;

  while (attempt <= AI_RETRY_LIMIT) {
    try {
      const text = await requestGeminiText({ apiKey, model, prompt: repairPrompt, fileParts, temperature });
      const parsed = parseJsonText(text);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }

      if (allowRepair && attempt < AI_RETRY_LIMIT) {
        repairPrompt = trimPrompt(`
以下の資料要求は同じです。前回の返答は JSON として読めませんでした。
説明文を一切付けず、指定した JSON のみを返してください。

元の指示:
${prompt}

前回の返答:
${String(text || "").slice(0, 4000)}
        `);
        attempt += 1;
        continue;
      }

      throw createAiError("AI_BAD_RESPONSE", "Gemini returned an unreadable response.", 502);
    } catch (error) {
      if (!shouldRetryAiRequest(error) || attempt >= AI_RETRY_LIMIT) {
        throw error;
      }
      attempt += 1;
    }
  }

  throw createAiError("AI_REQUEST_FAILED", "Gemini request failed after retry.", 502);
}

async function requestGeminiText({ apiKey, model, prompt, fileParts = [], temperature = 0.1 }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [...fileParts, { text: prompt }],
            },
          ],
          generationConfig: {
            temperature,
            responseMimeType: "application/json",
          },
        }),
      },
    );
  } catch (error) {
    clearTimeout(timeoutId);
    if (error?.name === "AbortError") {
      throw createAiError("AI_TIMEOUT", "Gemini request timed out.", 504);
    }
    const requestError = createAiError("AI_REQUEST_FAILED", error?.message || "Gemini request failed.", 502);
    requestError.retryable = true;
    throw requestError;
  }

  clearTimeout(timeoutId);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const upstream = data?.error || {};
    const upstreamStatus = String(upstream.status || "");
    const isRateLimited = upstreamStatus === "RESOURCE_EXHAUSTED" || response.status === 429;
    const error = createAiError(
      isRateLimited ? "FREE_TIER_EXCEEDED" : "AI_REQUEST_FAILED",
      upstream.message || "Gemini request failed.",
      isRateLimited ? 429 : response.status || 500,
    );
    error.retryable = !isRateLimited && response.status >= 500;
    throw error;
  }

  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => String(part?.text || ""))
    .join("\n")
    .trim();
}

function shouldRetryAiRequest(error) {
  const code = String(error?.code || "").trim();
  if (code === "FREE_TIER_EXCEEDED" || code === "AI_TOO_MANY_FILES" || code === "AI_TOTAL_SIZE_TOO_LARGE" || code === "AI_FILE_TOO_LARGE") {
    return false;
  }
  return Boolean(error?.retryable) || code === "AI_TIMEOUT" || code === "AI_BAD_RESPONSE";
}

async function buildFileParts(files) {
  const normalizedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
  if (normalizedFiles.length > MAX_INLINE_FILE_COUNT) {
    throw createAiError("AI_TOO_MANY_FILES", "Too many files were attached for free-tier processing.", 413);
  }

  const totalBytes = normalizedFiles.reduce((sum, file) => sum + Number(file.size || 0), 0);
  if (totalBytes > MAX_TOTAL_INLINE_FILE_BYTES) {
    throw createAiError("AI_TOTAL_SIZE_TOO_LARGE", "The combined file size is too large for free-tier inline processing.", 413);
  }

  const parts = [];

  for (const file of normalizedFiles) {
    if (!file) {
      continue;
    }

    const size = Number(file.size || 0);
    if (size > MAX_INLINE_FILE_BYTES) {
      throw createAiError("AI_FILE_TOO_LARGE", "The uploaded file is too large for free-tier inline processing.", 413);
    }

    const mimeType = String(file.type || inferMimeType(file.name || "") || "application/octet-stream");
    const bytes = Buffer.from(await file.arrayBuffer());
    parts.push({
      inlineData: {
        mimeType,
        data: bytes.toString("base64"),
      },
    });
  }

  return parts;
}

function normalizeSourceChunks(chunks) {
  return (Array.isArray(chunks) ? chunks : [])
    .map((chunk) => ({
      sourceLabel: cleanText(chunk?.sourceLabel || chunk?.sourceName || ""),
      sourcePage: toNullableNumber(chunk?.sourcePage),
      text: cleanText(chunk?.text || chunk?.content || ""),
    }))
    .filter((chunk) => chunk.text);
}

function normalizeQuestionRefineInputs(questions) {
  return (Array.isArray(questions) ? questions : [])
    .map((question) => ({
      questionId: cleanText(question?.questionId || question?.id || question?.label || ""),
      label: cleanText(question?.label || ""),
      questionSourceName: cleanText(question?.questionSourceName || question?.sourceName || ""),
      prompt: cleanText(question?.prompt || question?.question || ""),
      options: (Array.isArray(question?.options) ? question.options : [])
        .map((option) => cleanText(option))
        .filter(Boolean)
        .slice(0, 5),
      candidates: (Array.isArray(question?.candidates) ? question.candidates : [])
        .map((candidate) => ({
          sourceName: cleanText(candidate?.sourceName || candidate?.sourceLabel || ""),
          pageNumber: toNullableNumber(candidate?.pageNumber || candidate?.sourcePage) || 1,
          evidenceSnippet: cleanText(candidate?.evidenceSnippet || candidate?.snippet || ""),
          snippet: cleanText(candidate?.snippet || candidate?.evidenceSnippet || ""),
          matchedTokens: normalizeTags(candidate?.matchedTokens || []).slice(0, 8),
          coverage: clampNumber(candidate?.coverage, 0, 1, 0),
          score: Number(candidate?.score || 0),
        }))
        .filter((candidate) => candidate.sourceName && (candidate.evidenceSnippet || candidate.snippet)),
    }))
    .filter((question) => question.questionId && question.prompt && question.candidates.length);
}

function dedupeDeckCards(cards) {
  const seen = new Set();
  return (Array.isArray(cards) ? cards : []).filter((card) => {
    const key = `${cleanText(card?.front)}::${cleanText(card?.back)}::${cleanText(card?.sourceLabel)}::${toNullableNumber(card?.sourcePage) || ""}`.toLowerCase();
    if (!card?.front || !card?.back || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function splitIntoChunks(items, size) {
  const normalized = Array.isArray(items) ? items : [];
  if (!normalized.length || size <= 0) {
    return [];
  }

  const chunks = [];
  for (let index = 0; index < normalized.length; index += size) {
    chunks.push(normalized.slice(index, index + size));
  }
  return chunks;
}

function parsePayload(rawPayload) {
  try {
    return JSON.parse(String(rawPayload || "{}"));
  } catch (_error) {
    return {};
  }
}

function collectFiles(formData) {
  return formData
    .getAll("files")
    .filter((file) => file && typeof file.arrayBuffer === "function");
}

function parseJsonText(text) {
  const normalized = String(text || "").trim();
  if (!normalized) {
    return null;
  }

  try {
    return JSON.parse(normalized);
  } catch (_error) {
    const match = normalized.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch (_innerError) {
      return null;
    }
  }
}

function normalizeDeckCards(cards) {
  return (Array.isArray(cards) ? cards : [])
    .map((card) => ({
      front: cleanText(card?.front || card?.question || ""),
      back: cleanText(card?.back || card?.answer || ""),
      hint: cleanText(card?.hint || ""),
      topic: cleanText(card?.topic || ""),
      tags: normalizeTags(card?.tags),
      note: cleanText(card?.note || ""),
      example: cleanText(card?.example || ""),
      sourceLabel: cleanText(card?.sourceLabel || ""),
      sourcePage: toNullableNumber(card?.sourcePage),
      evidenceSnippet: cleanText(card?.evidenceSnippet || card?.evidence || ""),
      confidence: clampNumber(card?.confidence, 0, 1, 0),
    }))
    .filter((card) => card.front && card.back);
}

function normalizeQuizItems(items, mode) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      prompt: cleanText(item?.prompt || item?.question || ""),
      answer: cleanText(item?.answer || ""),
      explanation: cleanText(item?.explanation || item?.note || ""),
      topic: cleanText(item?.topic || ""),
      tags: normalizeTags(item?.tags),
      sourceIndex: clampNumber(item?.sourceIndex || item?.sourceCardIndex, 1, 999, 1),
      sourceLabel: cleanText(item?.sourceLabel || ""),
      sourcePage: toNullableNumber(item?.sourcePage),
      evidenceSnippet: cleanText(item?.evidenceSnippet || item?.evidence || ""),
      confidence: clampNumber(item?.confidence, 0, 1, 0),
      options:
        mode === "choice"
          ? (Array.isArray(item?.options) ? item.options : [])
              .map((option) => ({
                label: cleanText(option?.label || option?.text || option || ""),
                isCorrect: Boolean(option?.isCorrect),
              }))
              .filter((option) => option.label)
              .slice(0, 4)
          : [],
    }))
    .filter((item) => item.prompt && item.answer);
}

function normalizeQuestionMatches(questionMatches) {
  return (Array.isArray(questionMatches) ? questionMatches : [])
    .map((entry) => ({
      questionId: cleanText(entry?.questionId || entry?.id || ""),
      label: cleanText(entry?.label || entry?.questionLabel || ""),
      matches: (Array.isArray(entry?.matches) ? entry.matches : [])
        .map((match) => ({
          sourceName: cleanText(match?.sourceName || match?.sourceLabel || ""),
          pageNumber: toNullableNumber(match?.pageNumber || match?.sourcePage) || 1,
          evidenceSnippet: cleanText(match?.evidenceSnippet || match?.snippet || ""),
          reason: cleanText(match?.reason || ""),
          confidence: clampNumber(match?.confidence, 0, 1, 0),
          matchedTokens: normalizeTags(match?.matchedTokens || []).slice(0, 8),
          coverage: clampNumber(match?.coverage, 0, 1, 0),
          score: Number(match?.score || 0),
        }))
        .filter((match) => match.sourceName && match.evidenceSnippet),
    }))
    .filter((entry) => entry.questionId || entry.label);
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function handleAiError(error) {
  const status = Number(error?.status || 500);
  const code = String(error?.code || "AI_REQUEST_FAILED");
  const message = String(error?.message || "AI generation failed.");
  return jsonResponse({ code, error: message }, status);
}

function createAiError(code, message, status = 500) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

function cleanText(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_PROMPT_CHARS);
}

function normalizeTags(value) {
  const list = Array.isArray(value) ? value : String(value || "").split(/[,\n、，]/);
  return [...new Set(list.map((item) => cleanText(item)).filter(Boolean))].slice(0, 8);
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

function toNullableNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferMimeType(fileName) {
  const lower = String(fileName || "").toLowerCase();
  if (lower.endsWith(".pdf")) {
    return "application/pdf";
  }
  if (lower.endsWith(".txt")) {
    return "text/plain";
  }
  if (lower.endsWith(".md")) {
    return "text/markdown";
  }
  return "";
}

function trimPrompt(value) {
  return String(value || "").slice(0, MAX_PROMPT_CHARS);
}
