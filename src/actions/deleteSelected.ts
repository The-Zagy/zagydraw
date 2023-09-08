import { UndoableCommand } from "./types";
import { ZagyCanvasElement, ZagyCanvasImageElement } from "@/types/general";
import { useStore } from "@/store/index";

export class ActionDeleteSelected extends UndoableCommand {
    #selectedElements!: ZagyCanvasElement[];

    public execute() {
        const { setElements, setSelectedElements, elements, selectedElements } =
            useStore.getState();
        // if the element is image and still loading to add it to the history just delete it
        this.#selectedElements = selectedElements.filter(
            (itm) =>
                !(
                    itm.shape === "image" &&
                    (itm as ZagyCanvasImageElement).imgRef instanceof Promise
                ),
        );
        // remove any elements that exist on selected elements array
        // create hash of ids for easy check while filtring the elements
        const ids = new Set<string>();
        for (const itm of selectedElements) {
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
