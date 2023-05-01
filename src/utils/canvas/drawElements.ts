import { RoughCanvas } from "roughjs/bin/canvas";
import type { CanvasElement, CanvasRectElement, CanvasState } from "store";

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
function drawElement(
    element: CanvasElement,
    ctx: RoughCanvas,
    canvasState: CanvasState["position"]
) {
    ctx.rectangle(
        canvasState.x - element.curPos.x + element.x,
        canvasState.y - element.curPos.y + element.y,
        100,
        100,
        { stroke: element.color, roughness: 0 }
    );
}
function drawElements(
    elements: CanvasElement[],
    ctx: RoughCanvas,
    canvasState: CanvasState["position"]
) {
    elements.forEach((el) => {
        drawElement(el, ctx, canvasState);
    });
}
export default drawElements;
