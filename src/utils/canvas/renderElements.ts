import { RoughCanvas } from "roughjs/bin/canvas";
import type { CanvasState } from "store";
import type {
    CanvasElement,
    CanvasHandDrawnElement,
    CanvasLineElement,
    CanvasRectElement,
    CanvasRoughElement,
    CanvasTextElement
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
    ctx: CanvasRenderingContext2D,
    roughCanvas: RoughCanvas
) {
    ctx.save();
    ctx.globalAlpha = el.opacity;
    roughCanvas.draw(el);
    ctx.restore();
}
function isRect(el: CanvasElement): el is CanvasRectElement {
    return el.shape === "rectangle";
}

function isLine(el: CanvasElement): el is CanvasLineElement {
    return el.shape === "line";
}

function isText(el: CanvasElement): el is CanvasTextElement {
    return el.shape === "text";
}

function isHanddrawn(el: CanvasElement): el is CanvasHandDrawnElement {
    return el.shape === "handdrawn";
}

function renderTextElement(
    el: CanvasTextElement,
    ctx: CanvasRenderingContext2D
) {
    ctx.save();
    ctx.globalAlpha = el.opacity;
    ctx.font = el.font;
    ctx.fillStyle = el.color;
    ctx.textBaseline = "top";
    ctx.fillText(el.text, el.x, el.y);
    ctx.restore();
}

const renderFreeDrawElement = (
    el: CanvasHandDrawnElement,
    ctx: CanvasRenderingContext2D
) => {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.globalAlpha = el.opacity;
    ctx.fill(el.path);
    ctx.restore();
};
// todo this function needs to take any element as argument and call different draw function for different elements

function renderElements<T extends CanvasElement>(
    elements: T[],
    roughCanvas: RoughCanvas,
    ctx: CanvasRenderingContext2D,
    canvasState: CanvasState
) {
    elements.forEach((el) => {
        if (isRect(el) || isLine(el))
            renderRoughElement(el as CanvasRoughElement, ctx, roughCanvas);
        else if (isText(el)) {
            renderTextElement(el, ctx);
        } else if (isHanddrawn(el)) {
            renderFreeDrawElement(el, ctx);
        }
    });
}
export default renderElements;
