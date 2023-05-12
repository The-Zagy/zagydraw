import { RoughCanvas } from "roughjs/bin/canvas";
import { CanvasState } from "store";
import renderElements from "./renderElements";
import drawGrid from "./renderGrid";
import { ZagyCanvasRectElement } from "types/general";
import renderBoundingRect from "./renderBoundingRect";

function renderScene(
    roughCanvas: RoughCanvas,
    ctx: CanvasRenderingContext2D,
    canvasState: CanvasState,
    multiSelectRect: ZagyCanvasRectElement | null
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
    let renderedElements: CanvasState["elements"] = [...canvasState.elements];
    if(canvasState.previewElement){
        renderedElements.push(canvasState.previewElement);
    }
    if (multiSelectRect) {
        renderedElements.push(multiSelectRect);
    }

    renderElements(
        renderedElements,
        roughCanvas,
        ctx,
        
    );
    renderBoundingRect(canvasState.selectedElements, ctx);
    ctx.restore();
}
export default renderScene;
