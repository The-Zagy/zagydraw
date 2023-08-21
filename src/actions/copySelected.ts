import { Command } from "./types";
import { useStore } from "@/store/index";

export class ActionCopySelected extends Command {
    public async execute() {
        const { selectedElements } = useStore.getState();
        try {
            await navigator.clipboard.writeText(JSON.stringify(selectedElements));
        } catch (e) {
            console.log("🪵 [copySelected.ts:15] ~ token ~ \x1b[0;32me\x1b[0m = ", e);
        }
    }
}
