import { RoughCanvas } from "roughjs/bin/canvas";

import {
    FontTypeOptions,
    type ZagyCanvasElement,
    type ZagyCanvasHandDrawnElement,
    type ZagyCanvasTextElement,
    isLine,
    isRect,
    isText,
    isHanddrawn,
    ZagyCanvasRectElement,
    ZagyCanvasLineElement,
    ZagyCanvasImageElement,
    isImage,
} from "@/types/general";

import {
    CACHE_CANVAS_SIZE_THRESHOLD,
    PREVIEW_IMAGE_HEIGHT,
    PREVIEW_IMAGE_WIDTH,
} from "@/constants/index";

/**
 * draw any element that extend RoughDrawable, and apply the shared options
 * @param el
 * @param ctx
 * @param roughCanvas
 */
export function renderRoughElement(
    el: ZagyCanvasRectElement | ZagyCanvasLineElement,
    ctx: CanvasRenderingContext2D,
    roughCanvas: RoughCanvas,
    zoom: number,
) {
    if (el.cache) {
        ctx.save();
        ctx.scale(1 / zoom, 1 / zoom);
        ctx.drawImage(
            el.cache,
            0,
            0,
            el.cache.width,
            el.cache.height,
            (el.x - CACHE_CANVAS_SIZE_THRESHOLD) * zoom,
            (el.y - CACHE_CANVAS_SIZE_THRESHOLD) * zoom,
            el.cache.width,
            el.cache.height,
        );
        ctx.restore();
    } else {
        roughCanvas.draw(el.roughElement);
    }
}

function renderTextElement(el: ZagyCanvasTextElement, ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.font = `${el.options.fontSize}px ` + FontTypeOptions[el.options.font];
    console.log("re", `${el.options.fontSize}px ` + FontTypeOptions[el.options.font]);
    ctx.fillStyle = el.options.stroke;
    ctx.textBaseline = "top";
    el.text.forEach((val, i) => ctx.fillText(val, el.x, el.y + i * el.options.fontSize));
    ctx.restore();
}

const renderFreeDrawElement = (
    el: ZagyCanvasHandDrawnElement,
    ctx: CanvasRenderingContext2D,
    zoom: number,
) => {
    ctx.save();
    ctx.fillStyle = "white";
    if (el.cache) {
        ctx.scale(1 / zoom, 1 / zoom);
        ctx.drawImage(
            el.cache,
            0,
            0,
            el.cache.width,
            el.cache.height,
            (el.x - CACHE_CANVAS_SIZE_THRESHOLD / 2) * zoom,
            (el.y - CACHE_CANVAS_SIZE_THRESHOLD / 2) * zoom,
            el.cache.width,
            el.cache.height,
        );
        ctx.restore();
        return;
    }
    ctx.fillStyle = el.options.stroke;
    ctx.fill(el.path2D);
    ctx.restore();
};

function renderImageElement(
    el: ZagyCanvasImageElement,
    ctx: CanvasRenderingContext2D,
    zoom: number,
) {
    ctx.save();
    ctx.scale(1 / zoom, 1 / zoom);
    // draw placeholder while loading the image, when the image is loaded will trigger rerender with new element that is not promise
    if (el.imgRef instanceof Promise) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeRect(el.x, el.y, PREVIEW_IMAGE_WIDTH, PREVIEW_IMAGE_HEIGHT);
    } else {
        ctx.drawImage(
            el.imgRef,
            0,
            0,
            el.imgRef.width,
            el.imgRef.height,
            el.x * zoom,
            el.y * zoom,
            el.endX - el.x,
            el.endY - el.y,
        );
    }
    ctx.restore();
    return;
}

// todo this function needs to take any element as argument and call different draw function for different elements
function renderElements<T extends ZagyCanvasElement>(
    elements: T[],
    roughCanvas: RoughCanvas,
    ctx: CanvasRenderingContext2D,
    zoom: number,
) {
    elements.forEach((el) => {
        ctx.save();
        let opacity: number;
        if (el.willDelete) {
            opacity = el.options.opacity * 0.5;
        } else {
            opacity = el.options.opacity;
        }
        ctx.globalAlpha = opacity;
        if (isRect(el) || isLine(el)) renderRoughElement(el, ctx, roughCanvas, zoom);
        else if (isText(el)) {
            renderTextElement(el, ctx);
        } else if (isHanddrawn(el)) {
            renderFreeDrawElement(el, ctx, zoom);
        } else if (isImage(el)) {
            renderImageElement(el, ctx, zoom);
        }
        ctx.restore();
    });
}
export default renderElements;
