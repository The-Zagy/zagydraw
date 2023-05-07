import { RoughCanvas } from "roughjs/bin/canvas";
import type { CanvasState } from "store";
import type {
    CanvasElement,
    CanvasHandDrawnElement,
    CanvasLineElement,
    CanvasRectElement,
    CanvasRoughElement
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
export function renderRoughElement(
    el: CanvasRoughElement,
    roughCanvas: RoughCanvas
) {
    roughCanvas.draw(el);
}
function isRect(el: CanvasElement): el is CanvasRectElement {
    return el.shape === "rectangle";
}

function isLine(el: CanvasElement): el is CanvasLineElement {
    return el.shape === "line";
}
const renderFreeDrawElement = (
    el: CanvasHandDrawnElement,
    ctx: CanvasRenderingContext2D,

) => {
    ctx.save()
    ctx.fillStyle = "white";
    ctx.fill(el.path)
    ctx.restore()
}
// todo this function needs to take any element as argument and call different draw function for different elements

function renderElements<T extends CanvasElement>(
    elements: T[],
    roughCanvas: RoughCanvas,
    ctx: CanvasRenderingContext2D,
    canvasState: CanvasState
) {
    elements.forEach((el) => {
        //todo fix this later when more types are added

        if(isRect(el) ||isLine(el))renderRoughElement(el as CanvasRoughElement, roughCanvas);
        // eslint-disable-next-line
        //@ts-ignore
        else renderFreeDrawElement(el, ctx, canvasState);
    });
}
export default renderElements;
