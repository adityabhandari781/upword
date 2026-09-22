const XP_BY_REVEAL_DIRECTION = {
  'bottom-up': 100,
  'top-down': 75,
  'ends-to-center': 50,
};

export function xpForWin(revealDirection, wrongGuesses) {
  const baseXp = XP_BY_REVEAL_DIRECTION[revealDirection] ?? 0;
  return Math.max(0, baseXp - (20 * Math.max(0, wrongGuesses)));
}

export function levelFromXp(totalXp) {
  return 1 + Math.floor(Math.max(0, totalXp) / 500);
}
