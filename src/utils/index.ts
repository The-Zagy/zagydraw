import type { CanvasState } from "store";
import { CanvasLineElement, CanvasRectElement } from "types/general";

export function classNames(...classes: unknown[]): string {
    return classes.filter(Boolean).join(" ");
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
const makeVector = (
    p1: [number, number],
    p2: [number, number]
): [number, number] => {
    return [p2[0] - p1[0], p2[1] - p1[1]];
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
const pointNearLine = (
    A: [number, number],
    B: [number, number],
    M: [number, number]
) => {
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

export function getHitElement(
    elements: CanvasState["elements"],
    mousePos: [number, number],
    pos: CanvasState["position"]
): null | CanvasState["elements"][number] {
    //todo deal with stacking elements when stacking is implemented
    mousePos = [mousePos[0] - pos.x, mousePos[1] - pos.y];
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].shape === "rectangle") {
            const { x, y, endX, endY } = elements[i] as CanvasRectElement;
            if (
                pointInRectangle(
                    [x, y],
                    [endX, y],
                    [endX, endY],
                    [x, endY],
                    mousePos
                )
            ) {
                return elements[i];
            }
        }
        if (elements[i].shape === "line") {
            const { x, y, endX, endY } = elements[i] as CanvasLineElement;
            if (pointNearLine([x, y], [endX, endY], mousePos)) {
                return elements[i];
            }
        }
    }
    return null;
}
export const average = (a: number, b: number): number => (a + b) / 2;

export function getSvgPathFromStroke(
    points: number[][],
    closed: boolean = true
): string {
    const len = points.length;

    if (len < 4) {
        return ``;
    }

    let a = points[0];
    let b = points[1];
    const c = points[2];

    let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
        2
    )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
        b[1],
        c[1]
    ).toFixed(2)} T`;

    for (let i = 2, max = len - 1; i < max; i++) {
        a = points[i];
        b = points[i + 1];
        result += `${average(a[0], b[0]).toFixed(2)},${average(
            a[1],
            b[1]
        ).toFixed(2)} `;
    }

    if (closed) {
        result += "Z";
    }

    return result;
}
