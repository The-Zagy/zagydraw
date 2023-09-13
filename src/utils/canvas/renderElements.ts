import { ZagyShape } from "@/types/general";

function renderElements<T extends ZagyShape>(
    elements: T[],
    ctx: CanvasRenderingContext2D,
    zoom: number,
) {
    elements.forEach((el) => {
        ctx.save();
        el.render(ctx, zoom);
        ctx.restore();
    });
}
export default renderElements;
