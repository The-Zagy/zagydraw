import { RoughGenerator } from "roughjs/bin/generator";
import { randomSeed } from "roughjs/bin/math";
import { UndoableCommand } from "./types";
import {
    generateCacheLineElement,
    generateCacheRectElement,
    generateCachedHandDrawnElement,
    generateHandDrawnElement,
    generateLineElement,
    generateRectElement,
} from "@/utils/canvas/generateElement";
import { useStore } from "@/store";
import {
    CursorFn,
    ZagyCanvasElement,
    ZagyCanvasLineElement,
    ZagyCanvasRectElement,
} from "@/types/general";
import { Point, normalizeToGrid } from "@/utils";

class DrawAction {
    private static roughGenerator = new RoughGenerator();
    private static currentSeed = randomSeed();
    private static currentlyDrawnFreeHand: Point[] = [];
    private static lastMouseDownPosition: Point = [0, 0];
    private static lastMouseUpPosition: Point = [0, 0];
    private static _start(coords: Point) {
        const { cursorFn, position } = useStore.getState();
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
        const { cursorFn, isMouseDown, position, setPreviewElement } = useStore.getState();
        if (isMouseDown && canvas) {
            // if (!roughCanvas.current) return;
            const [x, y] = coords;
            const norm = normalizeToGrid(position, coords);
            this.lastMouseUpPosition = norm;
            if (cursorFn === CursorFn.Rect) {
                const rect: ZagyCanvasRectElement = generateRectElement(
                    this.roughGenerator,
                    this.lastMouseDownPosition,
                    this.lastMouseUpPosition,
                    { seed: this.currentSeed }
                );
                setPreviewElement(rect);
            } else if (cursorFn === CursorFn.Line) {
                const line: ZagyCanvasLineElement = generateLineElement(
                    this.roughGenerator,
                    this.lastMouseDownPosition,
                    this.lastMouseUpPosition,
                    { seed: this.currentSeed }
                );
                setPreviewElement(line);
            } else if (cursorFn === CursorFn.FreeDraw) {
                this.currentlyDrawnFreeHand = [
                    ...this.currentlyDrawnFreeHand,
                    [x - position.x, y - position.y],
                ];

                setPreviewElement(generateHandDrawnElement(this.currentlyDrawnFreeHand));
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
        const insertedElements: ZagyCanvasElement[] = [];
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
                const { cursorFn, setPreviewElement } = useStore.getState();
                setPreviewElement(null);
                let el: ZagyCanvasElement | null = null;
                if (cursorFn === CursorFn.Line) {
                    const line: ZagyCanvasLineElement = generateCacheLineElement(
                        this.roughGenerator,
                        this.lastMouseDownPosition,
                        this.lastMouseUpPosition,

                        { seed: this.currentSeed }
                    );
                    el = line;
                    this.currentSeed = randomSeed();
                } else if (cursorFn === CursorFn.Rect) {
                    const rect = generateCacheRectElement(
                        this.roughGenerator,
                        this.lastMouseDownPosition,
                        this.lastMouseUpPosition,

                        { seed: this.currentSeed }
                    );
                    if (rect.endX - rect.x < 10 || rect.endY - rect.y < 10) return;

                    el = rect;
                    this.currentSeed = randomSeed();
                } else if (cursorFn === CursorFn.FreeDraw) {
                    const handDrawnElement = generateCachedHandDrawnElement(
                        this.currentlyDrawnFreeHand
                    );
                    el = handDrawnElement;
                    this.currentlyDrawnFreeHand = [];
                }
                if (el !== null) {
                    insertedElements.push(el);
                    const { setElements } = useStore.getState();
                    setElements((prev) => [...prev, el as ZagyCanvasElement]);
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
