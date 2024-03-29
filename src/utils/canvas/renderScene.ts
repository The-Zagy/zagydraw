import renderElements from "./renderElements";
import drawGrid from "./renderGrid";

import renderBoundingRect from "./renderBoundingRect";
import { CanvasState } from "@/store";

function renderScene(ctx: CanvasRenderingContext2D, canvasState: CanvasState) {
    ctx.clearRect(0, 0, canvasState.width, canvasState.height);
    ctx.fillStyle = "dark";
    ctx.fillRect(0, 0, canvasState.width, canvasState.height);

    drawGrid(
        canvasState.position.x,
        canvasState.position.y,
        canvasState.width,
        canvasState.height,
        ctx,
        canvasState.zoomLevel,
    );
    ctx.save();

    ctx.translate(canvasState.position.x, canvasState.position.y);
    ctx.scale(canvasState.zoomLevel, canvasState.zoomLevel);
    const renderedElements: CanvasState["elements"] = [...canvasState.elements];

    if (canvasState.previewElement) {
        renderedElements.push(canvasState.previewElement);
    }
    if (canvasState.multiSelectRect) {
        renderedElements.push(canvasState.multiSelectRect);
    }
    renderElements(renderedElements, ctx, canvasState.zoomLevel);
    renderBoundingRect(canvasState.selectedElements, ctx);
    ctx.restore();
}
export default renderScene;
