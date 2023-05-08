import { Drawable } from "roughjs/bin/core";
import { Color } from "./util";
type ElementTypes = "rectangle" | "line";
interface Position {
    x: number;
    y: number;
}
interface CanvasElement {
    id: string;
    // absolute x and y to GOD
    shape: Drawable["shape"] | ElementTypes;
    x: number;
    y: number;
    color: Color;
    curPos: Position;
}
interface CanvasRoughElement extends CanvasElement, Drawable {}
interface CanvasRectElement extends CanvasRoughElement {
    shape: "rectangle";
    endX: number;
    endY: number;
}

interface CanvasLineElement extends CanvasRoughElement {
    shape: "line";
    endX: number;
    endY: number;
}

interface CanvasHandDrawnElement extends CanvasElement {
    shape: "handdrawn";
    path: Path2D;
}

enum CursorFn {
    Default,
    Drag,
    Rect,
    Line,
    FreeDraw,
    Erase
}

export type {
    CanvasElement,
    CanvasLineElement,
    CanvasRoughElement,
    CanvasRectElement,
    CanvasHandDrawnElement,
    ElementTypes,
    Position
};
export { CursorFn };
