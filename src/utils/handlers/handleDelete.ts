import { commandManager } from "actions/commandManager";
import { ActionDeleteMarkedElements } from "actions/delete";
import { useStore } from "store/index";
import { CursorFn } from "types/general";
import { Point, getHitElement } from "utils";

class DeleteHandler {
    private static willDelete = false;
    public static inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
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
    public static end() {
        if (this.willDelete) {
            commandManager.executeCommand(new ActionDeleteMarkedElements());
            this.willDelete = false;
        }
    }
}

export default DeleteHandler;
