import { ZagyCanvasElement } from "types/general";
import { type Command } from "./types";

export class ActionCopySelected implements Command {
    #selectedElements: ZagyCanvasElement[];

    constructor(selectedElements: ZagyCanvasElement[]) {
        this.#selectedElements = selectedElements;
    }

    public async execute() {
        try {
            await navigator.clipboard.writeText(JSON.stringify(this.#selectedElements));
        } catch (e) {
            console.log("🪵 [copySelected.ts:15] ~ token ~ \x1b[0;32me\x1b[0m = ", e);
        }
    }
}
