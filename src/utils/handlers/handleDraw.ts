import { commandManager } from "actions/commandManager";
import { ActionInsertElements } from "actions/insertElement";
import { RoughGenerator } from "roughjs/bin/generator";
import { randomSeed } from "roughjs/bin/math";
import { useStore } from "store";
import {
    CursorFn,
    ZagyCanvasElement,
    ZagyCanvasLineElement,
    ZagyCanvasRectElement,
} from "types/general";
import { Point, normalizePos, normalizeToGrid } from "utils";
import {
    generateCacheRectElement,
    generateHandDrawnElement,
    generateLineElement,
    generateRectElement,
} from "utils/canvas/generateElement";

class DrawHandler {
    private static roughGenerator = new RoughGenerator();
    private static currentSeed = randomSeed();
    private static currentlyDrawnFreeHand: Point[] = [];
    private static lastMouseDownPosition: Point = [0, 0];
    private static lastMouseUpPosition: Point = [0, 0];
    public static start(coords: Point) {
        const { cursorFn, position, setIsWriting } = useStore.getState();
        const startX = coords[0];
        const startY = coords[1];
        if (cursorFn === CursorFn.Rect) {
            const norm = normalizeToGrid(position, [startX, startY]);
            this.lastMouseDownPosition = norm;
        } else if (cursorFn === CursorFn.Line) {
            const norm = normalizeToGrid(position, [startX, startY]);
            this.lastMouseDownPosition = norm;
        } else if (cursorFn === CursorFn.FreeDraw) {
            this.currentlyDrawnFreeHand = [[startX - position.x, startY - position.y]];
        } else if (cursorFn === CursorFn.Text) {
            const norm = normalizePos(position, [startX, startY]);
            this.lastMouseDownPosition = norm;
            setIsWriting(true);
        }
    }
    public static inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
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
                    {}
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
    public static end() {
        const { cursorFn, setPreviewElement } = useStore.getState();
        setPreviewElement(null);
        let el: ZagyCanvasElement | null = null;
        if (cursorFn === CursorFn.Line) {
            const line: ZagyCanvasLineElement = generateLineElement(
                this.roughGenerator,
                this.lastMouseDownPosition,
                this.lastMouseUpPosition,
                {}
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
            const handDrawnElement = generateHandDrawnElement(this.currentlyDrawnFreeHand);
            el = handDrawnElement;
            this.currentlyDrawnFreeHand = [];
        }
        if (el !== null) {
            commandManager.executeCommand(new ActionInsertElements(el));
        }
    }
}

export default DrawHandler;
