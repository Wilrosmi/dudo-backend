import { Server } from "socket.io";
import { IDecision, IState } from "../types";
import checkForLosers from "./checkForLosers";
import getIdFromName from "./getIdFromName";

export default function handleDecision(
  message: IDecision,
  allGameState: IState,
  io: Server
): void {
  if (message.decisionType === "call") {
    handleCall(allGameState, message);
  } else {
    handleRaise(allGameState, message);
  }
  dealWithLoser(allGameState, message, io);
  gameOverCheck(allGameState, message.gameID, io);
}

function handleCall(allGameState: IState, message: IDecision): void {
  const { gameID } = message;
  const state = allGameState.viewGame(gameID);
  const bid = state.bid;
  const decisionMaker = getIdFromName(message.decisionMaker, state.players);
  if (bid[0] <= getNumberOfDiceInGame(bid[1], state.dice)) {
    allGameState.removeDie(gameID, decisionMaker);
    allGameState.rollDice(gameID);
    allGameState.updateBid(gameID, [0, 0]);
  } else {
    console.log(
      state.turn,
      (state.turn - 1 + state.order.length) % state.order.length
    );
    allGameState.removeDie(
      gameID,
      state.order[(state.turn - 1 + state.order.length) % state.order.length]
    );
    allGameState.rollDice(gameID);
    allGameState.updateBid(gameID, [0, 0]);
    allGameState.updateTurn(gameID, -1);
  }
}

function getNumberOfDiceInGame(
  value: number,
  gameDice: Record<string, number[]>
): number {
  let sum = 0;
  for (const playerDice in gameDice) {
    for (const die of gameDice[playerDice]) {
      if (die === value) {
        sum++;
      }
    }
  }
  return sum;
}

function handleRaise(allGameState: IState, message: IDecision): void {
  const newBid: [number, number] =
    message.bid === undefined ? [-1, -1] : message.bid;
  const oldBid = allGameState.viewGame(message.gameID).bid;
  if (newBid[1] > oldBid[1] && newBid[0] >= 1 && newBid[0] <= 6) {
    allGameState.updateBid(message.gameID, newBid);
    allGameState.updateTurn(message.gameID, 1);
  } else if (
    newBid[1] === oldBid[1] &&
    newBid[0] > oldBid[0] &&
    newBid[0] <= 6
  ) {
    allGameState.updateBid(message.gameID, newBid);
    allGameState.updateTurn(message.gameID, 1);
  }
}

function dealWithLoser(
  allGameState: IState,
  message: IDecision,
  io: Server
): void {
  const playerWithNoDice = checkForLosers(
    allGameState.viewGame(message.gameID).dice
  );
  if (playerWithNoDice) {
    io.in(message.gameID).emit("playerLost", {
      name: allGameState.viewGame(message.gameID).players[playerWithNoDice],
    });
    allGameState.removePlayerFromGame(message.gameID, playerWithNoDice);
  }
}

function gameOverCheck(allGameState: IState, gameID: string, io: Server): void {
  const orderArray = allGameState.viewGame(gameID).order;
  if (orderArray.length === 1) {
    io.in(gameID).emit("gameOver", {
      winner: allGameState.viewGame(gameID).players[orderArray[0]],
    });
  }
}
