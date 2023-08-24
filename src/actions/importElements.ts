import { UndoableCommand } from "./types";
import { useStore } from "@/store/index";
import { generateImageElement } from "@/utils/canvas/generateElement";
import { normalizeToGrid } from "@/utils";

export class ActionImportElements extends UndoableCommand {
    #importedIds: Set<string>;
    constructor(private dataTransfer: DataTransfer) {
        super();
        this.#importedIds = new Set();
    }

    public execute() {
        const { setElements, position } = useStore.getState();
        for (const item of this.dataTransfer.items) {
            // if the content is text then we need to check to its structure if we can create ZagyElement from it or not, if not fallback to normal text
            // ignore any files that is not image
            // TODO branch to every possible item we can create from clipboard
            if (item.type.indexOf("image") !== -1) {
                console.log(item.type);
                const blob = item.getAsFile();
                if (!blob) return;
                const norm = normalizeToGrid(position, [30, 40]);
                console.log(`norm image ${norm}`);
                generateImageElement(blob, norm).then((el) => {
                    console.log(`image el ${el}`);
                    this.#importedIds.add(el.id);
                    setElements((prev) => [...prev, el]);
                });
            }
        }
        return;
    }

    public undo() {
        const { setElements } = useStore.getState();
        setElements((prev) => prev.filter((i) => !this.#importedIds.has(i.id)));
    }
}
