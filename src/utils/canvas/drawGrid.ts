function drawGrid(
    x: number,
    y: number,
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D,
    color = "#282828",
    cellSide = 20,
    lineWidth = 1
) {
    console.log(x, y);
    const xStart = Math.floor(y) % cellSide;
    const yStart = Math.floor(x) % cellSide;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
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
