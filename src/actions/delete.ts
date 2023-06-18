import { ZagyCanvasElement } from "types/general";
import { Command, UndoableCommand } from "./types";
import { useStore } from "store/index";
import { CursorFn } from "types/general";
import { Point, getHitElement } from "utils";

class DeleteAction {
    private static willDelete = false;
    private static _inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
        if (!canvas) return;
        const { cursorFn, isMouseDown } = useStore.getState();
        if (!(cursorFn === CursorFn.Erase && isMouseDown)) return;
        const { setElements, visibleElements, position } = useStore.getState();
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const el = getHitElement(visibleElements, ctx, coords, position);
        if (el !== null) {
            this.willDelete = true;
            setElements((prev) =>
                prev.map((val) => (val.id === el.id ? { ...val, willDelete: true } : val))
            );
        }
    }
    public static inProgress(coords: Point, canvas: HTMLCanvasElement | null): Command {
        return {
            execute: () => {
                this._inProgress(coords, canvas);
            },
        };
    }

    public static end(): UndoableCommand | null {
        let deletedElements: ZagyCanvasElement[] = [];
        const { cursorFn } = useStore.getState();
        if (cursorFn !== CursorFn.Erase) return null;
        return {
            execute: () => {
                if (this.willDelete) {
                    const { elements, setElements } = useStore.getState();
                    deletedElements = elements
                        .filter((val) => val.willDelete)
                        .map((val) => ({ ...val, willDelete: false }));
                    setElements((prev) => prev.filter((val) => !val.willDelete));
                    return;
                }
            },
            undo: () => {
                if (deletedElements.length === 0) return;
                const { setElements } = useStore.getState();
                setElements((prev) => [...prev, ...deletedElements]);
            },
        };
    }
}
export default DeleteAction;
