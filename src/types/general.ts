import { Drawable } from "roughjs/bin/core";

type Point = [number, number];
type ElementTypes = "rectangle" | "line" | "text" | "handdrawn";

const FontTypeOptions = {
    code: "FiraCode",
    hand: "HandWritten",
    minecraft: "Minecraft",
} as const;

type FontTypeOptions = keyof typeof FontTypeOptions;
type FillStyleOptions = "solid" | "zigzag" | "dots" | "hachure";

interface SharedOptions {
    opacity: number;
    stroke: string;

    strokeWidth: StrokeWidth;
}

type StrokeLineDash = number[];
type StrokeWidth = 1 | 3 | 6;
type FontSize = 16 | 24 | 32 | 48;

interface RectOptions extends SharedOptions {
    fill: string;
    fillStyle: FillStyleOptions;
    strokeLineDash: StrokeLineDash;
    seed: number;
}

interface LineOptions extends SharedOptions {
    fill: string;
    fillStyle: FillStyleOptions;
    strokeLineDash: StrokeLineDash;
    seed: number;
}

interface TextOptions extends SharedOptions {
    font: FontTypeOptions;
    fontSize: FontSize;
}

type HanddrawnOptions = SharedOptions;

type GlobalElementOptions = TextOptions & RectOptions & LineOptions;

interface Position {
    x: number;
    y: number;
}
interface CachableElement {
    cache: HTMLCanvasElement;
    cacheCtx: CanvasRenderingContext2D;
}

interface ZagyCanvasElement extends Partial<CachableElement> {
    id: string;
    shape: ElementTypes;
    x: number;
    y: number;
    endX: number;
    endY: number;
    willDelete?: boolean;
    options: SharedOptions;
}
interface ZagyCanvasRoughElement extends ZagyCanvasElement {
    roughElement: Drawable;
}
interface ZagyCanvasRectElement extends ZagyCanvasRoughElement {
    shape: "rectangle";
    options: RectOptions;
}

interface ZagyCanvasLineElement extends ZagyCanvasRoughElement {
    shape: "line";
    options: LineOptions;
    point1: Point;
    point2: Point;
}

interface ZagyCanvasTextElement extends ZagyCanvasElement {
    shape: "text";
    text: string[];
    options: TextOptions;
}

interface ZagyCanvasHandDrawnElement extends ZagyCanvasElement, Partial<CachableElement> {
    shape: "handdrawn";
    path2D: Path2D;
    paths: Point[];
    options: SharedOptions;
}

enum CursorFn {
    Default,
    Drag,
    Rect,
    Line,
    FreeDraw,
    Text,
    Erase,
    Move,
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
    ZagyCanvasRectElement,
    ZagyCanvasTextElement,
    GlobalElementOptions,
    ZagyCanvasHandDrawnElement,
    ElementTypes,
    Position,
    LineOptions,
    RectOptions,
    TextOptions,
    StrokeLineDash,
    StrokeWidth,
    FontSize,
    FillStyleOptions,
    CachableElement,
    HanddrawnOptions,
};
export { CursorFn, FontTypeOptions, isLine, isRect, isText, isHanddrawn };
