import { RoughCanvas } from "roughjs/bin/canvas";
import { CanvasState } from "store";
import renderElements from "./renderElements";
import drawGrid from "./renderGrid";

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

    renderElements(
        canvasState.previewElement !== null
            ? [...canvasState.elements, canvasState.previewElement]
            : canvasState.elements,
        roughCanvas,
        canvasState
    );
    ctx.restore();
}
export default renderScene;
