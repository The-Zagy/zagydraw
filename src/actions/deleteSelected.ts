import { ZagyCanvasElement } from "types/general";
import { type Command } from "./types";

export class ActionDeleteSelected implements Command {
    public elements: ZagyCanvasElement[];
    #selectedElements: ZagyCanvasElement[];

    constructor(elements: ZagyCanvasElement[], selectedElements: ZagyCanvasElement[]) {
        this.elements = elements;
        this.#selectedElements = selectedElements;
    }

    public execute() {
        // remove any elements that exist on selected elements array
        // create hash of ids for easy check while filtring the elements
        const ids = new Set<string>();
        for (const itm of this.#selectedElements) {
            ids.add(itm.id);
        }
        const nextElements = this.elements.filter((itm) => !ids.has(itm.id));

        return {
            elements: nextElements,
            selectedElements: [] as ZagyCanvasElement[],
        };
    }
}
