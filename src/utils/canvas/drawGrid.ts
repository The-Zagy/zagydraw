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
    const xStart = Math.floor(y) % cellSide;
    console.log(
        "🪵 [drawGrid.ts:11] ~ token ~ \x1b[0;32mxStart\x1b[0m = ",
        xStart
    );
    const yStart = Math.floor(x) % cellSide;
    console.log(
        "🪵 [drawGrid.ts:13] ~ token ~ \x1b[0;32myStart\x1b[0m = ",
        yStart
    );
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
