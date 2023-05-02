import { RoughCanvas } from "roughjs/bin/canvas";
import type { CanvasState } from "store";
import type {
    CanvasElement,
    CanvasLineElement,
    CanvasRectElement
} from "types/general";
// todo finish this
function isRectVisible(
    rect: CanvasRectElement,
    canvasState: CanvasState
): boolean {
    // we assume that the infinte canvas is in the 4th quarter
    // so for element to be visble it needs to have x more than canvas's current visible x and less than window width
    // and have y less than canvas's current visible y and less than window height

    //!todo fix this
    const xDiff = Math.abs(rect.x - canvasState.position.y);
    const yDiff = Math.abs(rect.y - canvasState.position.x);
    return xDiff < canvasState.width && yDiff < canvasState.height;
}
function drawRectElement(element: CanvasRectElement, ctx: RoughCanvas) {
    ctx.draw(element);
}

// TODO Alot of hard coded values, all need to be generic
function drawLineElement(
    element: CanvasLineElement,
    ctx: RoughCanvas,
    canvasState: CanvasState["position"]
) {
    const x1 = canvasState.x - element.curPos.x + element.x;
    const y1 = canvasState.y - element.curPos.y + element.y;
    ctx.line(x1, y1, x1 + 70, y1, {
        stroke: element.color,
        roughness: 0
    });
}

function isRect(el: CanvasElement): el is CanvasRectElement {
    return el.shape === "rectangle";
}

function isLine(el: CanvasElement): el is CanvasLineElement {
    return "w" in el && typeof el["w"] === "number";
}

// todo this function needs to take any element as argument and call different draw function for different elements
// todo change it to drawScene and include draw the grid in it
function drawElements<T extends CanvasElement>(
    elements: T[],
    ctx: RoughCanvas,
    canvasState: CanvasState
) {
    elements.forEach((el) => {
        if (isRect(el)) {
            if (!isRectVisible(el, canvasState)) {
                console.log("rect not rendered", el.curPos);
                return;
            }

            drawRectElement(el, ctx);
        } else if (isLine(el)) {
            const x = 4;
        }
    });
}
export default drawElements;
