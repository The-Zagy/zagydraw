import { UndoableCommand } from "./types";
import { ZagyShape, isImage } from "@/types/general";
import { useStore } from "@/store/index";

export class ActionDeleteSelected extends UndoableCommand {
    #selectedElements!: ZagyShape[];

    public execute() {
        const { setElements, setSelectedElements, elements, selectedElements } =
            useStore.getState();
        // if the element is image and still loading don't add it to the history just delete it
        this.#selectedElements = selectedElements.filter(
            (itm) => !(isImage(itm) && itm.isImageLoading()),
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
