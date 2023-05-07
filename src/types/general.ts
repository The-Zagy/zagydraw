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

enum CursorFn {
    Default,
    Drag,
    Rect,
    Line
}

export type {
    CanvasElement,
    CanvasLineElement,
    CanvasRoughElement,
    CanvasRectElement,
    ElementTypes,
    Position
};
export { CursorFn };