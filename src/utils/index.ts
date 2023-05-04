import type { CanvasState } from "store";

export function classNames(...classes: unknown[]): string {
    return classes.filter(Boolean).join(" ");
}

/**
 *
 * @param mousePosX
 * @param mousePosY
 * @returns  {[posX, posY]} normalized to 20px grid
 */
export function normalize(
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
