import { useStore } from "store";
import { CursorFn } from "types/general";
import { Point, getHitElement } from "utils";

class SingleSelectHandler {
    public static inProgress(coords: Point, canvas: HTMLCanvasElement | null) {
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
}

export default SingleSelectHandler;
