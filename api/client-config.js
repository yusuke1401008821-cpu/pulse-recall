module.exports = function handler(_request, response) {
  const hasSupabaseAuth = Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  );

  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  response.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    // Keep Google visible once Supabase auth is connected, even if an older
    // deployment still has the temporary AUTH_GOOGLE_ENABLED=false flag.
    authGoogleEnabled:
      hasSupabaseAuth &&
      process.env.AUTH_GOOGLE_ENABLED !== "disabled" &&
      process.env.AUTH_GOOGLE_ENABLED !== "0",
    authMagicLinkEnabled: process.env.AUTH_MAGIC_LINK_ENABLED !== "false",
    aiEnabled: Boolean(process.env.GEMINI_API_KEY) && process.env.AI_ENABLED !== "false",
    aiProvider: process.env.AI_PROVIDER || "gemini",
    aiModel: process.env.AI_MODEL || "gemini-2.5-flash-lite",
  });
};
