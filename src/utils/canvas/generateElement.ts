import { RoughGenerator } from "roughjs/bin/generator";
import { Options } from "roughjs/bin/core";
import { CanvasRectElement } from "types/general";
const genereateRectElement = (
    generator: RoughGenerator,
    startPos: [number, number],
    endPos: [number, number],
    position: CanvasRectElement["curPos"],
    options: Options = {}
): CanvasRectElement => {
    return {
        ...generator.rectangle(
            startPos[0],
            startPos[1],
            endPos[0] - startPos[0],
            endPos[1] - startPos[1],
            {
                fill: "#0b7285",
                stroke: "#0b7285",
                strokeWidth: 2,
                roughness: 0,
                ...options
            }
        ),
        x: startPos[0],
        y: startPos[1],
        endX: endPos[0],
        endY: endPos[1],

        color: "#0b7285",
        shape: "rectangle",
        curPos: position
    };
};
export { genereateRectElement };
