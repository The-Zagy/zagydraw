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
    let x = Math.round((posX - xStart) / 20) * 20;
    // add the distortion to be synced with our non perfect square
    x += xStart;
    console.log("🪵 [index.ts:24] ~ token ~ \x1b[0;32mx\x1b[0m = ", x);
    // for perfect square this would be the normalized y pos
    let y = Math.round((posY - yStart) / 20) * 20;
    // add the distortion to be synced with our non perfect square
    y += yStart;
    console.log("🪵 [index.ts:29] ~ token ~ \x1b[0;32my\x1b[0m = ", y);
    return [x, y];
    // return [Math.round(posX / 20) * 20, posY];
}
