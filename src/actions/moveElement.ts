import { Command, UndoableCommand } from "./types";
import { constructHandDrawnElementPath2D } from "@/utils/canvas/generateElement";
import { useStore } from "@/store";
import { CursorFn, ZagyCanvasElement, isHanddrawn, isLine } from "@/types/general";
import { Point, getHitElement, normalizeToGrid } from "@/utils";

class MoveElementAction {
    private static hitElement: ZagyCanvasElement | null = null;
    private static oldPositionStart: Point = [0, 0];
    private static oldPositionEnd: Point = [0, 0];
    private static position: { x: number; y: number } = { x: 0, y: 0 };
    private static lastMouseDownPosition: Point = [0, 0];
    private static isDragging = false;
    private static _start(pointerCoords: Point, ctx: CanvasRenderingContext2D) {
        this.lastMouseDownPosition = pointerCoords;
        const { getPosition, visibleElements } = useStore.getState();
        const position = getPosition();
        const hitElement = getHitElement(visibleElements, ctx, pointerCoords, position);
        this.hitElement = hitElement;
        if (!hitElement) return;
        this.oldPositionStart = [hitElement.x + position.x, hitElement.y + position.y];
        this.oldPositionEnd = [hitElement.endX + position.x, hitElement.endY + position.y];
        this.position = position;
    }
    public static start(pointerCoords: Point, canvas: HTMLCanvasElement | null): Command | null {
        if (!canvas) return null;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        const { cursorFn } = useStore.getState();
        if (cursorFn !== CursorFn.Default && cursorFn !== CursorFn.Move) return null;

        return {
            execute: () => {
                MoveElementAction._start(pointerCoords, ctx);
            },
        };
    }

    private static _inProgress(pointerCoords: Point, canvas: HTMLCanvasElement) {
        const { setCursorFn, isMouseDown } = useStore.getState();
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { getPosition, setElements } = useStore.getState();
        const position = getPosition();
        if (!this.isDragging) {
            if (this.hitElement !== null) {
                setCursorFn(CursorFn.Move);
            } else {
                setCursorFn(CursorFn.Default);
            }
        }

        if (this.hitElement === null) return;
        if (!isMouseDown) return;
        this.isDragging = true;
        const walkX = pointerCoords[0] - this.lastMouseDownPosition[0];
        const walkY = pointerCoords[1] - this.lastMouseDownPosition[1];
        const newStart = normalizeToGrid(position, [
            this.oldPositionStart[0] + walkX,
            this.oldPositionStart[1] + walkY,
        ]);
        const newEnd = normalizeToGrid(position, [
            this.oldPositionEnd[0] + walkX,
            this.oldPositionEnd[1] + walkY,
        ]);

        this.hitElement.x = newStart[0];
        this.hitElement.y = newStart[1];
        this.hitElement.endX = newEnd[0];
        this.hitElement.endY = newEnd[1];

        setElements((prev) => {
            const index = prev.findIndex((el) => el.id === this.hitElement!.id);
            const newPrev = [...prev];
            newPrev[index] = this.hitElement!;
            return newPrev;
        });
    }
    public static inProgress(mouseCoords: Point, canvas: HTMLCanvasElement | null): Command | null {
        const { cursorFn } = useStore.getState();
        if ((cursorFn !== CursorFn.Default && cursorFn !== CursorFn.Move) || !canvas) return null;
        return {
            execute: () => {
                MoveElementAction._inProgress(mouseCoords, canvas);
            },
        };
    }
    public static end(): UndoableCommand | null {
        const el = this.hitElement;
        this.hitElement = null;
        const oldPositionStart = [
            this.oldPositionStart[0] - this.position.x,
            this.oldPositionStart[1] - this.position.y,
        ];
        const oldPositionEnd = [
            this.oldPositionEnd[0] - this.position.x,
            this.oldPositionEnd[1] - this.position.y,
        ];
        // prevent adding move to the history stack if the element only got selected but not moved
        if (!this.isDragging) return null;
        this.isDragging = false;
        if (el === null) return null;
        return {
            execute: () => {
                const offsetX = el.x - oldPositionStart[0];
                const offsetY = el.y - oldPositionStart[1];
                if (isHanddrawn(el)) {
                    el.paths = el.paths.map((p) => [p[0] + offsetX, p[1] + offsetY]);
                    el.path2D = constructHandDrawnElementPath2D(el.paths, el.options);
                } else if (isLine(el)) {
                    el.point1 = [el.point1[0] + offsetX, el.point1[1] + offsetY];
                    el.point2 = [el.point2[0] + offsetX, el.point2[1] + offsetY];
                }
            },

            undo: () => {
                const { setElements } = useStore.getState();
                const offsetX = el.x - oldPositionStart[0];
                const offsetY = el.y - oldPositionStart[1];
                if (isHanddrawn(el)) {
                    el.paths = el.paths.map((p) => [p[0] - offsetX, p[1] - offsetY]);
                    el.path2D = constructHandDrawnElementPath2D(el.paths, el.options);
                } else if (isLine(el)) {
                    el.point1 = [el.point1[0] - offsetX, el.point1[1] - offsetY];
                    el.point2 = [el.point2[0] - offsetX, el.point2[1] - offsetY];
                }
                el.x = oldPositionStart[0];
                el.y = oldPositionStart[1];
                el.endX = oldPositionEnd[0];
                el.endY = oldPositionEnd[1];
                setElements((prev) => {
                    const index = prev.findIndex((i) => i.id === el!.id);
                    const newPrev = [...prev];
                    newPrev[index] = el!;
                    return newPrev;
                });
            },
        };
    }
}

export default MoveElementAction;
