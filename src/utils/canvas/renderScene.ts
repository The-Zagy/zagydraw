import { RoughCanvas } from "roughjs/bin/canvas";
import { CanvasState } from "store";
import drawElements from "./drawElements";
import drawGrid from "./drawGrid";

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
    // i hate this but don't think i can mutate the state
    // and i want to sleep so i want add another argument
    console.log(canvasState.notReadyElement);
    drawElements(
        canvasState.notReadyElement !== null
            ? [...canvasState.elements, canvasState.notReadyElement]
            : canvasState.elements,
        roughCanvas,
        canvasState
    );
    ctx.restore();
}
export default renderScene;
