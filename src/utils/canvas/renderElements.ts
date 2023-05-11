import { RoughCanvas } from "roughjs/bin/canvas";
import type { CanvasState } from "store";
import {
    FontTypeOptions,
    type ZagyCanvasElement,
    type ZagyCanvasHandDrawnElement,
    type ZagyCanvasRectElement,
    type CanvasRoughElement,
    type ZagyCanvasTextElement,
    isLine,
    isRect,
    isText,
    isHanddrawn
} from "types/general";

// todo finish this
function isRectVisible(
    rect: ZagyCanvasRectElement,
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

/**
 * draw any element that extend RoughDrawable, and apply the shared options
 * @param el
 * @param ctx
 * @param roughCanvas
 */
export function renderRoughElement(
    el: CanvasRoughElement,
    ctx: CanvasRenderingContext2D,
    roughCanvas: RoughCanvas
) {
    ctx.save();
    let opacity:number;
    if(el.willDelete){
        opacity = el.opacity * .5;
    }else{
        opacity = el.opacity;
    }
    ctx.globalAlpha =opacity ;
    roughCanvas.draw(el);
    ctx.restore();
}

function renderTextElement(
    el: ZagyCanvasTextElement,
    ctx: CanvasRenderingContext2D
) {
    ctx.save();
    ctx.globalAlpha = el.options.opacity;
    ctx.font =
        `${el.options.fontSize}px ` +
        (el.options.font === FontTypeOptions.code
            ? "FiraCode"
            : el.options.font === FontTypeOptions.hand
            ? "HandWritten"
            : "Minecraft");
    ctx.fillStyle = el.options.stroke;
    ctx.textBaseline = "top";
    el.text.forEach((val, i) =>
        ctx.fillText(val, el.x, el.y + i * el.options.fontSize)
    );
    ctx.restore();
}

const renderFreeDrawElement = (
    el: ZagyCanvasHandDrawnElement,
    ctx: CanvasRenderingContext2D
) => {
    ctx.save();
    ctx.fillStyle = "white";
    let opacity:number;
    if(el.willDelete){
        opacity = el.options.opacity * .5;
    }else{
        opacity = el.options.opacity;
    }
  
    ctx.globalAlpha = opacity;
    ctx.fill(el.path);
    ctx.restore();
};

// todo this function needs to take any element as argument and call different draw function for different elements
function renderElements<T extends ZagyCanvasElement>(
    elements: T[],
    roughCanvas: RoughCanvas,
    ctx: CanvasRenderingContext2D
) {
    elements.forEach((el) => {

        if (isRect(el) || isLine(el)) renderRoughElement(el, ctx, roughCanvas);
        else if (isText(el)) {
            renderTextElement(el, ctx);
        } else if (isHanddrawn(el)) {
            renderFreeDrawElement(el, ctx);
        }
 
    });
}
export default renderElements;
