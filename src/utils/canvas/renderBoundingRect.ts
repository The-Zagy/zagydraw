import { ZagyCanvasElement } from "types/general";
import { getBoundingRect } from "utils";

export default function renderBoundingRect(
    elements: ZagyCanvasElement[],
    ctx: CanvasRenderingContext2D,
) {
    const rect = getBoundingRect(...elements);
    if (!rect) return;
    const [x, y] = [rect[0][0] , rect[0][1]]
    const [endX, endY] = [rect[1][0] , rect[1][1]]
    const width = endX - x;
    const height = endY - y;
    ctx.save();
    //dashed white line
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y,width, height);
    ctx.restore();
}