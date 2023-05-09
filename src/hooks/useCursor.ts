import { useEffect } from "react";
import { CursorFn } from "types/general";

/**
 * hook that set cursor shape according to its current function
 * @param cursorFn
 * @param isMouseDown
 */
export default function useCursor(cursorFn: CursorFn, isMouseDown: boolean) {
    useEffect(() => {
        switch (cursorFn) {
            case CursorFn.Drag:
                document.body.style.cursor = "grab";
                if (isMouseDown) document.body.style.cursor = "grabbing";
                break;
            case CursorFn.Rect:
                document.body.style.cursor = "crosshair";
                break;

            case CursorFn.Line:
                document.body.style.cursor = "crosshair";
                break;
            case CursorFn.Default:
                document.body.style.cursor = "default";
                break;
            case CursorFn.FreeDraw:
                document.body.style.cursor = "crosshair";
                break;
            case CursorFn.Text:
                document.body.style.cursor = "text";
                break;
            default:
                return;
        }
    }, [cursorFn, isMouseDown]);
}
