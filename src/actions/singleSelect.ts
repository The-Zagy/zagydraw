import { useStore } from "store";
import { CursorFn } from "types/general";
import { Point, getHitElement } from "utils";

class SingleSelectAction {
    private static _inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { cursorFn, getPosition, visibleElements, setSelectedElements } = useStore.getState();
        const position = getPosition();

        if (cursorFn !== CursorFn.Default && cursorFn !== CursorFn.Move) return;
        console.log("SingleSelectAction", coords, position);
        console.log("visible", visibleElements);
        const el = getHitElement(visibleElements, ctx, coords, position);
        console.log(el);
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
