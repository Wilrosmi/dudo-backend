import { IState } from "../types";
import { IAllGameState } from "../types";
import { IGameState } from "../types";

export default function createStateObject(): IState {
  const stateObject: IAllGameState = {};

  function viewGame(gameID: string): IGameState {
    return stateObject[gameID];
  }

  function createGame(
    gameID: string,
    socketID: string,
    username: string
  ): void {
    const newGame: IGameState = {
      dice: { [socketID]: [0, 0, 0, 0, 0] },
      turn: 0,
      order: [socketID],
      bid: {
        maker: "",
        value: [0, 0],
      },
      players: {
        [socketID]: username,
      },
      started: false,
    };
    stateObject[gameID] = newGame;
  }

  function addPlayerToGame(
    gameID: string,
    socketID: string,
    username: string
  ): void {
    stateObject[gameID].dice[socketID] = [0, 0, 0, 0, 0];
    stateObject[gameID].order.push(socketID);
    stateObject[gameID].players[socketID] = username;
  }

  function startGame(gameID: string) {
    stateObject[gameID].started = true;
  }

  function rollDice(gameID: string): void {
    for (const playerDice in stateObject[gameID].dice) {
      for (let i = 0; i < stateObject[gameID].dice[playerDice].length; i++) {
        stateObject[gameID].dice[playerDice][i] = Math.round(
          Math.random() * 6 + 0.5
        );
      }
    }
  }

  function removeDie(gameID: string, socketID: string): void {
    stateObject[gameID].dice[socketID].pop();
  }

  function updateBid(
    gameID: string,
    newBid: { maker: string; value: [number, number] }
  ): void {
    stateObject[gameID].bid = newBid;
  }

  function updateTurn(gameID: string, movement: 1 | -1): void {
    const state = stateObject[gameID];
    const newTurn =
      (state.turn + movement + state.order.length) % state.order.length;
    stateObject[gameID].turn = newTurn;
  }

  function viewAllGameIds(): string[] {
    const outputArray: string[] = [];
    for (const id in stateObject) {
      outputArray.push(id);
    }
    return outputArray;
  }

  function removePlayerFromGame(
    gameID: string,
    playerID: string,
    lookup: Record<string, string>
  ): void {
    const game = stateObject[gameID];
    delete game.dice[playerID];
    delete lookup[playerID];
    const indexOfLoser = game.order.indexOf(playerID);
    if (indexOfLoser < game.turn) {
      game.turn--;
    }
    game.order.splice(indexOfLoser, 1);
  }

  function endGame(gameID: string): void {
    delete stateObject[gameID];
  }

  return {
    viewGame: viewGame,
    viewAllGameIds: viewAllGameIds,
    createGame: createGame,
    addPlayerToGame: addPlayerToGame,
    rollDice: rollDice,
    removeDie,
    updateBid,
    updateTurn,
    removePlayerFromGame,
    startGame,
    endGame,
  };
}
