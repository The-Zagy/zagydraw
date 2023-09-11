import { ZagyShape } from "@/types/general";
import { getBoundingRect } from "@/utils";

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "#9b59b6";
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

/**
  draw handles around bounding rect so needs its dimensions/position
*/
function drawHandles(
    ctx: CanvasRenderingContext2D,
    rectPos: { x: [number, number]; y: [number, number] },
) {
    // top left
    drawCircle(ctx, rectPos.x[0], rectPos.y[0]);
    // top right
    drawCircle(ctx, rectPos.x[1], rectPos.y[0]);
    // bottom right
    drawCircle(ctx, rectPos.x[1], rectPos.y[1]);
    // bottom left
    drawCircle(ctx, rectPos.x[0], rectPos.y[1]);

    const xMid = Math.floor((rectPos.x[0] + rectPos.x[1]) / 2);
    const yMid = Math.floor((rectPos.y[0] + rectPos.y[1]) / 2);
    // middle left
    drawCircle(ctx, rectPos.x[0], yMid);
    // middle top
    drawCircle(ctx, xMid, rectPos.y[0]);
    //  middle right
    drawCircle(ctx, rectPos.x[1], yMid);
    // middle bottom
    drawCircle(ctx, xMid, rectPos.y[1]);
}

export default function renderBoundingRect(elements: ZagyShape[], ctx: CanvasRenderingContext2D) {
    if (elements.length === 0) return;
    const rect = getBoundingRect(...elements);
    const [x, y] = [rect[0][0], rect[0][1]];
    const [endX, endY] = [rect[1][0], rect[1][1]];
    const width = endX - x;
    const height = endY - y;
    ctx.save();
    //dashed white line, with four small squares around the corners
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    drawHandles(ctx, {
        x: [x, endX],
        y: [y, endY],
    });
    ctx.restore();
}
