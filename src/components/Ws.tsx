import { User2 } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const socketReadyStateMap = {
    0: "CONNECTING",
    1: "OPEN",
    2: "CLOSING",
    3: "CLOSED",
} as const;

export type User = {
    id: string;
    name: string;
    color: string;
    roomId: string;
};

function connectWs(
    data: { name: string; color: string },
    setUsers: React.Dispatch<React.SetStateAction<User[]>>,
    options: { join?: string },
) {
    // Create WebSocket connection.
    const socket = new WebSocket("ws://localhost:3000");
    console.log(
        "connecting to ws, state: ",
        socketReadyStateMap[socket.readyState as keyof typeof socketReadyStateMap],
    );
    // Connection opened
    socket.addEventListener("open", () => {
        console.log(
            "connected to ws, state: ",
            socketReadyStateMap[socket.readyState as keyof typeof socketReadyStateMap],
        );
        if (options.join) {
            // TODO, create wrapper around socket.send for "typesafe" and autocompletion while sending events
            socket.send(
                JSON.stringify({
                    msg: "room:join",
                    data: {
                        name: data.name,
                        color: data.color,
                        roomId: options.join,
                    },
                }),
            );
        } else {
            socket.send(
                JSON.stringify({
                    msg: "room:create",
                    data: {
                        name: data.name,
                        color: data.color,
                    },
                }),
            );
        }
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
        console.log("Message from server ", event.data);
        try {
            const parsed = JSON.parse(event.data) as { msg: string; data: any };
            if (parsed.msg === "room:created") {
                console.log("joined room successfully");
            } else if (parsed.msg === "user:joined") {
                setUsers((prev) => [
                    ...prev,
                    {
                        id: parsed.data.id as string,
                        name: parsed.data.name as string,
                        color: parsed.data.color as string,
                        roomId: parsed.data.roomId,
                    },
                ]);
            }
        } catch (e) {
            console.log("error while parsin msg: ", e);
        }
    });
}

export function WsWidget() {
    const [name, setName] = useState("");
    const [color, setColor] = useState("");
    const [roomId, setRoomId] = useState("");
    const [users, setUsers] = useState<User[]>([]);

    return (
        <div className="fixed right-3 top-10">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="fixed right-3 top-4">
                        <User2 size={35} />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Collaboration</DialogTitle>
                    </DialogHeader>
                    <Input
                        type="text"
                        placeholder="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <Input
                        type="text"
                        placeholder="color"
                        value={color}
                        onChange={(event) => setColor(event.target.value)}
                    />
                    <Input
                        value={roomId}
                        onChange={(event) => setRoomId(event.target.value)}
                        placeholder="room id"
                    />
                    <Button
                        onClick={() => {
                            if (name.length < 4 || color.length === 0) return;
                            connectWs({ name, color }, setUsers, {});
                        }}>
                        Start Session
                    </Button>
                    <Button
                        onClick={() => {
                            if (name.length < 4 || roomId.length < 4 || color.length === 0) return;
                            connectWs({ name, color }, setUsers, { join: roomId });
                        }}>
                        Join Session
                    </Button>
                    <p className="text-red-400">
                        name is required for both cases, and roomId is required to join room!
                    </p>
                </DialogContent>
            </Dialog>

            {/*  users in the room*/}
            <div>
                {users.map((user) => {
                    return (
                        <div
                            key={user.id}
                            className={
                                "h-14 w-14 rounded-full border-2 overflow-hidden" +
                                `border-${user.color}-400`
                            }>
                            <img
                                src="https://placehold.co/50x50"
                                className="h-full w-full"
                                title={user.name}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
