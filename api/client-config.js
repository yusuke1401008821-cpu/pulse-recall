module.exports = function handler(_request, response) {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  response.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    aiEnabled: Boolean(process.env.GEMINI_API_KEY) && process.env.AI_ENABLED !== "false",
    aiProvider: process.env.AI_PROVIDER || "gemini",
    aiModel: process.env.AI_MODEL || "gemini-2.5-flash-lite",
  });
};
