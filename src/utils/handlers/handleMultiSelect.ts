import { RoughGenerator } from "roughjs/bin/generator";
import { useStore } from "store";
import { CursorFn, ZagyCanvasRectElement } from "types/general";
import { Point, isElementInRect, normalizePos } from "utils";
import { generateSelectRectElement } from "utils/canvas/generateElement";

class MultiSelectHandler {
    private static lastMouseUpPosition: Point = [0, 0];
    private static lastMouseDownPosition: Point = [0, 0];
    private static roughGenerator = new RoughGenerator();
    public static start(coords: Point) {
        const { cursorFn, position } = useStore.getState();
        if (cursorFn === CursorFn.Default) {
            console.log("in select start");
            const norm = normalizePos(position, coords);
            this.lastMouseDownPosition = norm;
        }
    }
    public static inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
        const { cursorFn, isMouseDown, position, setMultiSelectRect } = useStore.getState();
        if (isMouseDown && canvas && cursorFn === CursorFn.Default) {
            const norm = normalizePos(position, coords);
            this.lastMouseUpPosition = norm;

            const rect: ZagyCanvasRectElement = generateSelectRectElement(
                this.roughGenerator,
                this.lastMouseDownPosition,
                this.lastMouseUpPosition
            );
            setMultiSelectRect(rect);
        }
    }
    public static end() {
        const { visibleElements, setSelectedElements, multiSelectRect, setMultiSelectRect } =
            useStore.getState();
        if (multiSelectRect !== null) {
            const selected = visibleElements.filter((el) => isElementInRect(el, multiSelectRect));
            setSelectedElements(() => selected);
        }
        setMultiSelectRect(null);
    }
}

export default MultiSelectHandler;
