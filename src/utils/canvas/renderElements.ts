import { RoughCanvas } from "roughjs/bin/canvas";
import type { CanvasState } from "store";
import type {
    CanvasElement,
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

// todo this function needs to take any element as argument and call different draw function for different elements
// todo change it to drawScene and include draw the grid in it
function renderElements<T extends CanvasElement>(
    elements: T[],
    ctx: RoughCanvas,
    canvasState: CanvasState
) {
    elements.forEach((el) => {
        //todo fix this later when more types are added
        // eslint-disable-next-line
        //@ts-ignore
        renderRoughElement(el as CanvasRoughElement, ctx);
    });
}
export default renderElements;
