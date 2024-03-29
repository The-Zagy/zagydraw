export type Point = [x: number, y: number];

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Shape from "./canvas/shapes/shape";
import { ZagyRectangle } from "./canvas/shapes";
import type { CanvasState } from "@/store";
import {
    ZagyCanvasElement,
    ZagyCanvasRectElement,
    GlobalElementOptions,
    isRect,
    isLine,
    isText,
    isHanddrawn,
    ZagyShape,
    isImage,
    SharedOptions,
} from "@/types/general";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export function classNames(...classes: unknown[]): string {
    return classes.filter(Boolean).join(" ");
}

/**
 *
 * @param mousePosX
 * @param mousePosY
 * @returns  {Point} normalized to 20px grid
 */
export function normalizePos(pos: CanvasState["position"], [mousePosX, mousePosY]: Point): Point {
    return [mousePosX - pos.x, mousePosY - pos.y];
}
/**
 *
 * @param mousePosX
 * @param mousePosY
 * @returns  {[posX, posY]} normalized to 20px grid
 */
export function normalizeToGrid(
    pos: CanvasState["position"],
    [mousePosX, mousePosY]: Point,
): Point {
    const xStart = Math.floor(pos.y) % 20;
    const yStart = Math.floor(pos.x) % 20;
    // for perfect square this would be the normalized x pos
    const columnNumber = Math.round((mousePosX - yStart) / 20);
    const columnPos = yStart + columnNumber * 20;
    // for perfect square this would be the normalized y pos
    const rowNumber = Math.round((mousePosY - xStart) / 20);
    const rowPosition = xStart + rowNumber * 20;

    return [Math.floor(columnPos - pos.x), Math.floor(rowPosition - pos.y)];
}
export const distance = (p1: Point, p2: Point) => {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
};

const dotProduct = (v1: Point, v2: Point) => {
    return v1[0] * v2[0] + v1[1] * v2[1];
};
const makeVector = (p1: Point, p2: Point): Point => {
    return [p2[0] - p1[0], p2[1] - p1[1]];
};

export const pointNearLine = (A: Point, B: Point, M: Point) => {
    A = [Math.round(A[0]), Math.round(A[1])];
    B = [Math.round(B[0]), Math.round(B[1])];
    M = [Math.round(M[0]), Math.round(M[1])];
    const AM = distance(A, M);
    const MB = distance(M, B);
    const AB = distance(A, B);
    const diff = Math.abs(AB - (AM + MB));
    // 3 is the threshold for now
    if (diff < 3) return true;
};
/**
 *
 * @param A  point A of rectangle
 * @param B  point B of rectangle
 * @param _  point C of rectangle
 * @param D  point D of rectangle
 * @param M  point M to check
 * @returns  true if point M is inside rectangle
 */
export const pointInRectangle = (A: Point, B: Point, _: Point, D: Point, M: Point): boolean => {
    // https://math.stackexchange.com/questions/190111/how-to-check-if-a-point-is-inside-a-rectangle
    const AB = makeVector(A, B);
    const AM = makeVector(A, M);
    const AD = makeVector(A, D);
    const AM_AB = dotProduct(AM, AB);
    const AB_AB = dotProduct(AB, AB);
    const AM_AD = dotProduct(AM, AD);
    const AD_AD = dotProduct(AD, AD);
    return 0 < AM_AB && AM_AB < AB_AB && 0 < AM_AD && AM_AD < AD_AD;
};
export const pointInPath = (
    ctx: CanvasRenderingContext2D,
    path: Path2D,
    [x, y]: Point,
): boolean => {
    return ctx.isPointInPath(path, x, y);
};
export function getHitElement(
    elements: CanvasState["elements"],
    mouseCoords: Point,
    pos: CanvasState["position"],
): null | CanvasState["elements"][number] {
    //todo deal with stacking elements when stacking is implemented
    mouseCoords = [mouseCoords[0] - pos.x, mouseCoords[1] - pos.y];

    for (const el of elements) {
        if (el.isHit(mouseCoords)) return el;
    }
    return null;
}
export const average = (a: number, b: number): number => (a + b) / 2;

export function getBoundingRect(...elements: ZagyShape[]) {
    let x = Infinity;
    let y = Infinity;
    let endX = -Infinity;
    let endY = -Infinity;
    for (const element of elements) {
        const boundingRect = element.getBoundingRect();
        const [elementStartX, elementStartY] = boundingRect[0];
        const [elementEndX, elementEndY] = boundingRect[1];
        x = Math.min(x, elementStartX);
        y = Math.min(y, elementStartY);
        endX = Math.max(endX, elementEndX);
        endY = Math.max(endY, elementEndY);
    }

    return [
        [x, y],
        [endX, endY],
    ];
}

export const isElementInRect = (element: Shape<unknown & SharedOptions>, rect: ZagyRectangle) => {
    rect.isElementInside(element);
};

export const isElementVisible = (
    element: ZagyCanvasElement,
    rectStart: [x: number, y: number],
    width: number,
    height: number,
    zoom: number,
) => {
    //the check not needed currently but maybe other shapes will be added in the future
    if (
        element.shape === "rectangle" ||
        element.shape === "line" ||
        element.shape === "text" ||
        element.shape === "handdrawn" ||
        element.shape === "image"
    ) {
        const { x, y, endX, endY } = element as ZagyCanvasRectElement;
        const [rectX, rectY] = rectStart;

        const rectEndX = rectX + width / zoom;
        const rectEndY = rectY + height / zoom;

        // if any of the element's corners is inside the rectangle that is the screen
        // also notice that we don't need to do the same calculations in the function pointInRectangle
        // because we know for sure that the screen isn't rotated
        if (x <= rectEndX && endX >= rectX && y <= rectEndY && endY >= rectY) {
            return true;
        }
    }
    return false;
};

export const getCorrectCoordOrder = (startPos: Point, endPos: Point) => {
    const x1 = Math.min(startPos[0], endPos[0]);
    const y1 = Math.min(startPos[1], endPos[1]);
    const x2 = Math.max(startPos[0], endPos[0]);
    const y2 = Math.max(startPos[1], endPos[1]);
    return { x: x1, y: y1, endX: x2, endY: y2 };
};
export const getMinimumRectCoords = (startPos: Point, endPos: Point) => {
    const [x, y] = startPos;
    let [endX, endY] = endPos;
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
    return { x, y, endX, endY };
};
export const normalizeRectCoords = (startPos: Point, endPos: Point) => {
    const { x, y, endX, endY } = getCorrectCoordOrder(startPos, endPos);
    return getMinimumRectCoords([x, y], [endX, endY]);
};
export const getGlobalMinMax = (points: Point[]) => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    points.forEach((point) => {
        minX = Math.min(minX, point[0]);
        minY = Math.min(minY, point[1]);
        maxX = Math.max(maxX, point[0]);
        maxY = Math.max(maxY, point[1]);
    });
    return { minX, minY, maxX, maxY };
};

export function isEqualArray<T>(a1: T[], a2: T[]): boolean {
    if (a1.length !== a2.length) return false;
    for (let i = 0; i < a1.length; ++i) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
}

export type CommonConfigOptions = {
    [k in keyof GlobalElementOptions]?: GlobalElementOptions[k];
};

/**
 *  get union config of many elements
 */
export function getElementsUnionConfig<T extends ZagyShape>(elements: T[]): CommonConfigOptions {
    if (elements.length === 0) return {};
    const elementTypesSoFar: {
        [k in ZagyCanvasElement["shape"]]: boolean;
    } = {
        rectangle: false,
        line: false,
        text: false,
        handdrawn: false,
        image: false,
    };
    const keysCount = Object.keys(elementTypesSoFar).length;
    let count = 0;
    let res: CommonConfigOptions = {};

    for (const element of elements) {
        if (count === keysCount) break;
        if (elementTypesSoFar[element.shape]) continue;
        if (isRect(element)) {
            if (!elementTypesSoFar["rectangle"]) {
                elementTypesSoFar["rectangle"] = true;
                count++;
            }
            res = {
                ...res,
                ...(element.getOptions() as object),
            };
        } else if (isLine(element)) {
            if (!elementTypesSoFar["line"]) {
                elementTypesSoFar["line"] = true;
                count++;
            }
            res = {
                ...res,
                ...(element.getOptions() as object),
            };
        } else if (isText(element)) {
            if (!elementTypesSoFar["text"]) {
                elementTypesSoFar["text"] = true;
                count++;
            }
            res = {
                ...res,
                ...(element.getOptions() as object),
            };
        } else if (isHanddrawn(element)) {
            if (!elementTypesSoFar["handdrawn"]) {
                elementTypesSoFar["handdrawn"] = true;
                count++;
            }
            res = {
                ...res,
                ...(element.getOptions() as object),
            };
        } else if (isImage(element)) {
            if (!elementTypesSoFar["image"]) {
                elementTypesSoFar["image"] = true;
                count++;
            }
            res = {
                ...res,
                ...(element.getOptions() as object),
            };
        }
    }
    return res;
}

export async function sleep(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}
