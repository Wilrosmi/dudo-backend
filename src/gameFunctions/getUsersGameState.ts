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

  for (const playerID in state.dice) {
    if (playerID !== id) {
      userObject.dice[state.players[playerID]] = [state.dice[playerID].length];
    } else {
      userObject.dice[state.players[playerID]] = state.dice[playerID];
    }
  }
  return userObject;
}
