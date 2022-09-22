import * as cors from "cors";
import * as express from "express";
import * as http from "http";
import { Server, Socket } from "socket.io";

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket: Socket) => {
    console.log("Got a connection.  Registering handlers...");

    //useful for debugging
    socket.onAny((tag: string, ...otherArgs) =>
        console.log("Received: ", tag, otherArgs, "(generic handler)")
    );

    // socket.on("sayToOthers", (msg: string) => {
    //     //Sends to all connected, EXCEPT not to this socket, s
    //     socket.broadcast.emit("chat", { from: socket.id, msg: msg });
    // });
});

const port = process.env.PORT ?? 4000;
//important: call listen on the *server*, not the `app` directly.
server.listen(port, () => {
    console.log("socketio and express server listening on *:" + port);
});
