import { Server } from "socket.io";
import { IDecision, IState } from "../types";
import checkForLosers from "./checkForLosers";
import getIdFromName from "./getIdFromName";

export default function handleDecision(
  message: IDecision,
  allGameState: IState,
  io: Server,
  lookup: Record<string, string>
): void {
  if (message.decisionType === "call") {
    handleCall(allGameState, message);
  } else {
    handleRaise(allGameState, message);
  }
  dealWithLoser(allGameState, message, io, lookup);
  gameOverCheck(allGameState, message.gameID, io);
}

function handleCall(allGameState: IState, message: IDecision): void {
  const { gameID } = message;
  const state = allGameState.viewGame(gameID);
  const bid = state.bid;
  const decisionMaker = getIdFromName(message.bid?.maker ?? "", state.players);
  if (bid.value[0] <= getNumberOfDiceInGame(bid.value[1], state.dice)) {
    allGameState.removeDie(gameID, decisionMaker);
    allGameState.rollDice(gameID);
    allGameState.updateBid(gameID, { maker: "", value: [0, 0] });
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
    allGameState.updateBid(gameID, { maker: "", value: [0, 0] });
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
  const newBid: { maker: string; value: [number, number] } = {
    maker: message.bid?.maker ? message.bid.maker : "",
    value: message.bid?.value ? message.bid.value : [0, 0],
  };
  message.bid === undefined ? [0, 0] : message.bid;
  const oldBid = allGameState.viewGame(message.gameID).bid;
  if (
    newBid.value[1] > oldBid.value[1] &&
    newBid.value[0] >= 1 &&
    newBid.value[0] <= 6
  ) {
    allGameState.updateBid(message.gameID, newBid);
    allGameState.updateTurn(message.gameID, 1);
  } else if (
    newBid.value[1] === oldBid.value[1] &&
    newBid.value[0] > oldBid.value[0] &&
    newBid.value[0] <= 6
  ) {
    allGameState.updateBid(message.gameID, newBid);
    allGameState.updateTurn(message.gameID, 1);
  }
}

function dealWithLoser(
  allGameState: IState,
  message: IDecision,
  io: Server,
  lookup: Record<string, string>
): void {
  const playerWithNoDice = checkForLosers(
    allGameState.viewGame(message.gameID).dice
  );
  if (playerWithNoDice) {
    io.in(message.gameID).emit("playerLost", {
      name: allGameState.viewGame(message.gameID).players[playerWithNoDice],
    });
    allGameState.removePlayerFromGame(message.gameID, playerWithNoDice, lookup);
  }
}

function gameOverCheck(allGameState: IState, gameID: string, io: Server): void {
  const orderArray = allGameState.viewGame(gameID).order;
  if (orderArray.length === 1) {
    io.in(gameID).emit("gameOver", {
      winner: allGameState.viewGame(gameID).players[orderArray[0]],
    });
    allGameState.endGame(gameID);
  }
}
