import { RoughGenerator } from "roughjs/bin/generator";
import { Options } from "roughjs/bin/core";
import {
    ZagyCanvasLineElement,
    ZagyCanvasRectElement,
    ZagyCanvasTextElement,
    RectOptions,
    TextOptions,
    LineOptions,
} from "types/general";
import { nanoid } from "nanoid";
import getStroke from "perfect-freehand";
import { getCorrectPos, getSvgPathFromStroke } from "utils";
import { useStore } from "store";

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

function normalizeRectOptions(options: Partial<RectOptions>): RectOptions {
    const globalConfig = getConfigState();
    return {
        fill: options.fill || globalConfig.fill,
        fillStyle: options.fillStyle || globalConfig.fillStyle,
        opacity: options.opacity || globalConfig.opacity,
        stroke: options.stroke || globalConfig.stroke,
        strokeLineDash: options.strokeLineDash || globalConfig.strokeLineDash,
        strokeWidth: options.strokeWidth || globalConfig.strokeWidth,
    };
}

const generateRectElement = (
    generator: RoughGenerator,
    startPos: [number, number],
    endPos: [number, number],
    curPos: ZagyCanvasRectElement["curPos"],
    options: Partial<RectOptions & Options & { id: string }>,
    seed?: number
): ZagyCanvasRectElement => {
    //eslint-disable-next-line
    let { x, y, endX, endY } = getCorrectPos(startPos, endPos);
    const width = endX - x;
    const height = endY - y;
    if (width < 10) {
        endY = y;
    } else if (width < 20) {
        endX = x + 20;
    }
    if (height < 10) {
        endX = x;
    } else if (height < 20) {
        endY = y + 20;
    }
    const opts = normalizeRectOptions(options);
    const r = generator.rectangle(x, y, endX - x, endY - y, {
        roughness: 2,
        ...opts,
        seed,
    });
    return {
        ...r,
        id: options.id !== undefined ? options.id : nanoid(),
        x,
        y,
        endX,
        endY,
        shape: "rectangle",
        curPos: curPos,
        opacity: opts.opacity,
    };
};

export const generateSelectRectElement = (
    generator: RoughGenerator,
    startPos: [number, number],
    endPos: [number, number],
    curPos: ZagyCanvasRectElement["curPos"]
): ZagyCanvasRectElement => {
    const { x, y, endX, endY } = getCorrectPos(startPos, endPos);
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
        x,
        y,
        endX,
        endY,
        shape: "rectangle",
        curPos: curPos,
        opacity: 0.3,
        id: nanoid(),
    };
};

const generateLineElement = (
    generator: RoughGenerator,
    startPos: [number, number],
    endPos: [number, number],
    curPos: ZagyCanvasRectElement["curPos"],
    options: Partial<LineOptions & { id: string }>
): ZagyCanvasLineElement => {
    const elementStartX = Math.min(startPos[0], endPos[0]);
    const elementStartY = Math.min(startPos[1], endPos[1]);
    const elementEndX = Math.max(startPos[0], endPos[0]);
    const elementEndY = Math.max(startPos[1], endPos[1]);
    // todo create normalize line options
    const opts = normalizeRectOptions(options);
    const l = generator.line(startPos[0], startPos[1], endPos[0], endPos[1], {
        roughness: 0,
        ...opts,
    });
    return {
        ...l,
        id: options.id || nanoid(),
        x: elementStartX,
        y: elementStartY,
        endX: elementEndX,
        endY: elementEndY,
        shape: "line",
        curPos: curPos,
        opacity: opts.opacity,
    };
};

/**
 * return text as lines, and calc text element position(width/height) from text string
 */
function textElementHelper(
    ctx: CanvasRenderingContext2D,
    text: string,
    startPos: [number, number],
    fontSize: number
): { text: string[]; startPos: [number, number]; endPos: [number, number] } {
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
    curPos: ZagyCanvasTextElement["curPos"],
    options: Partial<TextOptions & { id: string }>
): ZagyCanvasTextElement => {
    const opts = normalizeTextOptions(options);
    const norm = textElementHelper(ctx, text, startPos, opts.fontSize);
    const { x, y, endX, endY } = getCorrectPos(startPos, [norm.endPos[0], norm.endPos[1]]);
    return {
        id: options.id || nanoid(),
        text: norm.text,
        x,
        y,
        endX,
        endY,
        shape: "text",
        curPos: curPos,
        options: {
            ...opts,
        },
        opacity: opts.opacity,
    };
};

const generateHandDrawnElement = (paths: [number, number][]) => {
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

export { generateRectElement, generateLineElement, generateHandDrawnElement, generateTextElement };
