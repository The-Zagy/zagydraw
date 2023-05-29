import type { CanvasState } from "store";
import {
    ZagyCanvasElement,
    ZagyCanvasHandDrawnElement,
    ZagyCanvasLineElement,
    ZagyCanvasRectElement,
    GlobalConfigOptions,
} from "types/general";

export function classNames(...classes: unknown[]): string {
    return classes.filter(Boolean).join(" ");
}

/**
 *
 * @param mousePosX
 * @param mousePosY
 * @returns  {[posX, posY]} normalized to 20px grid
 */
export function normalizePos(
    pos: CanvasState["position"],
    mousePosX: number,
    mousePosY: number
): [number, number] {
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
    mousePosX: number,
    mousePosY: number
): [number, number] {
    const xStart = Math.floor(pos.y) % 20;
    const yStart = Math.floor(pos.x) % 20;
    // for perfect square this would be the normalized x pos
    const columnNumber = Math.round((mousePosX - yStart) / 20);
    const columnPos = yStart + columnNumber * 20;
    // for perfect square this would be the normalized y pos
    const rowNumber = Math.round((mousePosY - xStart) / 20);
    const rowPosition = xStart + rowNumber * 20;
    return [columnPos - pos.x, rowPosition - pos.y];
}
const distance = (p1: [number, number], p2: [number, number]) => {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
};

const dotProduct = (v1: [number, number], v2: [number, number]) => {
    return v1[0] * v2[0] + v1[1] * v2[1];
};
const makeVector = (p1: [number, number], p2: [number, number]): [number, number] => {
    return [p2[0] - p1[0], p2[1] - p1[1]];
};

const pointNearLine = (A: [number, number], B: [number, number], M: [number, number]) => {
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
const pointInRectangle = (
    A: [number, number],
    B: [number, number],
    _: [number, number],
    D: [number, number],
    M: [number, number]
): boolean => {
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
const pointInPath = (
    ctx: CanvasRenderingContext2D,
    path: Path2D,
    x: number,
    y: number
): boolean => {
    return ctx.isPointInPath(path, x, y);
};
export function getHitElement(
    elements: CanvasState["elements"],
    ctx: CanvasRenderingContext2D,
    mousePos: [number, number],
    pos: CanvasState["position"]
): null | CanvasState["elements"][number] {
    //todo deal with stacking elements when stacking is implemented
    mousePos = [mousePos[0] - pos.x, mousePos[1] - pos.y];
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].shape === "rectangle" || elements[i].shape === "text") {
            const { x, y, endX, endY } = elements[i] as ZagyCanvasRectElement;
            if (pointInRectangle([x, y], [endX, y], [endX, endY], [x, endY], mousePos)) {
                return elements[i];
            }
        } else if (elements[i].shape === "line") {
            const { x, y, endX, endY } = elements[i] as ZagyCanvasLineElement;
            if (pointNearLine([x, y], [endX, endY], mousePos)) {
                return elements[i];
            }
        } else if (elements[i].shape === "handdrawn") {
            const { path } = elements[i] as ZagyCanvasHandDrawnElement;
            if (pointInPath(ctx, path, mousePos[0], mousePos[1])) {
                return elements[i];
            }
        }
    }
    return null;
}
export const average = (a: number, b: number): number => (a + b) / 2;

export function getSvgPathFromStroke(points: number[][], closed = true): string {
    const len = points.length;

    if (len < 4) {
        return ``;
    }

    let a = points[0];
    let b = points[1];
    const c = points[2];

    let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(
        2
    )} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;

    for (let i = 2, max = len - 1; i < max; i++) {
        a = points[i];
        b = points[i + 1];
        result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
    }

    if (closed) {
        result += "Z";
    }

    return result;
}

export function getBoundingRect(...elements: ZagyCanvasElement[]) {
    let x = Infinity;
    let y = Infinity;
    let endX = -Infinity;
    let endY = -Infinity;
    for (const element of elements) {
        //the check not needed currently but maybe other shapes will be added in the future
        if (
            element.shape === "rectangle" ||
            element.shape === "line" ||
            element.shape === "text" ||
            element.shape === "handdrawn"
        ) {
            const {
                x: elementStartX,
                y: elementStartY,
                endX: elementEndX,
                endY: elementEndY,
            } = element as ZagyCanvasRectElement;
            x = Math.min(x, elementStartX);
            y = Math.min(y, elementStartY);
            endX = Math.max(endX, elementEndX);
            endY = Math.max(endY, elementEndY);
        }
    }
    const threshold = 10;
    return [
        [x - threshold, y - threshold],
        [endX + threshold, endY + threshold],
    ];
}

export const isElementInRect = (element: ZagyCanvasElement, rect: ZagyCanvasRectElement) => {
    if (
        element.shape === "rectangle" ||
        element.shape === "line" ||
        element.shape === "text" ||
        element.shape === "handdrawn"
    ) {
        const { x, y, endX, endY } = element as ZagyCanvasRectElement;
        console.log("element", { x, y, endX, endY }, "rect", {
            x: rect.x,
            y: rect.y,
            endX: rect.endX,
            endY: rect.endY,
        });
        if (x >= rect.x && y >= rect.y && endX <= rect.endX && endY <= rect.endY) {
            return true;
        }
    }
    return false;
};

export const isElementVisible = (
    element: ZagyCanvasElement,
    rectCoords: [[x: number, y: number], [xEnd: number, yEnd: number]]
) => {
    //the check not needed currently but maybe other shapes will be added in the future
    if (
        element.shape === "rectangle" ||
        element.shape === "line" ||
        element.shape === "text" ||
        element.shape === "handdrawn"
    ) {
        const { x, y, endX, endY } = element as ZagyCanvasRectElement;
        const [[rectX, rectY], [rectEndX, rectEndY]] = rectCoords;
        // if any of the element's corners is inside the rectangle that is the screen
        // also notice that we don't need to do the same calculations in the function pointInRectangle
        // because we know for sure that the screen isn't rotated
        if (x <= rectEndX && endX >= rectX && y <= rectEndY && endY >= rectY) {
            return true;
        }
    }
    return false;
};

export const getCorrectPos = (startPos: [number, number], endPos: [number, number]) => {
    const x1 = Math.min(startPos[0], endPos[0]);
    const y1 = Math.min(startPos[1], endPos[1]);
    const x2 = Math.max(startPos[0], endPos[0]);
    const y2 = Math.max(startPos[1], endPos[1]);
    return { x: x1, y: y1, endX: x2, endY: y2 };
};
export const getGlobalMinMax = (points: [number, number][]) => {
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
    [k in keyof GlobalConfigOptions]?: GlobalConfigOptions[k] | null;
};

/**
 * get common config between many elements
 * , there's three possible values for each prop
 * @returns undefined: prop not shared, null: shared prop but conflict in value, otherwise return normal value for the prop
 */
export function getElementsCommonConfig<T extends ZagyCanvasElement = ZagyCanvasElement>(
    elements: T[]
): CommonConfigOptions {
    if (elements.length === 0) throw new Error("cannot get common config on empty array");

    // hack to remove rough options that i don't count for now
    const t = Object.keys({
        cursorFn: undefined,
        fill: undefined,
        fillStyle: undefined,
        font: undefined,
        fontSize: undefined,
        opacity: undefined,
        stroke: undefined,
        strokeLineDash: undefined,
        strokeWidth: undefined,
    } as CommonConfigOptions);

    const res: CommonConfigOptions = {};
    // from first element copy only options i care about in this context
    // now elements[0] is my base for the common config
    t.forEach((key) => {
        // @ts-ignore
        res[key] = elements[0]["options"][key];
    });

    elements.forEach((el, i) => {
        if (i === 0) return;
        // @ts-ignore
        for (const k of t) {
            // already have been decided this value is not shared, so skip
            // @ts-ignore
            if (res[k] === undefined) continue;
            // found not shared prop
            //@ts-ignore
            if (el.options[k] === undefined) {
                //@ts-ignore
                res[k] = undefined;
                continue;
            }
            //@ts-ignore
            if (res[k] === null) continue;
            // check for conflict in values
            //@ts-ignore
            if (
                //@ts-ignore
                Array.isArray(el.options[k])
                    ? //@ts-ignore
                      !isEqualArray(el.options[k], res[k])
                    : //@ts-ignore
                      el.options[k] !== res[k]
            )
                //@ts-ignore
                res[k] = null;
        }
    });

    return res;
}
