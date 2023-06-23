import rough from "roughjs";
import { Options } from "roughjs/bin/core";
import {
    ZagyCanvasLineElement,
    ZagyCanvasRectElement,
    ZagyCanvasTextElement,
    RectOptions,
    TextOptions,
    LineOptions,
    ZagyCanvasHandDrawnElement,
} from "types/general";
import { nanoid } from "nanoid";
import getStroke from "perfect-freehand";
import {
    Point,
    getCorrectCoordOrder,
    getGlobalMinMax,
    getSvgPathFromStroke,
    normalizeRectCoords,
} from "utils";
import { useStore } from "store";
import { randomSeed } from "roughjs/bin/math";
import { RoughGenerator } from "roughjs/bin/generator";
import { CACHE_CANVAS_SIZE_THRESHOLD } from "constants/index";

const { getConfigState } = useStore.getState();

function normalizeTextOptions(options: Partial<TextOptions>): TextOptions {
    const globalConfig = getConfigState();
    return {
        opacity: options.opacity || globalConfig.opacity,
        stroke: options.stroke || globalConfig.stroke,
        strokeLineDash: options.strokeLineDash || globalConfig.strokeLineDash,
        strokeWidth: options.strokeWidth || globalConfig.strokeWidth,
        font: options.font || globalConfig.font,
        fontSize: options.fontSize || globalConfig.fontSize,
    };
}

function normalizeRectOptions(
    options: Partial<RectOptions & { seed: number }>
): RectOptions & { seed: number } {
    const globalConfig = getConfigState();
    return {
        fill: options.fill || globalConfig.fill,
        fillStyle: options.fillStyle || globalConfig.fillStyle,
        opacity: options.opacity || globalConfig.opacity,
        stroke: options.stroke || globalConfig.stroke,
        strokeLineDash: options.strokeLineDash || globalConfig.strokeLineDash,
        strokeWidth: options.strokeWidth || globalConfig.strokeWidth,
        seed: options.seed || randomSeed(),
    };
}

const generateRectElement = (
    generator: RoughGenerator,
    startPos: Point,
    endPos: Point,
    options: Partial<RectOptions & Options & { id: string }>
): ZagyCanvasRectElement => {
    const { x, y, endX, endY } = normalizeRectCoords(startPos, endPos);
    const opts = normalizeRectOptions(options);
    const r = generator.rectangle(x, y, endX - x, endY - y, {
        roughness: 2,
        ...opts,
    });
    return {
        ...r,
        seed: opts.seed,
        id: options.id !== undefined ? options.id : nanoid(),
        x,
        y,
        endX,
        endY,
        shape: "rectangle",
        opacity: opts.opacity,
    };
};

const generateCacheRectElement = (
    generator: RoughGenerator,
    startPos: Point,
    endPos: Point,
    options: Partial<RectOptions & Options & { id: string }>
): ZagyCanvasRectElement => {
    const { x, y, endX, endY } = normalizeRectCoords(startPos, endPos);

    const opts = normalizeRectOptions(options);
    const el = generator.rectangle(
        CACHE_CANVAS_SIZE_THRESHOLD,
        CACHE_CANVAS_SIZE_THRESHOLD,
        endX - x,
        endY - y,
        {
            roughness: 2,
            ...opts,
        }
    );
    const cacheCanvas = document.createElement("canvas");
    // we have to add some threshold because roughjs rects have some offset
    cacheCanvas.width = endX - x + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    cacheCanvas.height = endY - y + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    const cacheCtx = cacheCanvas.getContext("2d");
    if (!cacheCtx) throw new Error("cacheCtx is null");
    rough.canvas(cacheCanvas).draw(el);
    return {
        ...el,
        cache: cacheCanvas,
        cacheCtx,
        seed: opts.seed,
        id: options.id !== undefined ? options.id : nanoid(),
        x,
        y,
        endX,
        endY,
        shape: "rectangle",
        opacity: opts.opacity,
    };
};

const generateSelectRectElement = (
    generator: RoughGenerator,
    startPos: Point,
    endPos: Point
): ZagyCanvasRectElement => {
    const { x, y, endX, endY } = getCorrectCoordOrder(startPos, endPos);
    const rect = generator.rectangle(
        startPos[0],
        startPos[1],
        endPos[0] - startPos[0],
        endPos[1] - startPos[1],
        {
            fill: "#9b59b6",
            fillStyle: "solid",
            strokeWidth: 0,
            stroke: "transparent",
            roughness: 0,
        }
    );
    return {
        ...rect,
        // dummy seed
        seed: 0,
        x,
        y,
        endX,
        endY,
        shape: "rectangle",
        opacity: 0.3,
        id: nanoid(),
    };
};

const generateLineElement = (
    generator: RoughGenerator,
    startPos: Point,
    endPos: Point,
    options: Partial<LineOptions & Options & { id: string }> = {}
): ZagyCanvasLineElement => {
    const { x, y, endX, endY } = getCorrectCoordOrder(startPos, endPos);
    // todo create normalize line options
    const opts = normalizeRectOptions(options);
    const l = generator.line(startPos[0], startPos[1], endPos[0], endPos[1], {
        roughness: 2,
        ...opts,
    });
    return {
        ...l,
        seed: opts.seed,
        id: options.id || nanoid(),
        x,
        y,
        endX,
        endY,
        point1: startPos,
        point2: endPos,
        shape: "line",
        opacity: opts.opacity,
    };
};
const generateCacheLineElement = (
    generator: RoughGenerator,
    startPos: Point,
    endPos: Point,
    options: Partial<LineOptions & Options & { id: string }>
): ZagyCanvasLineElement => {
    const { minX: x, minY: y, maxX: endX, maxY: endY } = getGlobalMinMax([startPos, endPos]);
    const opts = normalizeRectOptions(options);

    startPos = [
        startPos[0] + CACHE_CANVAS_SIZE_THRESHOLD,
        startPos[1] + CACHE_CANVAS_SIZE_THRESHOLD,
    ];
    endPos = [endPos[0] + CACHE_CANVAS_SIZE_THRESHOLD, endPos[1] + CACHE_CANVAS_SIZE_THRESHOLD];
    const el = generator.line(...startPos, ...endPos, {
        roughness: 2,
        ...opts,
    });
    const cacheCanvas = document.createElement("canvas");
    // we have to add some threshold because roughjs rects have some offset
    cacheCanvas.width = endX - x + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    cacheCanvas.height = endY - y + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    const cacheCtx = cacheCanvas.getContext("2d");
    if (!cacheCtx) throw new Error("cacheCtx is null");
    cacheCtx.translate(-x, -y);
    rough.canvas(cacheCanvas).draw(el);

    return {
        ...el,
        cache: cacheCanvas,
        cacheCtx,
        seed: opts.seed,
        id: options.id !== undefined ? options.id : nanoid(),
        x,
        y,
        point1: startPos,
        point2: endPos,
        endX,
        endY,
        shape: "line",
        opacity: opts.opacity,
    };
};
/**
 * return text as lines, and calc text element position(width/height) from text string
 */
function textElementHelper(
    ctx: CanvasRenderingContext2D,
    text: string,
    startPos: Point,
    fontSize: number
): { text: string[]; startPos: Point; endPos: Point } {
    const lines = text.split("\n");
    // text element width is the largest line width
    let largestLineIndex = 0;
    let tempLen = lines[0].length;
    lines.forEach((val, i) => {
        if (val.length > tempLen) {
            tempLen = val.length;
            largestLineIndex = i;
        }
    });
    const width = ctx.measureText(lines[largestLineIndex]).width;
    // note using font-size as line height
    // calc height = number of lines * lineHeight
    const height = lines.length * fontSize;

    return {
        text: lines,
        startPos,
        endPos: [startPos[0] + width, startPos[1] + height],
    };
}

const generateTextElement = (
    ctx: CanvasRenderingContext2D,
    text: string,
    startPos: [number, number],
    options: Partial<TextOptions & { id: string }> = {}
): ZagyCanvasTextElement => {
    const opts = normalizeTextOptions(options);
    const norm = textElementHelper(ctx, text, startPos, opts.fontSize);
    const { x, y, endX, endY } = getCorrectCoordOrder(startPos, [norm.endPos[0], norm.endPos[1]]);
    return {
        id: options.id || nanoid(),
        text: norm.text,
        x,
        y,
        endX,
        endY,
        shape: "text",

        options: {
            ...opts,
        },
        opacity: opts.opacity,
    };
};

const constructHandDrawnElementPath2D = (paths: Point[]) => {
    const stroke = getStroke(paths, {
        size: 4,
        smoothing: 0,
        thinning: 0,
        streamline: 0,
        easing: (t) => t,
        start: {
            taper: 0,
            cap: true,
        },
        end: {
            taper: 0,
            cap: true,
        },
    });
    const svgFromStroke = getSvgPathFromStroke(stroke);

    return new Path2D(svgFromStroke);
};
export const generateHandDrawnElement = (paths: Point[]): ZagyCanvasHandDrawnElement => {
    const path2D = constructHandDrawnElementPath2D(paths);
    const { minX, minY, maxX, maxY } = getGlobalMinMax(paths);
    return {
        id: nanoid(),
        shape: "handdrawn",
        x: minX,
        y: minY,
        endX: maxX,
        endY: maxY,
        paths: paths,
        path2D: path2D,
        options: {
            opacity: 1,
            stroke: "transparent",
            strokeLineDash: [],
            strokeWidth: 1,
        },
        opacity: 1,
    };
};
const generateCachedHandDrawnElement = (paths: Point[]) => {
    const el = generateHandDrawnElement(paths);
    const cacheCanvas = document.createElement("canvas");
    cacheCanvas.width = el.endX - el.x + 20;
    cacheCanvas.height = el.endY - el.y + 20;
    const cacheCtx = cacheCanvas.getContext("2d");
    if (!cacheCtx) throw new Error("cacheCtx is null");
    cacheCtx.translate(
        -el.x + CACHE_CANVAS_SIZE_THRESHOLD / 2,
        -el.y + CACHE_CANVAS_SIZE_THRESHOLD / 2
    );
    cacheCtx.fillStyle = "white";
    cacheCtx.fill(el.path2D);
    return {
        ...el,
        cache: cacheCanvas,
        cacheCtx,
    };
};

export {
    generateRectElement,
    generateLineElement,
    constructHandDrawnElementPath2D,
    generateSelectRectElement,
    generateCacheRectElement,
    generateTextElement,
    generateCachedHandDrawnElement,
    generateCacheLineElement,
};
