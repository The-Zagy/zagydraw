import rough from "roughjs";

import {
    ZagyCanvasLineElement,
    ZagyCanvasRectElement,
    ZagyCanvasTextElement,
    RectOptions,
    TextOptions,
    LineOptions,
    ZagyCanvasHandDrawnElement,
    HanddrawnOptions,
    FontTypeOptions,
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

const { getElementConfigState: getConfigState } = useStore.getState();
function normalizeHanddrawnOptions(options: Partial<HanddrawnOptions>): HanddrawnOptions {
    const globalConfig = getConfigState();
    return {
        opacity: options.opacity || globalConfig.opacity,
        stroke: options.stroke || globalConfig.stroke,
        strokeWidth: options.strokeWidth || globalConfig.strokeWidth,
    };
}
function normalizeTextOptions(options: Partial<TextOptions>): TextOptions {
    const globalConfig = getConfigState();
    return {
        opacity: options.opacity || globalConfig.opacity,
        stroke: options.stroke || globalConfig.stroke,
        strokeWidth: options.strokeWidth || globalConfig.strokeWidth,
        font: options.font || globalConfig.font,
        fontSize: options.fontSize || globalConfig.fontSize,
    };
}

function normalizeRectOptions(options: Partial<RectOptions>) {
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
    options: Partial<RectOptions & { id: string }>
): ZagyCanvasRectElement => {
    const { x, y, endX, endY } = normalizeRectCoords(startPos, endPos);
    const normalizedOptions = normalizeRectOptions(options);
    const roughElement = generator.rectangle(x, y, endX - x, endY - y, {
        roughness: 2,
        ...normalizedOptions,
    });
    return {
        roughElement,
        options: {
            ...normalizedOptions,
        },

        id: options.id !== undefined ? options.id : nanoid(),
        x,
        y,
        endX,
        endY,
        shape: "rectangle",
    };
};

const generateCacheRectElement = (
    generator: RoughGenerator,
    startPos: Point,
    endPos: Point,
    options: Partial<RectOptions & { id: string }>
): ZagyCanvasRectElement => {
    const { x, y, endX, endY } = normalizeRectCoords(startPos, endPos);

    const normalizedOptions = normalizeRectOptions(options);
    const roughElement = generator.rectangle(
        CACHE_CANVAS_SIZE_THRESHOLD,
        CACHE_CANVAS_SIZE_THRESHOLD,
        endX - x,
        endY - y,
        {
            roughness: 2,
            ...normalizedOptions,
        }
    );
    const cacheCanvas = document.createElement("canvas");
    // we have to add some threshold because roughjs rects have some offset
    cacheCanvas.width = endX - x + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    cacheCanvas.height = endY - y + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    const cacheCtx = cacheCanvas.getContext("2d");
    if (!cacheCtx) throw new Error("cacheCtx is null");
    rough.canvas(cacheCanvas).draw(roughElement);
    return {
        roughElement,
        options: {
            ...normalizedOptions,
        },
        cache: cacheCanvas,
        cacheCtx,
        id: options.id !== undefined ? options.id : nanoid(),
        x,
        y,
        endX,
        endY,
        shape: "rectangle",
    };
};

const generateSelectRectElement = (
    generator: RoughGenerator,
    startPos: Point,
    endPos: Point
): ZagyCanvasRectElement => {
    const { x, y, endX, endY } = getCorrectCoordOrder(startPos, endPos);
    const normalizedOptions: RectOptions = {
        fill: "#9b59b6",
        fillStyle: "solid",
        strokeWidth: 1,
        stroke: "transparent",
        seed: 0,
        opacity: 0.3,
        strokeLineDash: [],
    };
    const roughElement = generator.rectangle(
        startPos[0],
        startPos[1],
        endPos[0] - startPos[0],
        endPos[1] - startPos[1],
        { ...normalizedOptions, roughness: 0 }
    );
    return {
        roughElement,
        options: {
            ...normalizedOptions,
        },
        // dummy seed

        x,
        y,
        endX,
        endY,
        shape: "rectangle",

        id: nanoid(),
    };
};

const generateLineElement = (
    generator: RoughGenerator,
    startPos: Point,
    endPos: Point,
    options: Partial<LineOptions & { id: string }> = {}
): ZagyCanvasLineElement => {
    const { x, y, endX, endY } = getCorrectCoordOrder(startPos, endPos);
    // todo create normalize line options
    const normalizedOptions = normalizeRectOptions(options);
    const roughElement = generator.line(startPos[0], startPos[1], endPos[0], endPos[1], {
        roughness: 2,
        ...normalizedOptions,
    });
    return {
        roughElement,
        options: {
            ...normalizedOptions,
        },

        id: options.id || nanoid(),
        x,
        y,
        endX,
        endY,
        point1: startPos,
        point2: endPos,
        shape: "line",
    };
};
const generateCacheLineElement = (
    generator: RoughGenerator,
    startPos: Point,
    endPos: Point,
    options: Partial<LineOptions & { id: string }>
): ZagyCanvasLineElement => {
    const { minX: x, minY: y, maxX: endX, maxY: endY } = getGlobalMinMax([startPos, endPos]);
    const normalizedOptions = normalizeRectOptions(options);

    startPos = [
        startPos[0] + CACHE_CANVAS_SIZE_THRESHOLD,
        startPos[1] + CACHE_CANVAS_SIZE_THRESHOLD,
    ];
    endPos = [endPos[0] + CACHE_CANVAS_SIZE_THRESHOLD, endPos[1] + CACHE_CANVAS_SIZE_THRESHOLD];
    const roughElement = generator.line(...startPos, ...endPos, {
        roughness: 2,
        ...normalizedOptions,
    });
    const cacheCanvas = document.createElement("canvas");
    // we have to add some threshold because roughjs rects have some offset
    cacheCanvas.width = endX - x + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    cacheCanvas.height = endY - y + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    const cacheCtx = cacheCanvas.getContext("2d");
    if (!cacheCtx) throw new Error("cacheCtx is null");
    cacheCtx.translate(-x, -y);
    rough.canvas(cacheCanvas).draw(roughElement);

    return {
        roughElement,
        options: {
            ...normalizedOptions,
        },
        cache: cacheCanvas,
        cacheCtx,

        id: options.id !== undefined ? options.id : nanoid(),
        x,
        y,
        point1: startPos,
        point2: endPos,
        endX,
        endY,
        shape: "line",
    };
};
/**
 * return text as lines, and calc text element position(width/height) from text string
 */
function textElementHelper(
    ctx: CanvasRenderingContext2D,
    text: string,
    startPos: Point,
    fontSize: number,
    font: TextOptions["font"]
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

    ctx.save();
    ctx.font = `${fontSize}px ` + FontTypeOptions[font];
    const width = ctx.measureText(lines[largestLineIndex]).width;
    ctx.restore();
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
    const normalizedOptions = normalizeTextOptions(options);
    const norm = textElementHelper(
        ctx,
        text,
        startPos,
        normalizedOptions.fontSize,
        normalizedOptions.font
    );
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
            ...normalizedOptions,
        },
    };
};

const constructHandDrawnElementPath2D = (paths: Point[], options: HanddrawnOptions) => {
    const stroke = getStroke(paths, {
        size: options.strokeWidth + 2,
        smoothing: 2,
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
export const generateHandDrawnElement = (
    paths: Point[],
    options: Partial<HanddrawnOptions> = {}
): ZagyCanvasHandDrawnElement => {
    const normalizedOptions = normalizeHanddrawnOptions(options);
    const path2D = constructHandDrawnElementPath2D(paths, normalizedOptions);
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
        options: normalizedOptions,
    };
};
const generateCachedHandDrawnElement = (
    paths: Point[],
    options: Partial<HanddrawnOptions> = {}
) => {
    const normalizedOptions = normalizeHanddrawnOptions(options);
    const el = generateHandDrawnElement(paths, options);
    const cacheCanvas = document.createElement("canvas");
    cacheCanvas.width = el.endX - el.x + 20;
    cacheCanvas.height = el.endY - el.y + 20;
    const cacheCtx = cacheCanvas.getContext("2d");
    if (!cacheCtx) throw new Error("cacheCtx is null");
    cacheCtx.translate(
        -el.x + CACHE_CANVAS_SIZE_THRESHOLD / 2,
        -el.y + CACHE_CANVAS_SIZE_THRESHOLD / 2
    );
    cacheCtx.fillStyle = normalizedOptions.stroke;
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
