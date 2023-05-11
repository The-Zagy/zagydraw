import { Drawable } from "roughjs/bin/core";
import { Color } from "./util";

type ElementTypes = "rectangle" | "line" | "text" | "handdrawn";

enum FontTypeOptions {
    code,
    hand,
    minecraft
}
type FillStyleOptions = "solid" | "zigzag" | "dots" | "hachure";

interface SharedOptions {
    opacity: number;
    stroke: Color;
    strokeWidth: number;
    strokeLineDash: StrokeLineDash;
}
type StrokeLineDash = number[];
type StrokeWidth = 1 | 3 | 6;
type FontSize = 16 | 24 | 32 | 48;

interface RectOptions extends SharedOptions {
    fill: Color;
    fillStyle: FillStyleOptions;
    opacity: number;
}

interface LineOptions extends SharedOptions {
    fill: Color;
    fillStyle: FillStyleOptions;
}

interface TextOptions extends SharedOptions {
    font: FontTypeOptions;
    fontSize: FontSize;
}

type GlobalConfigOptions = TextOptions &
    RectOptions &
    LineOptions & {
        cursorFn: CursorFn;
    };

interface Position {
    x: number;
    y: number;
}

interface ZagyCanvasElement {
    id: string;
    shape: ElementTypes;
    x: number;
    y: number;
    curPos: Position;
    willDelete?: boolean;
}

type CanvasRoughElement = ZagyCanvasElement & Drawable & { opacity: number };

interface ZagyCanvasRectElement extends CanvasRoughElement {
    shape: "rectangle";
    endX: number;
    endY: number;
}

interface ZagyCanvasLineElement extends CanvasRoughElement {
    shape: "line";
    endX: number;
    endY: number;
}

interface ZagyCanvasTextElement extends ZagyCanvasElement {
    shape: "text";
    text: string[];
    endX: number;
    endY: number;
    options: TextOptions;
}

interface ZagyCanvasHandDrawnElement extends ZagyCanvasElement {
    shape: "handdrawn";
    path: Path2D;
    options: SharedOptions;
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

function isRect(el: ZagyCanvasElement): el is ZagyCanvasRectElement {
    return el.shape === "rectangle";
}

function isLine(el: ZagyCanvasElement): el is ZagyCanvasLineElement {
    return el.shape === "line";
}

function isText(el: ZagyCanvasElement): el is ZagyCanvasTextElement {
    return el.shape === "text";
}

function isHanddrawn(el: ZagyCanvasElement): el is ZagyCanvasHandDrawnElement {
    return el.shape === "handdrawn";
}

export type {
    ZagyCanvasElement,
    ZagyCanvasLineElement,
    CanvasRoughElement,
    ZagyCanvasRectElement,
    ZagyCanvasTextElement,
    GlobalConfigOptions,
    ZagyCanvasHandDrawnElement,
    ElementTypes,
    Position,
    LineOptions,
    RectOptions,
    TextOptions,
    StrokeLineDash,
    StrokeWidth,
    FontSize,
    FillStyleOptions
};
export { CursorFn, FontTypeOptions, isLine, isRect, isText, isHanddrawn };
