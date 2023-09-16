import z from "zod";

export const ClientServerMsgs = {
    /**
     * request to create room
     */
    "room:create": 0,
    /**
     * request to join room
     */
    "room:join": 1,
    /**
     * current scene state on the user device
     */
    "self:state": 2,
} as const;

export const ServerClientMsgs = {
    "room:created": 0,
    /**
     * infrom user that they joined room,and send them the current state
     */
    "self:joined": 1,
    /**
     * inform users in the room the metadata of the new user
     */
    "user:joined": 2,
    /**
     * request user canvas state
     */
    "get:self:state": 3,
    /**
     * inform the user to use this new state
     */
    "post:self:state": 4,
} as const;

// It requires an extra line to pull out the values
export type ClientServerMsgs = (typeof ClientServerMsgs)[keyof typeof ClientServerMsgs];

export type ServerClientMsgs = (typeof ServerClientMsgs)[keyof typeof ServerClientMsgs];

const common = z.object({ name: z.string(), color: z.string() });
export const roomCreateSchema = z.object({
    msg: z.literal("room:create"),
    data: common,
});
export const roomJoinSchema = z.object({
    msg: z.literal("room:join"),
    data: common.extend({ roomId: z.string().nonempty() }),
});

export const ClintServerEventsSchema = z.discriminatedUnion("msg", [
    roomCreateSchema,
    roomJoinSchema,
]);

export const ServerClientEventsSchema = z.discriminatedUnion("msg", [
    //TODO, REMOVE THIS
    roomCreateSchema,
]);

export type EventSchema = z.infer<typeof ClintServerEventsSchema>;
