import { Drawable } from "roughjs/bin/core";

import Shape from "@/utils/canvas/shapes/shape";

type Point = [number, number];
type ElementTypes = "rectangle" | "line" | "text" | "handdrawn" | "image";

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
    zoom: number;
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

interface RectRequiredOptions {
    point1: Point;
    point2: Point;
}
interface LineRequiredOptions {
    point1: Point;
    point2: Point;
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
interface TextRequiredOptions {
    text: string;
    point1: Point;
}

type HandDrawnOptions = SharedOptions;
type HandDrawnRequiredOptions = {
    paths: Point[];
};

type ImageOptions = SharedOptions;
type ImageRequiredOptions = {
    /**
     * top left corner of an image
     *
     */
    point1: Point;
    /**
     * A string containing an object URL that can be used to reference the contents of the specified source object(URL.createObjectURL)
     *
     * NOTE: if provided as blob the DataUrl will be loaded from it automatically
     */
    image: string | Blob;
};
/**
 * fields that is needed to describe the image but not required while creating the image and the generator should update those fields
 */
type ImageComputedFields = {
    /**
     * top left corner of an image
     *
     * NOTE: if the image haven't loaded yet will be the point2 for the preview image
     *
     */
    point2: Point;
};

type GlobalElementOptions = TextOptions & RectOptions & LineOptions;

interface Position {
    x: number;
    y: number;
}
interface CachableElement {
    cache: HTMLCanvasElement;
    cacheCtx: CanvasRenderingContext2D;
    zoom: number;
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

interface ZagyCanvasImageElement extends ZagyCanvasElement {
    shape: "image";
    /**
     * A string containing an object URL that can be used to reference the contents of the specified source object(URL.createObjectURL)
     */
    image: string | null;
    // TODO: change to use the cache prop already defined om ZagyElement
    imgRef: Promise<void> | HTMLImageElement;
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
    // TODO, enable when implementing the resize
    // "Ew-resize",
    // "Ns-resize",
    // "Nesw-resize",
    // "Nwse-resize",
}

function isRect(el: ZagyCanvasRectElement): el is ZagyCanvasRectElement {
    return el.shape === "rectangle";
}
function isLine(el: ZagyCanvasLineElement): el is ZagyCanvasLineElement {
    return el.shape === "line";
}
function isText(el: ZagyCanvasTextElement): el is ZagyCanvasTextElement {
    return el.shape === "text";
}
function isHanddrawn(el: ZagyCanvasHandDrawnElement): el is ZagyCanvasHandDrawnElement {
    return el.shape === "handdrawn";
}
function isImage(el: ZagyCanvasImageElement): el is ZagyCanvasImageElement {
    return el.shape === "image";
}

type CleanedElement<T extends ZagyCanvasElement> = Omit<
    T,
    "cache" | "cacheCtx" | "zoom" | "willDelete" | "roughElement" | "imgRef" | "path2D"
>;

type ZagyPortableT = {
    type: "ZagyPortableContent";
    elements: CleanedElement<ZagyCanvasElement>[];
};

// mockup structure type guard
function isZagyPortable(test: unknown): asserts test is ZagyPortableT {
    if (
        typeof test === "object" &&
        test !== null &&
        "type" in test &&
        test.type === "ZagyPortableContent" &&
        "elements" in test
    )
        return;
    throw new Error("notZagyPortable");
}
//function to check if elements extends CachableElement
type ZagyShape = Shape<unknown>;
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
    HandDrawnOptions,
    ZagyCanvasImageElement,
    ImageOptions,
    CleanedElement,
    ZagyPortableT,
    RectRequiredOptions,
    LineRequiredOptions,
    HandDrawnRequiredOptions,
    TextRequiredOptions,
    ImageRequiredOptions,
    ImageComputedFields,
    ZagyShape,
};
export { CursorFn, FontTypeOptions, isLine, isRect, isText, isHanddrawn, isImage, isZagyPortable };
