import { useStore } from "store";
import { CursorFn } from "types/general";
import { Point } from "utils";

class DragHandler {
    private static lastMouseDownPosition: Point = [0, 0];
    public static start(coords: Point) {
        const { cursorFn } = useStore.getState();
        if (cursorFn !== CursorFn.Drag) return;
        this.lastMouseDownPosition = coords;
    }
    public static inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
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
}

export default DragHandler;
