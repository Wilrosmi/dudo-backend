import { IGameState } from "../types";
import { IPlayerState } from "../types";

export default function getUsersGameState(
  state: IGameState,
  id: string
): IPlayerState {
  const userObject: IPlayerState = {
    dice: {},
    bid: state.bid,
    turn: state.players[state.order[state.turn]],
  };

  if (state.dice[id]) {
    userObject.dice[state.players[id]] = state.dice[id];
  }
  for (const playerID in state.dice) {
    if (playerID !== id) {
      userObject.dice[state.players[playerID]] = [state.dice[playerID].length];
    }
  }
  return userObject;
}
