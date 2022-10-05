export default function checkForLosers(
  dice: Record<string, number[]>
): string | null {
  for (const id in dice) {
    if (dice[id].length === 0) {
      return id;
    }
  }

  return null;
}
