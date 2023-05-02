import { Drawable } from "roughjs/bin/core";

export type ElementTypes = "rectangle" | "line";
export interface Position {
    x: number;
    y: number;
}
export interface CanvasElement {
    // absolute x and y to GOD
    shape: Drawable["shape"] | ElementTypes;
    x: number;
    y: number;
    color: Color;
    curPos: Position;
}
export interface CanvasRectElement extends CanvasElement, Drawable {
    shape: "rectangle";
    w: number;
    h: number;
}

export interface CanvasLineElement extends CanvasElement, Drawable {
    shape: "line";
    length: number;
}
