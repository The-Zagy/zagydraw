import { RoughGenerator } from "roughjs/bin/generator";
import { ElementTypes, ZagyPortableT } from "@/types/general";
import { Point, pointInRectangle } from "@/utils";

export default abstract class Shape<T> {
    protected abstract options: T;
    protected abstract boundingRect: [Point, Point];
    public willDelete = false;
    public id: string;
    public shape: ElementTypes;
    constructor(id: string, shape: ElementTypes) {
        this.id = id;
        this.shape = shape;
    }

    static generator: RoughGenerator = new RoughGenerator();
    public abstract move(walkX: number, walkY: number): this;
    public abstract moveTo(startPos: Point): this;
    /**
     * every shape must return cleaned up version of itself and satisify the `ZagyPortableT`
     */
    public copy(): ZagyPortableT["elements"][number] {
        return { id: this.id, shape: this.shape, options: this.options };
    }
    public render(ctx: CanvasRenderingContext2D, _: number): void {
        ctx.globalAlpha = this.willDelete
            ? (this.options as { opacity: number }).opacity * 0.5
            : (this.options as { opacity: number }).opacity;
    }
    /*
     * Regenerates the shape with new options, all options are optional and will be merged with the current options
     */
    public abstract generate(options: T): this;
    public abstract regenerate(options: Partial<T>): this;
    public isHit(mouseCoords: Point): boolean {
        const x = this.boundingRect[0][0];
        const y = this.boundingRect[0][1];
        const endX = this.boundingRect[1][0];
        const endY = this.boundingRect[1][1];
        return pointInRectangle([x, y], [endX, y], [endX, endY], [x, endY], mouseCoords);
    }
    public isVisible(
        rectStart: [x: number, y: number],
        width: number,
        height: number,
        zoom: number,
    ): boolean {
        const [x, y] = this.boundingRect[0];
        const [endX, endY] = this.boundingRect[1];
        const [rectX, rectY] = rectStart;
        const rectEndX = rectX + width / zoom;
        const rectEndY = rectY + height / zoom;
        // if any of the element's corners is inside the rectangle that is the screen
        // also notice that we don't need to do the same calculations in the function pointInRectangle
        // because we know for sure that the screen isn't rotated
        if (x <= rectEndX && endX >= rectX && y <= rectEndY && endY >= rectY) {
            return true;
        }
        return false;
    }
    getBoundingRect(): [Point, Point] {
        return this.boundingRect;
    }
    getOptions(): T {
        return this.options;
    }
}
