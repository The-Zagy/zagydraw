import { RoughCanvas } from "roughjs/bin/canvas";
import { CanvasState } from "store";
import renderElements from "./renderElements";
import drawGrid from "./renderGrid";

import renderBoundingRect from "./renderBoundingRect";

function renderScene(
    roughCanvas: RoughCanvas,
    ctx: CanvasRenderingContext2D,
    canvasState: CanvasState
) {
    ctx.clearRect(0, 0, canvasState.width, canvasState.height);
    ctx.fillStyle = "dark";
    ctx.fillRect(0, 0, canvasState.width, canvasState.height);

    drawGrid(
        canvasState.position.x,
        canvasState.position.y,
        canvasState.width,
        canvasState.height,
        ctx
    );
    ctx.save();
    ctx.translate(canvasState.position.x, canvasState.position.y);
    const renderedElements: CanvasState["elements"] = [...canvasState.visibleElements];
    if (canvasState.previewElement) {
        renderedElements.push(canvasState.previewElement);
    }
    if (canvasState.multiSelectRect) {
        renderedElements.push(canvasState.multiSelectRect);
    }
    console.log("elements length", canvasState.elements.length);
    renderElements(renderedElements, roughCanvas, ctx);
    renderBoundingRect(canvasState.selectedElements, ctx);
    ctx.restore();
}
export default renderScene;
