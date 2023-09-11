import { Command, UndoableCommand } from "./types";
import { ZagyShape, isImage } from "@/types/general";
import { useStore } from "@/store/index";
import { CursorFn } from "@/types/general";
import { Point, getHitElement } from "@/utils";

class DeleteAction {
    private static willDelete = false;
    private static _inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
        if (!canvas) return;
        const { cursorFn, isMouseDown } = useStore.getState();
        if (!(cursorFn === CursorFn.Erase && isMouseDown)) return;
        const { setElements, visibleElements, getPosition } = useStore.getState();
        const position = getPosition();
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const el = getHitElement(visibleElements, coords, position);
        if (el !== null) {
            this.willDelete = true;
            setElements((prev) =>
                prev.map((val) => {
                    if (val.id === el.id) {
                        val.willDelete = true;
                    }
                    return val;
                }),
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
        const { cursorFn } = useStore.getState();
        if (cursorFn !== CursorFn.Erase) return null;
        if (!this.willDelete) return null;
        const { elements } = useStore.getState();
        const idSet = new Set();
        const deletedElements: ZagyShape[] = elements.filter(
            (val) => val.willDelete && !(isImage(val) && val.isImageLoading()),
        );
        deletedElements.forEach((val) => {
            idSet.add(val.id);
            val.willDelete = false;
        });
        if (deletedElements.length === 0) return null;
        return {
            execute: () => {
                const { setElements } = useStore.getState();
                setElements((prev) => prev.filter((val) => !idSet.has(val.id)));
                return;
            },
            undo: () => {
                const { setElements } = useStore.getState();
                setElements((prev) => [...prev, ...deletedElements]);
            },
        };
    }
}
export default DeleteAction;
