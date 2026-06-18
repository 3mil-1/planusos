import { useAuthStore } from "@/store/useAuthStore";
import { useQuizStore } from "@/store/useQuizStore";

let statsLoadStartedFor: string | null = null;

export function maybeLoadStatsFromServer() {
  const auth = useAuthStore.getState();
  const quiz = useQuizStore.getState();
  if (!auth.username) return;
  if (statsLoadStartedFor === auth.username && quiz.isStatsReady) return;

  statsLoadStartedFor = auth.username;
  void quiz.loadAndMergeFromServer(auth.username);
}
