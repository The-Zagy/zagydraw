import { Command, UndoableCommand } from "./types";
import { useStore } from "@/store";
import { CursorFn, ZagyShape } from "@/types/general";
import { Point, getHitElement, normalizeToGrid } from "@/utils";

class MoveElementAction {
    private static hitElement: ZagyShape | null = null;
    private static oldPositionStart: Point = [0, 0];
    private static lastMouseDownPosition: Point = [0, 0];
    private static isDragging = false;
    private static _start(pointerCoords: Point) {
        this.lastMouseDownPosition = pointerCoords;
        const { getPosition, visibleElements } = useStore.getState();
        const position = getPosition();
        const hitElement = getHitElement(visibleElements, pointerCoords, position);
        this.hitElement = hitElement;
        if (!hitElement) return;
        const boundingRect = hitElement.getBoundingRect();
        this.oldPositionStart = [boundingRect[0][0], boundingRect[0][1]];
    }
    public static start(pointerCoords: Point, canvas: HTMLCanvasElement | null): Command | null {
        if (!canvas) return null;
        const { cursorFn } = useStore.getState();
        if (cursorFn !== CursorFn.Default && cursorFn !== CursorFn.Move) return null;
        return {
            execute: () => {
                MoveElementAction._start(pointerCoords);
            },
        };
    }

    private static _inProgress(pointerCoords: Point, canvas: HTMLCanvasElement) {
        const { setCursorFn, isMouseDown } = useStore.getState();
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { setElements } = useStore.getState();
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
        const newStart = normalizeToGrid({ x: 0, y: 0 }, [
            this.oldPositionStart[0] + walkX,
            this.oldPositionStart[1] + walkY,
        ]);
        this.hitElement.moveTo(newStart);
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

        // prevent adding move to the history stack if the element only got selected but not moved
        if (!this.isDragging) return null;
        this.isDragging = false;
        if (el === null) return null;
        return {
            execute: () => {
                //do nothing
            },
            undo: () => {
                const { setElements } = useStore.getState();
                el.moveTo(this.oldPositionStart);
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
