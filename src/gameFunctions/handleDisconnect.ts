import { Server } from "socket.io";
import { IState } from "../types";

export default function handleDisconnect(
  gameID: string,
  socketID: string,
  allGameState: IState,
  io: Server,
  lookup: Record<string, string>
): void {
  allGameState.removePlayerFromGame(gameID, socketID, lookup);
  delete lookup[socketID];
  const game = allGameState.viewGame(gameID);
  if (game.order.length === 1) {
    io.in(gameID).emit("gameOver", {
      winner: game.players[game.order[0]],
    });
    allGameState.endGame(gameID);
  }
}
