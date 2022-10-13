export interface IPlayerState {
  dice: Record<string, number[]>;
  bid: {
    maker: string;
    value: [number, number];
  };
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
  bid: who made the bid and value of the bid in the form [quantity, type of dice/value]
  order: order of the players in the game that the turns go through
}}
*/
export interface IGameState {
  dice: Record<string, number[]>;
  turn: number;
  bid: {
    maker: string;
    value: [number, number];
  };
  order: string[];
  players: Record<string, string>;
  started: boolean;
}

export interface IState {
  viewGame: (gameID: string) => IGameState;
  viewAllGameIds: () => string[];
  createGame: (gameID: string, socketID: string, username: string) => void;
  addPlayerToGame: (gameID: string, socketID: string, username: string) => void;
  rollDice: (gameID: string) => void;
  removeDie: (gameID: string, socketID: string) => void;
  updateBid: (
    gameID: string,
    newBid: { maker: string; value: [number, number] }
  ) => void;
  updateTurn: (gameID: string, movement: 1 | -1) => void;
  removePlayerFromGame: (
    gameID: string,
    playerID: string,
    lookup: Record<string, string>
  ) => void;
  startGame: (gameID: string) => void;
  endGame: (gameID: string) => void;
}

export interface IDecision {
  gameID: string;
  decisionType: "raise" | "call";
  bid?: {
    maker: string;
    value: [number, number];
  };
}
