import { Command } from "./types";
import { commandManager } from "./commandManager";
import { ActionDeleteSelected } from "./deleteSelected";
import { useStore } from "@/store/index";

export class ActionClearCanvas extends Command {
    public execute() {
        const { setSelectedElements, elements } = useStore.getState();
        setSelectedElements(() => [...elements]);
        commandManager.executeCommand(new ActionDeleteSelected());
        return;
    }
}
