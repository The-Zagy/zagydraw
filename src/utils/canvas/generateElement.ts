import Shape from "./shapes/shape";
import { ZagyRectangle } from "./shapes";
import { ZagyShape } from "@/types/general";
import { Point } from "@/utils";

const generateSelectRectElement = (startPos: Point, endPos: Point) => {
    return new ZagyRectangle({
        fill: "#9b59b6",
        fillStyle: "solid",
        strokeWidth: 1,
        stroke: "transparent",
        seed: 1,
        opacity: 0.3,
        strokeLineDash: [],
        point1: startPos,
        point2: endPos,
        // todo add roughness to config
        // @ts-ignore
        roughness: 0,
    });
};

const regenerateCacheElement = (el: ZagyShape, newZoom: number): ZagyShape => {
    if (el instanceof Shape) {
        return el.regenerate({
            zoom: newZoom,
        });
    } else {
        return el;
    }
};

export { generateSelectRectElement, regenerateCacheElement };
