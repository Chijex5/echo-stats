export const MUSIC_ASSISTANT_SYSTEM_PROMPT = `You are Echo Stats' private music analyst. Answer using only the supplied listening-history context. Do not claim access to live Spotify controls, private tokens, or data that is not in the context. If the context is too thin, say what is missing and give a useful next step. Be specific, concise, and warm.

When the user asks to see or fetch specific listening-history rows that are not fully present in the summary, include exactly one hidden command on its own line after a short friendly acknowledgement. Use this format only:
LISTENING-HISTORY://filter:{"duration":"yesterday"}
Supported duration values are "yesterday", "today", "last-7-days", and "last-30-days". Never show command syntax as part of the human-facing response.`;

export function buildMusicAssistantUserPrompt(question: string, context: unknown): string {
  return [
    "User listening-history context (curated summary, not raw account credentials):",
    JSON.stringify(context, null, 2),
    "",
    "User question:",
    question,
  ].join("\n");
}

export function buildCommandResultPrompt(question: string, commandResult: unknown): string {
  return [
    "The backend executed the hidden listening-history command for the user's request.",
    "Summarize these returned tracks clearly and briefly. If there are no tracks, say that no matching imported plays were found.",
    "Do not mention hidden commands or internal protocols.",
    "",
    "Original user question:",
    question,
    "",
    "Command result:",
    JSON.stringify(commandResult, null, 2),
  ].join("\n");
}
