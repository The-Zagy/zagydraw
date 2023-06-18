import { useStore } from "store";
import { CursorFn } from "types/general";
import { Point, getHitElement } from "utils";

class SingleSelectAction {
    private static _inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { cursorFn, position, visibleElements, setSelectedElements } = useStore.getState();
        if (cursorFn !== CursorFn.Default) return;
        const el = getHitElement(visibleElements, ctx, coords, position);
        if (el !== null) {
            setSelectedElements(() => [el]);
        } else {
            setSelectedElements(() => []);
        }
    }
    public static inProgress(...args: Parameters<typeof SingleSelectAction._inProgress>) {
        return {
            execute: () => {
                this._inProgress(...args);
            },
        };
    }
}

export default SingleSelectAction;
