import { Drawable } from "roughjs/bin/core";
import { Color } from "./util";

type ElementTypes = "rectangle" | "line" | "text" | "handdrawn";
type FontsTypeOption = "code" | "hand" | "minecraft";

enum FillStyleOpts {
    solid,
    zigzag,
    dots,
    hachure
}

type GlobalConfigOpts = {
    opacity: number; // 0 -> 1
    fillStyle: FillStyleOpts;
    stroke: Color;
    fill: Color; // bg
    strokeWidth: 1 | 3 | 6;
    strokeLineDash: 1 | 3 | 5; // stroke
};

interface Position {
    x: number;
    y: number;
}
interface CanvasElement {
    id: string;
    // absolute x and y to GOD
    shape: ElementTypes;
    x: number;
    y: number;
    color: Color;
    curPos: Position;
    // todo make it range from 0 to 1
    opacity: number;
}
type CanvasRoughElement = CanvasElement & Drawable;
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

interface CanvasTextElement extends CanvasElement {
    shape: "text";
    text: string;
    endX: number;
    endY: number;
    font: string; // same as css font prop
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
    Text,
    Erase
}

export type {
    CanvasElement,
    CanvasLineElement,
    CanvasRoughElement,
    CanvasRectElement,
    CanvasTextElement,
    CanvasHandDrawnElement,
    ElementTypes,
    Position
};
export { CursorFn };
