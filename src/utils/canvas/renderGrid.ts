import { CELL_SIZE } from "@/constants/index";

function drawGrid(
    x: number,
    y: number,
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D,
    zoom = 1,
    color = "#282828",
    cellSide = CELL_SIZE,
    lineWidth = 1.3
) {
    cellSide *= zoom;
    const xStart = Math.floor(y) % cellSide;
    const yStart = Math.floor(x) % cellSide;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth * zoom;
    ctx.beginPath();
    for (let i = xStart; i < height; i += cellSide) {
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
    }
    for (let i = yStart; i < width; i += cellSide) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
    }
    ctx.stroke();
}
export default drawGrid;
