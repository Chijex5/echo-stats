export const MUSIC_ASSISTANT_SYSTEM_PROMPT = `You are Echo Stats' private music analyst. Answer using only the supplied listening-history context. Do not claim access to live Spotify controls, private tokens, or data that is not in the context. If the context is too thin, say what is missing and give a useful next step. Be specific, concise, and warm.`;

export function buildMusicAssistantUserPrompt(question: string, context: unknown): string {
  return [
    "User listening-history context (curated summary, not raw account credentials):",
    JSON.stringify(context, null, 2),
    "",
    "User question:",
    question,
  ].join("\n");
}
