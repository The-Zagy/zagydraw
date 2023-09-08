import rough from "roughjs";
import { nanoid } from "nanoid";
import getStroke from "perfect-freehand";
import { randomSeed } from "roughjs/bin/math";
import { RoughGenerator } from "roughjs/bin/generator";
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
    ZagyCanvasElement,
    isLine,
    isRect,
    isHanddrawn,
    ZagyCanvasImageElement,
    ImageOptions,
} from "@/types/general";
import {
    Point,
    getCorrectCoordOrder,
    getGlobalMinMax,
    getSvgPathFromStroke,
    normalizeRectCoords,
} from "@/utils";
import { useStore } from "@/store";
import {
    CACHE_CANVAS_SIZE_THRESHOLD,
    PREVIEW_IMAGE_HEIGHT,
    PREVIEW_IMAGE_WIDTH,
} from "@/constants/index";

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
    options: Partial<RectOptions & { id: string }>,
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
    zoom: number,
    options: Partial<RectOptions & { id: string }>,
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
        },
    );
    const cacheCanvas = document.createElement("canvas");
    // we have to add some threshold because roughjs rects have some offset
    cacheCanvas.width = endX - x + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    cacheCanvas.height = endY - y + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    // we need to account for zooming
    cacheCanvas.width *= zoom;
    cacheCanvas.height *= zoom;
    const cacheCtx = cacheCanvas.getContext("2d");
    if (!cacheCtx) throw new Error("cacheCtx is null");
    cacheCtx.scale(zoom, zoom);
    rough.canvas(cacheCanvas).draw(roughElement);
    return {
        roughElement,
        options: {
            ...normalizedOptions,
        },
        cache: cacheCanvas,
        cacheCtx,
        zoom,
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
    endPos: Point,
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
        { ...normalizedOptions, roughness: 0 },
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
    options: Partial<LineOptions & { id: string }> = {},
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
    zoom: number,
    options: Partial<LineOptions & { id: string }>,
): ZagyCanvasLineElement => {
    const { minX: x, minY: y, maxX: endX, maxY: endY } = getGlobalMinMax([startPos, endPos]);
    const normalizedOptions = normalizeRectOptions(options);
    const tempStartPos: Point = [
        startPos[0] + CACHE_CANVAS_SIZE_THRESHOLD,
        startPos[1] + CACHE_CANVAS_SIZE_THRESHOLD,
    ];
    const tempEndPos: Point = [
        endPos[0] + CACHE_CANVAS_SIZE_THRESHOLD,
        endPos[1] + CACHE_CANVAS_SIZE_THRESHOLD,
    ];
    const roughElement = generator.line(...tempStartPos, ...tempEndPos, {
        roughness: 2,
        ...normalizedOptions,
    });
    const cacheCanvas = document.createElement("canvas");
    // we have to add some threshold because roughjs rects have some offset
    cacheCanvas.width = endX - x + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    cacheCanvas.height = endY - y + CACHE_CANVAS_SIZE_THRESHOLD * 4;
    // we need to account for zooming
    cacheCanvas.width *= zoom;
    cacheCanvas.height *= zoom;
    const cacheCtx = cacheCanvas.getContext("2d");
    if (!cacheCtx) throw new Error("cacheCtx is null");
    cacheCtx.scale(zoom, zoom);
    cacheCtx.translate(-x, -y);
    rough.canvas(cacheCanvas).draw(roughElement);
    return {
        roughElement,
        options: {
            ...normalizedOptions,
        },
        cache: cacheCanvas,
        cacheCtx,
        zoom,
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
    text: string,
    startPos: Point,
    fontSize: number,
    font: TextOptions["font"],
): { text: string[]; startPos: Point; endPos: Point } {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) throw new Error("GENERATE TEXT: must have ctx to be able to create new text");
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
    text: string,
    startPos: [number, number],
    options: Partial<TextOptions & { id: string }> = {},
): ZagyCanvasTextElement => {
    const normalizedOptions = normalizeTextOptions(options);
    const norm = textElementHelper(
        text,
        startPos,
        normalizedOptions.fontSize,
        normalizedOptions.font,
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

function CreateDataUrl(file: Blob) {
    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
            // Logs data:<type>;base64,wL2dvYWwgbW9yZ...
        };
        reader.readAsDataURL(file);
    });
}
/**
 * create new image instance append it to ZagyImageElement
 * filter the store from the element with placeholder image, and append the new one with the loaded image
 */
async function loadImage(file: Blob | string, id: string) {
    // create dataUrl if the data is not Blob
    let dataUrl: string;
    if (typeof file === "string") {
        dataUrl = file;
    } else {
        dataUrl = await CreateDataUrl(file);
    }
    const img = new Image();
    const promise = new Promise<HTMLImageElement>((resolve) => {
        img.onload = () => {
            resolve(img);
        };
    });

    img.src = dataUrl;
    const loadedImage = await promise;
    const { setElements, elements } = useStore.getState();
    // this suppose to prevent adding loaded image to the store after the user delete the preview
    const oldEl = elements.find((el) => el.id === id);
    if (!oldEl) return;
    setElements((prev) => [
        ...prev.filter((el) => el.id !== id),
        {
            ...(oldEl as ZagyCanvasImageElement),
            endX: oldEl.x + loadedImage.width,
            endY: oldEl.y + loadedImage.height,
            image: dataUrl,
            imgRef: loadedImage,
        } satisfies ZagyCanvasImageElement,
    ]);
}

/**
 * @param blob Blob | string image as a blob and will be automatically loaded or string which is DataUrl
 */
function generateImageElement(
    blob: Blob | string,
    startPos: [number, number],
    options: Partial<ImageOptions & { id: string }> = {},
): ZagyCanvasImageElement {
    // TODO hand drawn options is the same as image options so i use it, but it's better to create a separate function so they won't be coupled together
    const normalizedOptions = normalizeHanddrawnOptions(options);
    const id = options.id || nanoid();
    const el: ZagyCanvasImageElement = {
        id,
        shape: "image",
        // at the start the w and h is the preview image w and h and will be updated within the loadImage promise
        x: startPos[0],
        y: startPos[1],
        endX: startPos[0] + PREVIEW_IMAGE_WIDTH,
        endY: startPos[1] + PREVIEW_IMAGE_HEIGHT,
        image: null,
        imgRef: loadImage(blob, id),
        options: {
            ...normalizedOptions,
        },
    };

    return el;
}

const constructHandDrawnElementPath2D = (paths: Point[], options: HanddrawnOptions) => {
    const stroke = getStroke(paths, {
        size: options.strokeWidth + 2,
        smoothing: 1.5,
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
    options: Partial<HanddrawnOptions> = {},
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
    zoom: number,
    options: Partial<HanddrawnOptions> = {},
) => {
    const normalizedOptions = normalizeHanddrawnOptions(options);
    const el = generateHandDrawnElement(paths, options);
    const cacheCanvas = document.createElement("canvas");
    cacheCanvas.width = el.endX - el.x + CACHE_CANVAS_SIZE_THRESHOLD;
    cacheCanvas.height = el.endY - el.y + CACHE_CANVAS_SIZE_THRESHOLD;
    // we need to account for zooming
    cacheCanvas.width *= zoom;
    cacheCanvas.height *= zoom;
    const cacheCtx = cacheCanvas.getContext("2d");
    if (!cacheCtx) throw new Error("cacheCtx is null");
    cacheCtx.scale(zoom, zoom);
    cacheCtx.translate(
        -el.x + CACHE_CANVAS_SIZE_THRESHOLD / 2,
        -el.y + CACHE_CANVAS_SIZE_THRESHOLD / 2,
    );
    cacheCtx.fillStyle = normalizedOptions.stroke;
    cacheCtx.fill(el.path2D);
    return {
        ...el,
        cache: cacheCanvas,
        cacheCtx,
        zoom,
    };
};

const regenerateCacheElement = (
    el: ZagyCanvasElement,
    newZoom: number,
    generator: RoughGenerator,
): ZagyCanvasElement => {
    if (isRect(el)) {
        return generateCacheRectElement(
            generator,
            [el.x, el.y],
            [el.endX, el.endY],
            newZoom,
            el.options,
        );
    } else if (isLine(el)) {
        return generateCacheLineElement(generator, el.point1, el.point2, newZoom, el.options);
    } else if (isHanddrawn(el)) {
        return generateCachedHandDrawnElement(el.paths, newZoom, el.options);
    } else {
        return el;
    }
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
    regenerateCacheElement,
    generateImageElement,
};
