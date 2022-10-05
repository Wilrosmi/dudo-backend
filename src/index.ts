import * as cors from "cors";
import * as express from "express";
import * as http from "http";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import getUsersGameState from "./gameFunctions/getUsersGameState";
import createStateObject from "./gameFunctions/createStateObject";
import { IState, IDecision } from "./types";
import handleDecision from "./gameFunctions/handleDecision";

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const allGameState: IState = createStateObject();

io.on("connection", (socket: Socket) => {
  console.log("Got a connection.  Registering handlers...");

  //useful for debugging
  socket.onAny((tag: string, ...otherArgs) =>
    console.log("Received: ", tag, otherArgs, "(generic handler)")
  );

  socket.on("createGame", (message: { name: string }) => {
    const gameID = uuidv4();
    socket.join(gameID);
    allGameState.createGame(gameID, socket.id, message.name);
    const state = allGameState.viewGame(gameID);
    socket.emit("gameCreated", {
      id: gameID,
      state: getUsersGameState(state, socket.id),
    });
  });

  socket.on("joinGame", (message: { name: string; gameID: string }) => {
    const { name, gameID } = message;
    if (!allGameState.viewAllGameIds().includes(gameID)) {
      socket.emit("joinFailed", { reason: "gameID doesnt exist" });
    } else {
      const playersInGame = Object.keys(
        allGameState.viewGame(gameID).players
      ).length;
      if (playersInGame === 6) {
        socket.emit("joinFailed", { reason: "game is already full" });
      } else {
        socket.join(gameID);
        allGameState.addPlayerToGame(gameID, socket.id, name);
        const state = allGameState.viewGame(gameID);
        socket.emit("successfulJoin", {
          id: gameID,
          state: getUsersGameState(state, socket.id),
        });
        socket
          .to(gameID)
          .emit("playerJoined", { state: getUsersGameState(state, socket.id) });
      }
    }
  });

  socket.on("startGame", (gameID: string) => {
    const playersInGame = allGameState.viewGame(gameID).order.length;
    if (playersInGame < 2) {
      socket.emit("startFailed", { reason: "not enough players in game" });
    } else {
      allGameState.rollDice(gameID);
      const state = allGameState.viewGame(gameID);
      for (const id in state.players) {
        console.log(id);
        io.to(id).emit("gameStarted", { state: getUsersGameState(state, id) });
      }
    }
  });

  socket.on("decision", (message: IDecision) => {
    handleDecision(message, allGameState, io);
    const state = allGameState.viewGame(message.gameID);
    for (const id in state.players) {
      io.to(id).emit("nextTurn", { state: getUsersGameState(state, id) });
    }
  });
});

const port = process.env.PORT ?? 4000;
//important: call listen on the *server*, not the `app` directly.
server.listen(port, () => {
  console.log("socketio and express server listening on *:" + port);
});
