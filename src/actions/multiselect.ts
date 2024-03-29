import { useStore } from "@/store";
import { CursorFn } from "@/types/general";
import { Point, normalizePos } from "@/utils";
import { generateSelectRectElement } from "@/utils/canvas/generateElement";

class MultiSelectAction {
    private static lastMouseUpPosition: Point | null = [0, 0];
    private static lastMouseDownPosition: Point | null = [0, 0];
    private static _start(coords: Point) {
        const { getPosition } = useStore.getState();
        const position = getPosition();
        const norm = normalizePos(position, coords);
        this.lastMouseDownPosition = norm;
    }
    private static _inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
        const { isMouseDown, getPosition, setMultiSelectRect } = useStore.getState();
        const position = getPosition();
        if (isMouseDown && canvas) {
            const norm = normalizePos(position, coords);
            this.lastMouseUpPosition = norm;
            try {
                const rect = generateSelectRectElement(
                    this.lastMouseDownPosition!,
                    this.lastMouseUpPosition,
                );
                setMultiSelectRect(rect);
            } catch (_) {
                // do nothing
            }
        }
    }
    private static _end() {
        const { visibleElements, setSelectedElements, multiSelectRect, setMultiSelectRect } =
            useStore.getState();
        if (multiSelectRect !== null) {
            const selected = visibleElements.filter((el) => multiSelectRect.isElementInside(el));
            setSelectedElements(() => selected);
        }
        this.lastMouseDownPosition = null;
        this.lastMouseUpPosition = null;
        setMultiSelectRect(null);
    }
    public static start(...args: Parameters<typeof MultiSelectAction._start>) {
        const { cursorFn } = useStore.getState();
        if (cursorFn !== CursorFn.Default) return null;
        return {
            execute: () => {
                this._start(...args);
            },
        };
    }
    public static inProgress(...args: Parameters<typeof MultiSelectAction._inProgress>) {
        const { cursorFn } = useStore.getState();
        if (cursorFn !== CursorFn.Default) return null;
        if (!this.lastMouseDownPosition) return null;
        return {
            execute: () => {
                this._inProgress(...args);
            },
        };
    }
    public static end(...args: Parameters<typeof MultiSelectAction._end>) {
        if (!this.lastMouseDownPosition || !this.lastMouseUpPosition) return null;
        return {
            execute: () => {
                this._end(...args);
            },
        };
    }
}

export default MultiSelectAction;
