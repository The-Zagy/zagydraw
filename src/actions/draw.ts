import { randomSeed } from "roughjs/bin/math";
import { UndoableCommand } from "./types";

import { useStore } from "@/store";
import { CursorFn, ZagyShape } from "@/types/general";
import { Point, normalizeToGrid } from "@/utils";
import { ZagyHandDrawn, ZagyLine, ZagyRectangle } from "@/utils/canvas/shapes";

class DrawAction {
    private static currentSeed = randomSeed();
    private static currentlyDrawnFreeHand: Point[] = [];
    private static lastMouseDownPosition: Point = [0, 0];
    private static lastMouseUpPosition: Point = [0, 0];
    private static _start(coords: Point) {
        const { cursorFn, getPosition } = useStore.getState();
        const position = getPosition();
        const startX = coords[0];
        const startY = coords[1];
        if (cursorFn === CursorFn.Rect) {
            const norm = normalizeToGrid(position, coords);
            this.lastMouseDownPosition = norm;
        } else if (cursorFn === CursorFn.Line) {
            const norm = normalizeToGrid(position, coords);
            this.lastMouseDownPosition = norm;
        } else if (cursorFn === CursorFn.FreeDraw) {
            this.currentlyDrawnFreeHand = [[startX - position.x, startY - position.y]];
        }
    }
    private static _inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
        const { cursorFn, isMouseDown, getPosition, setPreviewElement, zoomLevel } =
            useStore.getState();
        const position = getPosition();
        if (isMouseDown && canvas) {
            // if (!roughCanvas.current) return;
            const [x, y] = coords;
            const norm = normalizeToGrid(position, coords);
            this.lastMouseUpPosition = norm;
            if (cursorFn === CursorFn.Rect) {
                try {
                    const rect = new ZagyRectangle({
                        point1: this.lastMouseDownPosition,
                        point2: this.lastMouseUpPosition,
                        seed: this.currentSeed,
                        zoom: zoomLevel,
                    });
                    setPreviewElement(rect);
                } catch (_) {
                    return;
                }
            } else if (cursorFn === CursorFn.Line) {
                const line = new ZagyLine({
                    point1: this.lastMouseDownPosition,
                    point2: this.lastMouseUpPosition,
                    seed: this.currentSeed,
                    zoom: zoomLevel,
                });
                setPreviewElement(line);
            } else if (cursorFn === CursorFn.FreeDraw) {
                this.currentlyDrawnFreeHand = [
                    ...this.currentlyDrawnFreeHand,
                    [x - position.x, y - position.y],
                ];
                const handDrawnElement = new ZagyHandDrawn({
                    paths: this.currentlyDrawnFreeHand,
                    zoom: zoomLevel,
                });
                setPreviewElement(handDrawnElement);
            }
        }
    }
    public static start(...args: Parameters<typeof DrawAction._start>) {
        return {
            execute: () => {
                this._start(...args);
            },
        };
    }
    public static inProgress(...args: Parameters<typeof DrawAction._inProgress>) {
        return {
            execute: () => {
                this._inProgress(...args);
            },
        };
    }
    public static end(): UndoableCommand | null {
        const insertedElements: ZagyShape[] = [];
        const { cursorFn } = useStore.getState();
        if (
            cursorFn !== CursorFn.Rect &&
            cursorFn !== CursorFn.Line &&
            cursorFn !== CursorFn.FreeDraw
        )
            return null;
        if (
            this.lastMouseUpPosition[0] === 0 &&
            this.lastMouseUpPosition[1] === 0 &&
            this.currentlyDrawnFreeHand.length === 0
        )
            return null;
        return {
            execute: () => {
                const { cursorFn, setPreviewElement, zoomLevel } = useStore.getState();
                setPreviewElement(null);
                let el: ZagyShape | null = null;
                if (cursorFn === CursorFn.Line) {
                    const line = new ZagyLine({
                        point1: this.lastMouseDownPosition,
                        point2: this.lastMouseUpPosition,
                        seed: this.currentSeed,
                        zoom: zoomLevel,
                    });
                    el = line;
                    this.currentSeed = randomSeed();
                } else if (cursorFn === CursorFn.Rect) {
                    try {
                        const rect = new ZagyRectangle({
                            point1: this.lastMouseDownPosition,
                            point2: this.lastMouseUpPosition,
                            seed: this.currentSeed,
                            zoom: zoomLevel,
                        });
                        el = rect;

                        this.currentSeed = randomSeed();
                    } catch (_) {
                        return;
                    }
                } else if (cursorFn === CursorFn.FreeDraw) {
                    const handDrawnElement = new ZagyHandDrawn({
                        paths: this.currentlyDrawnFreeHand,
                        zoom: zoomLevel,
                    });
                    el = handDrawnElement;
                    this.currentlyDrawnFreeHand = [];
                }
                if (el !== null) {
                    insertedElements.push(el);
                    const { setElements } = useStore.getState();

                    setElements((prev) => [...prev, el as ZagyShape]);
                }
                this.lastMouseDownPosition = [0, 0];
                this.lastMouseUpPosition = [0, 0];
            },
            undo: () => {
                const { setElements } = useStore.getState();
                const ids = new Set<string>();
                for (const itm of insertedElements) {
                    ids.add(itm.id);
                }
                setElements((prev) => prev.filter((itm) => !ids.has(itm.id)));
            },
        };
    }
}

export default DrawAction;
