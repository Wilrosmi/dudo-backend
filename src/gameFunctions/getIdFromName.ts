export default function getIdFromName(
  name: string,
  players: Record<string, string>
): string {
  for (const id in players) {
    if (players[id] === name) {
      return id;
    }
  }
  return "a problem has occured - oops";
}
