import { RoughCanvas } from "roughjs/bin/canvas";
import type {
    CanvasElement,
    CanvasLineElement,
    CanvasRectElement,
    CanvasState
} from "store";

// todo finish this
function isRectVisible(
    rect: CanvasRectElement,
    canvasState: CanvasState
): boolean {
    // we assume that the infinte canvas is in the 4th quarter
    // so for element to be visble it needs to have x more than canvas's current visible x and less than window width
    // and have y less than canvas's current visible y and less than window height
    return (
        rect.x > canvasState.position.x &&
        rect.x < canvasState.width &&
        rect.y < canvasState.position.y &&
        rect.y < canvasState.height
    );
}
function drawRectElement(
    element: CanvasRectElement,
    ctx: RoughCanvas,
    canvasState: CanvasState["position"]
) {
    ctx.rectangle(
        canvasState.x - element.curPos.x + element.x,
        canvasState.y - element.curPos.y + element.y,
        element.w,
        element.h,
        { stroke: element.color, roughness: 0 }
    );
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
    return (
        "h" in el &&
        "w" in el &&
        typeof el["w"] === "number" &&
        typeof el["h"] === "number"
    );
}

function isLine(el: CanvasElement): el is CanvasLineElement {
    return "w" in el && typeof el["w"] === "number";
}

// todo this function needs to take any element as argument and call different draw function for different elements
// todo change it to drawScene and include draw the grid in it
function drawElements<T extends CanvasElement>(
    elements: T[],
    ctx: RoughCanvas,
    canvasState: CanvasState["position"]
) {
    elements.forEach((el) => {
        if (isRect(el)) {
            drawRectElement(el, ctx, canvasState);
        } else if (isLine(el)) {
            drawLineElement(el, ctx, canvasState);
        }
    });
}
export default drawElements;
