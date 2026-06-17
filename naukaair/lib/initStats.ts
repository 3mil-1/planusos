import { useAuthStore } from "@/store/useAuthStore";
import { useQuizStore } from "@/store/useQuizStore";

export function maybeLoadStatsFromServer() {
  const auth = useAuthStore.getState();
  const quiz = useQuizStore.getState();
  if (!auth.isHydrated || !quiz.isQuizHydrated || !auth.username) return;
  void quiz.loadAndMergeFromServer(auth.username);
}
