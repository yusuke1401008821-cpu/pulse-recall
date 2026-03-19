const DEFAULT_PROVIDER = "gemini";
const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const MAX_INLINE_FILE_BYTES = 4 * 1024 * 1024;
const MAX_PROMPT_CHARS = 180000;

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
  const fileParts = await buildFileParts(files);

  if (!fileParts.length && !pastedText) {
    throw createAiError("INVALID_INPUT", "No source document was provided.", 400);
  }

  const prompt = trimPrompt(`
あなたは医学部学習と英語学習用の暗記カード作成アシスタントです。
与えられた資料だけを根拠に、保存前レビュー用のカード候補を作ってください。

条件:
- deckName: ${deckName || "未指定"}
- focus: ${focus || "general"}
- subject: ${subject || "未指定"}
- limit: ${limit}
- instructions: ${instructions || "特記事項なし"}
- 事実を補わない
- 資料に書かれていない知識は作らない
- 医学用語は簡潔に、英語なら例文や語法があれば優先する
- 出典が曖昧なら confidence を下げる
- evidenceSnippet は短く、資料中の根拠をそのまま抜き出す
- sourcePage がわからない場合は null にする

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

本文テキスト:
${pastedText || "(PDFまたはファイルを参照)"}
  `);

  const data = await callGeminiJson({
    apiKey,
    model,
    prompt,
    fileParts,
  });

  return {
    sourceLabel: cleanText(data.sourceLabel || sourceName),
    cards: normalizeDeckCards(data.cards),
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

  const data = await callGeminiJson({ apiKey, model, prompt });
  return {
    quizItems: normalizeQuizItems(data.quizItems, mode),
  };
}

async function handleQuestionSlideRefine({ apiKey, model, payload }) {
  const questions = Array.isArray(payload.questions) ? payload.questions.slice(0, 24) : [];
  const candidatePages = Array.isArray(payload.candidatePages) ? payload.candidatePages.slice(0, 18) : [];
  if (!questions.length || !candidatePages.length) {
    throw createAiError("INVALID_INPUT", "Questions or slide candidates are missing.", 400);
  }

  const prompt = trimPrompt(`
あなたは過去問と講義スライドの対応づけを手伝う学習アシスタントです。
与えられた候補ページだけを使って、各設問に近いスライド候補を最大3件返してください。

条件:
- questionMatches は questions の label ごとに返す
- matches がない設問は空配列
- confidence は 0 から 1
- reason は「なぜそのスライド候補なのか」を1文で簡潔に
- evidenceSnippet は candidatePages の本文から短く抜粋
- 事実を補わない

返答は JSON のみ:
{
  "questionMatches": [
    {
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
${JSON.stringify(questions)}

candidatePages:
${JSON.stringify(candidatePages)}
  `);

  const data = await callGeminiJson({ apiKey, model, prompt });
  return {
    questionMatches: normalizeQuestionMatches(data.questionMatches),
  };
}

async function callGeminiJson({ apiKey, model, prompt, fileParts = [] }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [...fileParts, { text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const upstream = data?.error || {};
    const code = upstream.status === "RESOURCE_EXHAUSTED" ? "FREE_TIER_EXCEEDED" : "AI_REQUEST_FAILED";
    const status = upstream.status === "RESOURCE_EXHAUSTED" ? 429 : response.status || 500;
    throw createAiError(code, upstream.message || "Gemini request failed.", status);
  }

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((part) => String(part?.text || ""))
    .join("\n")
    .trim();
  const parsed = parseJsonText(text);
  if (!parsed || typeof parsed !== "object") {
    throw createAiError("AI_BAD_RESPONSE", "Gemini returned an unreadable response.", 502);
  }
  return parsed;
}

async function buildFileParts(files) {
  const parts = [];

  for (const file of files || []) {
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
      label: cleanText(entry?.label || entry?.questionLabel || ""),
      matches: (Array.isArray(entry?.matches) ? entry.matches : [])
        .map((match) => ({
          sourceName: cleanText(match?.sourceName || match?.sourceLabel || ""),
          pageNumber: toNullableNumber(match?.pageNumber || match?.sourcePage) || 1,
          evidenceSnippet: cleanText(match?.evidenceSnippet || match?.snippet || ""),
          reason: cleanText(match?.reason || ""),
          confidence: clampNumber(match?.confidence, 0, 1, 0),
        }))
        .filter((match) => match.sourceName && match.evidenceSnippet),
    }))
    .filter((entry) => entry.label);
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
