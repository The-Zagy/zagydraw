import type { CanvasState } from "store";

export function classNames(...classes: unknown[]): string {
    return classes.filter(Boolean).join(" ");
}

// TODO NOT WORKING FIXXXXXXXXXXXXXXXXXXXXXXX6XX9X
/**
 *
 * @param posX
 * @param posY
 * @returns [posX, posY]
 */
export function normalize(
    pos: CanvasState["position"],
    posX: number,
    posY: number
): [number, number] {
    const xStart = Math.floor(pos.y) % 20;
    const yStart = Math.floor(pos.x) % 20;
    // for perfect square this would be the normalized x pos
    let x = Math.round((posX - yStart) / 20);
    x = yStart + x * 20;
    // for perfect square this would be the normalized y pos
    let y = Math.round((posY - xStart) / 20);
    y = xStart + y * 20;
    return [x - pos.x, y - pos.y];
}
