import { ZagyCanvasElement } from "types/general";
import { UndoableCommand } from "./types";
import { useStore } from "store/index";

export class ActionDeleteSelected extends UndoableCommand {
    #selectedElements!: ZagyCanvasElement[];

    public execute() {
        const { setElements, setSelectedElements, elements, selectedElements } =
            useStore.getState();
        this.#selectedElements = selectedElements;
        // remove any elements that exist on selected elements array
        // create hash of ids for easy check while filtring the elements
        const ids = new Set<string>();
        for (const itm of this.#selectedElements) {
            ids.add(itm.id);
        }
        const nextElements = elements.filter((itm) => !ids.has(itm.id));
        setSelectedElements(() => []);
        setElements(() => nextElements);
        return;
    }

    public undo() {
        const { setElements } = useStore.getState();
        setElements((prev) => [...prev, ...this.#selectedElements]);
    }
}