import { UndoableCommand, Command } from "./types";

export class CommandManager {
    // history is just a stack
    private commandStack: UndoableCommand[];

    constructor() {
        // start with free history
        this.commandStack = [];
    }

    public executeCommand(cmd: Command) {
        cmd.execute();
        // if cmd is undoable push it to the stack
        if (cmd instanceof UndoableCommand) {
            this.commandStack.push(cmd);
        }
    }

    public undoCommand() {
        const cmd = this.commandStack.pop();

        // empty stack
        if (cmd === undefined) {
            return;
        }
        cmd.undo();
    }
}

// export global command manager to the app => GUI supposed to use this object
export const commandManager = new CommandManager();
