export interface Command {
    execute: () => any;
}

export type CommandType = "COPY" | "DELETE";
