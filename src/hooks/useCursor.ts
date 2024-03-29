import { useEffect } from "react";
import { CursorFn, ZagyCanvasElement } from "@/types/general";

/**
 * hook that set cursor shape according to its current function
 * @param cursorFn
 * @param isMouseDown
 */
export function useCursor(
    cursorFn: CursorFn,
    isMouseDown: boolean,
    currentlyHoveredElement: ZagyCanvasElement | null,
) {
    useEffect(() => {
        switch (cursorFn) {
            case CursorFn.Move:
                document.body.style.cursor = "move";
                break;
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
                if (currentlyHoveredElement) document.body.style.cursor = "move";
                break;
            case CursorFn.FreeDraw:
                document.body.style.cursor = "crosshair";
                break;
            case CursorFn.Text:
                document.body.style.cursor = "text";
                break;
            case CursorFn.Erase:
                document.body.style.cursor = "crosshair";
                break;
            // TODO, enable with implementing resize
            // case CursorFn["Ew-resize"]:
            //     document.body.style.cursor = "ew-resize";
            //     break;
            // case CursorFn["Ns-resize"]:
            //     document.body.style.cursor = "ns-resize";
            //     break;
            // case CursorFn["Nesw-resize"]:
            //     document.body.style.cursor = "nesw-resize";
            //     break;
            // case CursorFn["Nwse-resize"]:
            //     document.body.style.cursor = "nwse-resize";
            //     break;
            default:
                return;
        }
    }, [cursorFn, isMouseDown, currentlyHoveredElement]);
}
