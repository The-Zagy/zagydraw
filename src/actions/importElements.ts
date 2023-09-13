import { UndoableCommand } from "./types";
import { useStore } from "@/store/index";
import { Point, getBoundingRect, normalizePos, normalizeToGrid } from "@/utils";
import {
    ZagyShape,
    isHanddrawn,
    isImage,
    isLine,
    isRect,
    isText,
    isZagyPortable,
} from "@/types/general";
import { ZagyHandDrawn, ZagyLine, ZagyRectangle, ZagyText, ZagyImage } from "@/utils/canvas/shapes";

export class ActionImportElements extends UndoableCommand {
    #importedIds: Set<string>;

    constructor(private dataTransfer: DataTransfer, private mouseCoords: Point) {
        super();
        this.#importedIds = new Set();
    }

    /**
     * update elements coords inplace
     *
     * we need to keep same structure and order of the copied elements relative to the bounding rect that they were copied from
     * to do so i will create bounding rect between pasted elements to know each point difference from the original bounding rect
     * create new bounding rect on the current mouse position, then calc each element new position, element x = newBounding.x + (oldBounding.x - el.x);
     */
    private updateElementsCoords(els: ZagyShape[]): void {
        const { getPosition } = useStore.getState();
        const newBoundingStart = normalizeToGrid(getPosition(), this.mouseCoords);
        const oldBounding = getBoundingRect(...els);
        for (const el of els) {
            const bounding = el.getBoundingRect();
            const xOffset = bounding[0][0] - oldBounding[0][0];
            const yOffset = bounding[0][1] - oldBounding[0][1];
            el.moveTo([newBoundingStart[0] + xOffset, newBoundingStart[1] + yOffset]);
        }
    }

    public execute() {
        const { setElements, getPosition } = useStore.getState();
        for (const item of this.dataTransfer.items) {
            // if the content is text then we need to check to its structure if we can create ZagyElement from it or not, if not fallback to normal text
            // ignore any files that is not image
            if (item.kind === "file" && item.type.indexOf("image") !== -1) {
                const blob = item.getAsFile();
                if (!blob) return;
                const norm = normalizeToGrid(getPosition(), this.mouseCoords);
                const el = new ZagyImage({ image: blob, point1: norm });
                this.#importedIds.add(el.id);
                setElements((prev) => [...prev, el]);
            } else {
                // handle string case, which could be plain text need to be inserted as ZagyText, or json that could be parsed to form ZagyPortableContent
                item.getAsString((pasted) => {
                    // JSON.PARSE could throw, so i depened on the try catch block to move between normal text insert or ZagyElements insert
                    try {
                        const items = JSON.parse(pasted);
                        isZagyPortable(items);
                        const elsToPush: ZagyShape[] = [];
                        for (const el of items.elements) {
                            if (isRect(el)) {
                                elsToPush.push(new ZagyRectangle(el.options));
                            } else if (isLine(el)) {
                                elsToPush.push(new ZagyLine(el.options));
                            } else if (isText(el)) {
                                elsToPush.push(new ZagyText(el.options));
                            } else if (isHanddrawn(el)) {
                                elsToPush.push(new ZagyHandDrawn(el.options));
                            } else if (isImage(el)) {
                                elsToPush.push(new ZagyImage(el.options));
                            }
                        }
                        // we need to keep same structure and order of the copied elements relative to the bounding rect that they were copied from
                        // to do so i will create bounding rect between pasted elements to know each point difference from the original bounding rect
                        // create new bounding rect on the current mouse position, then calc each element new position, element x = newBounding.x + (oldBounding.x - el.x);
                        this.updateElementsCoords(elsToPush);

                        // append elements to be deleted from the history stack
                        elsToPush.forEach((el) => this.#importedIds.add(el.id));
                        setElements((prev) => [...prev, ...elsToPush]);
                    } catch {
                        const textEl = new ZagyText({
                            text: pasted,
                            point1: normalizePos(getPosition(), this.mouseCoords),
                        });
                        setElements((prev) => [...prev, textEl]);
                    }
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
