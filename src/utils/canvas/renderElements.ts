import { CACHE_CANVAS_SIZE_THRESHOLD } from "constants/index";
import { RoughCanvas } from "roughjs/bin/canvas";

import {
    FontTypeOptions,
    type ZagyCanvasElement,
    type ZagyCanvasHandDrawnElement,
    type CanvasRoughElement,
    type ZagyCanvasTextElement,
    isLine,
    isRect,
    isText,
    isHanddrawn,
} from "types/general";

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
    if (el.cache) {
        ctx.drawImage(
            el.cache,
            0,
            0,
            el.cache.width,
            el.cache.height,
            el.x - CACHE_CANVAS_SIZE_THRESHOLD,
            el.y - CACHE_CANVAS_SIZE_THRESHOLD,
            el.cache.width,
            el.cache.height
        );
    } else {
        roughCanvas.draw(el);
    }
}

function renderTextElement(el: ZagyCanvasTextElement, ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.font =
        `${el.options.fontSize}px ` +
        (el.options.font === FontTypeOptions.code
            ? "FiraCode"
            : el.options.font === FontTypeOptions.hand
            ? "HandWritten"
            : "Minecraft");
    ctx.fillStyle = el.options.stroke;
    ctx.textBaseline = "top";
    el.text.forEach((val, i) => ctx.fillText(val, el.x, el.y + i * el.options.fontSize));
    ctx.restore();
}

const renderFreeDrawElement = (el: ZagyCanvasHandDrawnElement, ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.fillStyle = "white";
    if (el.cache) {
        console.log("drawing cached element");
        ctx.drawImage(
            el.cache,
            0,
            0,
            el.cache.width,
            el.cache.height,
            el.x - CACHE_CANVAS_SIZE_THRESHOLD / 2,
            el.y - CACHE_CANVAS_SIZE_THRESHOLD / 2,
            el.cache.width,
            el.cache.height
        );
        ctx.restore();
        return;
    }
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
        ctx.save();
        let opacity: number;
        if (el.willDelete) {
            opacity = el.opacity * 0.5;
        } else {
            opacity = el.opacity;
        }
        ctx.globalAlpha = opacity;
        if (isRect(el) || isLine(el)) renderRoughElement(el, ctx, roughCanvas);
        else if (isText(el)) {
            renderTextElement(el, ctx);
        } else if (isHanddrawn(el)) {
            renderFreeDrawElement(el, ctx);
        }
        ctx.restore();
    });
}
export default renderElements;
