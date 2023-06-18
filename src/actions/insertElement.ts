import { ZagyCanvasElement } from "types/general";
import { UndoableCommand } from "./types";
import { useStore } from "store/index";

export class ActionInsertElements extends UndoableCommand {
    #insertedElements!: ZagyCanvasElement[];
    constructor(...elements: ZagyCanvasElement[]) {
        super();
        this.#insertedElements = elements;
    }

    public execute() {
        const { setElements } = useStore.getState();

        setElements((prev) => [...prev, ...this.#insertedElements]);

        return;
    }

    public undo() {
        const { setElements } = useStore.getState();
        const ids = new Set<string>();
        for (const itm of this.#insertedElements) {
            ids.add(itm.id);
        }
        setElements((prev) => prev.filter((itm) => !ids.has(itm.id)));
    }
}
