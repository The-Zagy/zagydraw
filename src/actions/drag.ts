import { Command } from "./types";
import { useStore } from "@/store";
import { CursorFn } from "@/types/general";
import { Point } from "@/utils";

class DragAction {
    private static lastMouseDownPosition: Point = [0, 0];
    private static _start(coords: Point) {
        const { cursorFn } = useStore.getState();
        if (cursorFn !== CursorFn.Drag) return;
        this.lastMouseDownPosition = coords;
    }
    private static _inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
        const { isMouseDown, cursorFn, position, setPosition } = useStore.getState();
        if (!(isMouseDown && canvas && cursorFn === CursorFn.Drag)) return;
        const [x, y] = coords;
        // calculate how far the mouse has been moved
        const walkX = x - this.lastMouseDownPosition[0];
        const walkY = y - this.lastMouseDownPosition[1];
        // set the mouse position to the current position
        this.lastMouseDownPosition = [x, y];
        setPosition({ x: position.x + walkX, y: position.y + walkY });
    }
    public static start(...args: Parameters<typeof DragAction._start>): Command {
        return {
            execute: () => {
                this._start(...args);
            },
        };
    }
    public static inProgress(...args: Parameters<typeof DragAction._inProgress>): Command {
        return {
            execute: () => {
                this._inProgress(...args);
            },
        };
    }
}

export default DragAction;
