import { ZagyCanvasElement } from "types/general";
import { UndoableCommand } from "./types";
import { useStore } from "store/index";

export class ActionDeleteMarkedElements extends UndoableCommand {
    #deletedElements!: ZagyCanvasElement[];

    public execute() {
        const { elements, setElements } = useStore.getState();

        this.#deletedElements = elements
            .filter((val) => val.willDelete)
            .map((val) => ({ ...val, willDelete: false }));
        setElements((prev) => prev.filter((val) => !val.willDelete));

        return;
    }

    public undo() {
        const { setElements } = useStore.getState();

        setElements((prev) => [...prev, ...this.#deletedElements]);
    }
}
