import { RoughGenerator } from "roughjs/bin/generator";
import { UndoableCommand } from "./types";
import { useStore } from "@/store/index";
import {
    generateHandDrawnElement,
    generateImageElement,
    generateLineElement,
    generateRectElement,
    generateTextElement,
} from "@/utils/canvas/generateElement";
import { Point, getBoundingRect, normalizeToGrid } from "@/utils";
import {
    ZagyCanvasElement,
    ZagyPortableT,
    isHanddrawn,
    isImage,
    isLine,
    isRect,
    isText,
    isZagyPortable,
} from "@/types/general";

export class ActionImportElements extends UndoableCommand {
    #importedIds: Set<string>;

    constructor(
        private dataTransfer: DataTransfer,
        private mouseCoords: Point,
        private canvas: HTMLCanvasElement
    ) {
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
    private updateElementsCoords(els: ZagyPortableT["elements"]): void {
        const oldBounding = getBoundingRect(...els);
        console.log("old bounding rect", oldBounding);
        for (const el of els) {
            el.x = this.mouseCoords[0] + (el.x - oldBounding[0][0]);
            el.y = this.mouseCoords[1] + (el.y - oldBounding[0][1]);
            el.endX = this.mouseCoords[0] + (el.endX - oldBounding[1][0]);
            el.endY = this.mouseCoords[1] + (el.endY - oldBounding[1][1]);
            console.log(el);
        }
    }

    public execute() {
        const { setElements, getPosition } = useStore.getState();
        for (const item of this.dataTransfer.items) {
            // if the content is text then we need to check to its structure if we can create ZagyElement from it or not, if not fallback to normal text
            // ignore any files that is not image
            // TODO branch to every possible item we can create from clipboard
            if (item.kind === "file" && item.type.indexOf("image") !== -1) {
                const blob = item.getAsFile();
                if (!blob) return;
                const norm = normalizeToGrid(getPosition(), this.mouseCoords);
                const el = generateImageElement(blob, norm);
                this.#importedIds.add(el.id);
                setElements((prev) => [...prev, el]);
            } else {
                // handle string case, which could be plain text need to be inserted as ZagyText, or json that could be parsed to form ZagyPortableContent
                item.getAsString((pasted) => {
                    // JSON.PARSE could throw, so i depened on the try catch block to move between normal text insert or ZagyElements insert
                    try {
                        const items = JSON.parse(pasted);
                        isZagyPortable(items);
                        const roughGenerator = new RoughGenerator();
                        const ctx = this.canvas.getContext("2d");
                        if (!ctx) return;
                        // we need to keep same structure and order of the copied elements relative to the bounding rect that they were copied from
                        // to do so i will create bounding rect between pasted elements to know each point difference from the original bounding rect
                        // create new bounding rect on the current mouse position, then calc each element new position, element x = newBounding.x + (oldBounding.x - el.x);
                        console.log("found elements", typeof items, items);
                        const oldBounding = getBoundingRect(...items.elements);
                        console.log("old bounding rect", oldBounding);
                        this.updateElementsCoords(items.elements);
                        console.log("after update", items.elements);
                        const elsToPush: ZagyCanvasElement[] = [];
                        for (const el of items.elements) {
                            if (isRect(el)) {
                                elsToPush.push(
                                    generateRectElement(
                                        roughGenerator,
                                        [el.x, el.y],
                                        [el.endX, el.endY],
                                        el.options
                                    )
                                );
                            } else if (isLine(el)) {
                                elsToPush.push(
                                    generateLineElement(
                                        roughGenerator,
                                        [el.x, el.y],
                                        [el.endX, el.endY],
                                        el.options
                                    )
                                );
                            } else if (isText(el)) {
                                elsToPush.push(
                                    generateTextElement(
                                        ctx,
                                        el.text.join("\n"),
                                        [el.x, el.y],
                                        el.options
                                    )
                                );
                            } else if (isHanddrawn(el)) {
                                elsToPush.push(generateHandDrawnElement(el.paths, el.options));
                            } else if (isImage(el)) {
                                // generateImageElement();
                            }
                        }

                        setElements((prev) => [...prev, ...elsToPush]);
                    } catch {
                        console.log("will create text element from", pasted);
                        const ctx = this.canvas.getContext("2d");
                        if (!ctx) return;
                        const textEl = generateTextElement(ctx, pasted, this.mouseCoords);
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
