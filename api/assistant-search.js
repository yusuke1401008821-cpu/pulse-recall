module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: "OPENAI_API_KEY が未設定です。Vercel の Environment Variables に追加してください。",
      }),
    );
    return;
  }

  let payload;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch (error) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "JSON の読み取りに失敗しました。" }));
    return;
  }

  const question = String(payload.question || "").trim();
  if (!question) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "質問が空です。" }));
    return;
  }

  const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];
  const useWebSearch = Boolean(payload.useWebSearch);
  const deckContext = String(payload.deckContext || "").trim();
  const model = process.env.OPENAI_MODEL || "gpt-5-mini";

  const input = [];

  if (deckContext) {
    input.push({
      role: "developer",
      content: [
        {
          type: "input_text",
          text:
            "以下はユーザーの保存済み学習カードです。まずこの内容を優先して参照し、不足時のみ一般知識やWeb検索を補助的に使ってください。\n\n" +
            deckContext,
        },
      ],
    });
  }

  history.forEach((message) => {
    const role = message.role === "assistant" ? "assistant" : "user";
    const text = String(message.text || "").trim();
    if (!text) {
      return;
    }

    input.push({
      role,
      content: [{ type: "input_text", text }],
    });
  });

  input.push({
    role: "user",
    content: [{ type: "input_text", text: question }],
  });

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions: buildInstructions(useWebSearch),
        input,
        tools: useWebSearch ? [{ type: "web_search" }] : undefined,
        include: useWebSearch ? ["web_search_call.action.sources"] : undefined,
      }),
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      const errorMessage = data?.error?.message || "OpenAI API との通信に失敗しました。";
      res.statusCode = apiResponse.status;
      res.end(JSON.stringify({ error: errorMessage }));
      return;
    }

    const answer = extractAnswerText(data);
    if (!answer) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: "AIの回答本文を取得できませんでした。" }));
      return;
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        answer,
        model,
        sources: collectSources(data),
      }),
    );
  } catch (error) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: "AI検索APIの実行中にエラーが起きました。",
        detail: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

function buildInstructions(useWebSearch) {
  return [
    "あなたは医学部学習と英語学習を支援する検索アシスタントです。",
    "回答は日本語で、見出しを使いすぎず簡潔にまとめてください。",
    "医学内容は学習支援として正確性を重視し、不確かな場合は断定しないでください。",
    "英語学習では必要に応じて例文や使い分けを短く添えてください。",
    useWebSearch
      ? "Web検索を使った場合は、検索由来の内容と一般説明が分かるように自然に書いてください。"
      : "今回はWeb検索を使わず、与えられた文脈と一般知識だけで答えてください。",
  ].join("\n");
}

function extractAnswerText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const chunks = [];
  visitNode(data?.output, (node) => {
    if (node && node.type === "output_text" && typeof node.text === "string") {
      chunks.push(node.text.trim());
    }
  });

  return chunks.filter(Boolean).join("\n").trim();
}

function collectSources(data) {
  const seen = new Set();
  const sources = [];

  visitNode(data?.output, (node) => {
    if (Array.isArray(node?.annotations)) {
      node.annotations.forEach((annotation) => {
        if (annotation?.type !== "url_citation") {
          return;
        }

        const url = String(annotation.url || "").trim();
        if (!url || seen.has(url)) {
          return;
        }

        seen.add(url);
        sources.push({
          title: String(annotation.title || url).trim(),
          url,
        });
      });
    }

    if (!Array.isArray(node?.sources)) {
      return;
    }

    node.sources.forEach((source) => {
      const url = String(source?.url || "").trim();
      if (!url || seen.has(url)) {
        return;
      }

      seen.add(url);
      sources.push({
        title: String(source?.title || url).trim(),
        url,
      });
    });
  });

  return sources.slice(0, 6);
}

function visitNode(node, visitor) {
  if (!node) {
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((item) => visitNode(item, visitor));
    return;
  }

  if (typeof node !== "object") {
    return;
  }

  visitor(node);

  Object.values(node).forEach((value) => {
    if (value && typeof value === "object") {
      visitNode(value, visitor);
    }
  });
}
