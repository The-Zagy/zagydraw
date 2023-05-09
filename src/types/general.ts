import { Drawable } from "roughjs/bin/core";
import { Color } from "./util";


type ElementTypes = "rectangle" | "line" | "text" | "handdrawn";

enum FontTypeOptions {
    code,
    hand,
    minecraft

}
type FillStyleOptions=
    "solid"|
    "zigzag"|
    "dots"|
    "hachure"

interface SharedOptions   {
    opacity?: number;
    stroke: Color;
}
type StrokeLineDash = 1 | 3 | 5;
type StrokeWidth = 1 | 3 | 6;
type FontSize = 16 | 24 | 32 | 48;
interface RoughDrawableOptions extends SharedOptions {
    strokeWidth: number;
    strokeLineDash:StrokeLineDash ;
}
interface RectOptions extends RoughDrawableOptions {
    fill: Color;
    fillStyle: FillStyleOptions;
    
}
interface LineOptions extends RoughDrawableOptions {
    fill: Color;
    fillStyle: FillStyleOptions;}

interface TextOptions extends SharedOptions {
    font:FontTypeOptions
    fontSize:FontSize
}
type GlobalConfigOptions = TextOptions & RectOptions & LineOptions &  {
    cursorFn: CursorFn;
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
    GlobalConfigOptions,
    CanvasHandDrawnElement,
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
export { CursorFn,FontTypeOptions };
