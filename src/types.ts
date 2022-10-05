export interface IPlayerState {
  dice: Record<string, number[]>;
  bid: [number, number];
  turn: string;
}

export interface IAllGameState {
  [key: string]: IGameState;
}

/*
Stores:
{gameID: {
  dice: {
    socketID: number array of the dice state for that player
  },
  turn: index of the player whos turn it is in the order array
  bid: current bid - first number is the quantity, second is the value
  order: order of the players in the game that the turns go through
}}
*/
export interface IGameState {
  dice: Record<string, number[]>;
  turn: number;
  bid: [number, number];
  order: string[];
  players: Record<string, string>;
}

export interface IState {
  viewGame: (gameID: string) => IGameState;
  viewAllGameIds: () => string[];
  createGame: (gameID: string, socketID: string, username: string) => void;
  addPlayerToGame: (gameID: string, socketID: string, username: string) => void;
  rollDice: (gameID: string) => void;
  removeDie: (gameID: string, socketID: string) => void;
  updateBid: (gameID: string, newBid: [number, number]) => void;
  updateTurn: (gameID: string, movement: 1 | -1) => void;
  removePlayerFromGame: (gameID: string, playerID: string) => void;
}

export interface IDecision {
  gameID: string;
  decisionType: "raise" | "call";
  decisionMaker: string;
  bid?: [number, number];
}
