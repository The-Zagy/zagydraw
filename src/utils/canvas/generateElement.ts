import { RoughGenerator } from "roughjs/bin/generator";
import { Options } from "roughjs/bin/core";
import {
    ZagyCanvasLineElement,
    ZagyCanvasRectElement,
    ZagyCanvasTextElement,
    FillStyleOptions,
    RectOptions,
    TextOptions,
    LineOptions
} from "types/general";
import { nanoid } from "nanoid";
import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "utils";
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
        fontSize: options.fontSize || globalConfig.fontSize
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
        strokeWidth: options.strokeWidth || globalConfig.strokeWidth
    };
}

const generateRectElement = (
    generator: RoughGenerator,
    startPos: [number, number],
    endPos: [number, number],
    curPos: ZagyCanvasRectElement["curPos"],
    options: Partial<RectOptions & { id: string }>,
    seed?: number
): ZagyCanvasRectElement => {
    const opts = normalizeRectOptions(options);
    const r = generator.rectangle(
        startPos[0],
        startPos[1],
        endPos[0] - startPos[0],
        endPos[1] - startPos[1],
        {
            ...opts,
            roughness: 2,
            seed
        }
    );
    return {
        ...r,
        id: options.id !== undefined ? options.id : nanoid(),
        x: startPos[0],
        y: startPos[1],
        endX: endPos[0],
        endY: endPos[1],
        shape: "rectangle",
        curPos: curPos,
        opacity: opts.opacity
    };
};

const generateLineElement = (
    generator: RoughGenerator,
    startPos: [number, number],
    endPos: [number, number],
    curPos: ZagyCanvasRectElement["curPos"],
    options: Partial<LineOptions & { id: string }>
): ZagyCanvasLineElement => {
    // todo create normalize line options
    const opts = normalizeRectOptions(options);
    const l = generator.line(startPos[0], startPos[1], endPos[0], endPos[1], {
        roughness: 0,
        ...opts
    });
    return {
        ...l,
        id: options.id || nanoid(),
        x: startPos[0],
        y: startPos[1],
        endX: endPos[0],
        endY: endPos[1],
        shape: "line",
        curPos: curPos,
        opacity: opts.opacity
    };
};

const generateTextElement = (
    text: string,
    startPos: [number, number],
    endPos: [number, number],
    curPos: ZagyCanvasTextElement["curPos"],
    options: Partial<TextOptions & { id: string }>
): ZagyCanvasTextElement => {
    const opts = normalizeTextOptions(options);
    return {
        id: options.id || nanoid(),
        text: text,
        x: startPos[0],
        y: startPos[1],
        endX: endPos[0],
        endY: endPos[1],
        shape: "text",
        curPos: curPos,
        options: {
            ...opts
        }
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
            cap: true
        },
        end: {
            taper: 0,
            cap: true
        }
    });
    const svgFromStroke = getSvgPathFromStroke(stroke);
    return new Path2D(svgFromStroke);
};

export {
    generateRectElement,
    generateLineElement,
    generateHandDrawnElement,
    generateTextElement
};
