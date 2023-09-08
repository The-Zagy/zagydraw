import { RoughGenerator } from "roughjs/bin/generator";
import { UndoableCommand } from "./types";
import { useStore } from "@/store/index";
import {
    generateCacheLineElement,
    generateCacheRectElement,
    generateCachedHandDrawnElement,
    generateImageElement,
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
    private updateElementsCoords(els: ZagyPortableT["elements"]): void {
        const { getPosition } = useStore.getState();
        const newBoundingStart = normalizeToGrid(getPosition(), this.mouseCoords);
        const oldBounding = getBoundingRect(...els);
        for (const el of els) {
            const xDiff = el.endX - el.x;
            const yDiff = el.endY - el.y;
            el.x = newBoundingStart[0] + (el.x - oldBounding[0][0]);
            el.y = newBoundingStart[1] + (el.y - oldBounding[0][1]);
            el.endX = el.x + xDiff;
            el.endY = el.y + yDiff;
            if (isLine(el)) {
                el.point1 = [
                    newBoundingStart[0] + (el.point1[0] - oldBounding[0][0]),
                    newBoundingStart[1] + (el.point1[1] - oldBounding[0][1]),
                ];
                el.point2 = [
                    newBoundingStart[0] + (el.point2[0] - oldBounding[0][0]),
                    newBoundingStart[1] + (el.point2[1] - oldBounding[0][1]),
                ];
            } else if (isHanddrawn(el)) {
                el.paths = el.paths.map((path) => [
                    newBoundingStart[0] + (path[0] - oldBounding[0][0]),
                    newBoundingStart[1] + (path[1] - oldBounding[0][1]),
                ]);
            }
        }
    }

    public execute() {
        const { setElements, getPosition, zoomLevel } = useStore.getState();
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
                        // we need to keep same structure and order of the copied elements relative to the bounding rect that they were copied from
                        // to do so i will create bounding rect between pasted elements to know each point difference from the original bounding rect
                        // create new bounding rect on the current mouse position, then calc each element new position, element x = newBounding.x + (oldBounding.x - el.x);
                        this.updateElementsCoords(items.elements);
                        const elsToPush: ZagyCanvasElement[] = [];
                        for (const el of items.elements) {
                            if (isRect(el)) {
                                elsToPush.push(
                                    generateCacheRectElement(
                                        roughGenerator,
                                        [el.x, el.y],
                                        [el.endX, el.endY],
                                        zoomLevel,
                                        el.options,
                                    ),
                                );
                            } else if (isLine(el)) {
                                elsToPush.push(
                                    generateCacheLineElement(
                                        roughGenerator,
                                        el.point1,
                                        el.point2,
                                        zoomLevel,
                                        el.options,
                                    ),
                                );
                            } else if (isText(el)) {
                                elsToPush.push(
                                    generateTextElement(
                                        el.text.join("\n"),
                                        [el.x, el.y],
                                        el.options,
                                    ),
                                );
                            } else if (isHanddrawn(el)) {
                                elsToPush.push(
                                    generateCachedHandDrawnElement(el.paths, zoomLevel, el.options),
                                );
                            } else if (isImage(el) && el.image !== null) {
                                elsToPush.push(
                                    generateImageElement(el.image, [el.x, el.y], el.options),
                                );
                            }
                        }

                        // append elements to be deleted from the history stack
                        elsToPush.forEach((el) => this.#importedIds.add(el.id));
                        setElements((prev) => [...prev, ...elsToPush]);
                    } catch {
                        const textEl = generateTextElement(pasted, this.mouseCoords);
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
