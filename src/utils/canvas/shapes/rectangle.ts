import rough from "roughjs";
import { randomSeed } from "roughjs/bin/math";
import { nanoid } from "nanoid";
import Shape from "./shape";
import { Point, normalizeRectCoords, normalizeToGrid } from "@/utils";
import { RectOptions, RectRequiredOptions } from "@/types/general";
import { CACHE_CANVAS_SIZE_THRESHOLD } from "@/constants";
import { useStore } from "@/store";
const { getElementConfigState: getConfigState } = useStore.getState();
export class Rectangle extends Shape<RectOptions & RectRequiredOptions> {
    private cacheCanvas!: HTMLCanvasElement;
    private cacheCtx!: CanvasRenderingContext2D;
    protected options!: RectOptions & RectRequiredOptions;
    protected boundingRect!: [Point, Point];
    constructor(options: Partial<RectOptions> & RectRequiredOptions) {
        super(nanoid(), "rectangle");
        this.generate(options);
    }
    public generate(options: Partial<RectOptions> & RectRequiredOptions) {
        const { x, y, endX, endY } = normalizeRectCoords(options.point1, options.point2);
        if (endX - x < 10 || endY - y < 10) {
            throw new Error("Element is too small");
        }
        const normalizedOptions = this.normalizeOptions(options);
        const roughElement = Shape.generator.rectangle(
            CACHE_CANVAS_SIZE_THRESHOLD,
            CACHE_CANVAS_SIZE_THRESHOLD,
            endX - x,
            endY - y,
            {
                roughness: 2,
                ...normalizedOptions,
            },
        );
        const cacheCanvas = document.createElement("canvas");
        // we have to add some threshold because roughjs rects have some offset
        cacheCanvas.width = endX - x + CACHE_CANVAS_SIZE_THRESHOLD * 4;
        cacheCanvas.height = endY - y + CACHE_CANVAS_SIZE_THRESHOLD * 4;
        // we need to account for zooming
        cacheCanvas.width *= normalizedOptions.zoom;
        cacheCanvas.height *= normalizedOptions.zoom;
        const cacheCtx = cacheCanvas.getContext("2d");
        if (!cacheCtx) throw new Error("cacheCtx is null");
        cacheCtx.scale(normalizedOptions.zoom, normalizedOptions.zoom);
        rough.canvas(cacheCanvas).draw(roughElement);
        this.cacheCanvas = cacheCanvas;
        this.cacheCtx = cacheCtx;
        this.options = normalizedOptions;
        this.boundingRect = [
            [x, y],
            [endX, endY],
        ];
        return this;
    }
    public regenerate(options: Partial<RectOptions & RectRequiredOptions>) {
        return this.generate({
            ...this.options,
            ...options,
        });
    }
    private normalizeOptions(
        options: Partial<RectOptions> & RectRequiredOptions,
    ): RectOptions & RectRequiredOptions {
        const globalConfig = getConfigState();
        const zoom = useStore.getState().zoomLevel;
        return {
            ...options,
            fill: options.fill || globalConfig.fill,
            fillStyle: options.fillStyle || globalConfig.fillStyle,
            opacity: options.opacity || globalConfig.opacity,
            stroke: options.stroke || globalConfig.stroke,
            strokeLineDash: options.strokeLineDash || globalConfig.strokeLineDash,
            strokeWidth: options.strokeWidth || globalConfig.strokeWidth,
            seed: options.seed || randomSeed(),
            zoom: options.zoom || zoom,
        };
    }
    public render(ctx: CanvasRenderingContext2D, zoom: number): void {
        ctx.save();
        ctx.scale(1 / zoom, 1 / zoom);
        ctx.drawImage(
            this.cacheCanvas,
            0,
            0,
            this.cacheCanvas.width,
            this.cacheCanvas.height,
            (this.boundingRect[0][0] - CACHE_CANVAS_SIZE_THRESHOLD) * zoom,
            (this.boundingRect[0][1] - CACHE_CANVAS_SIZE_THRESHOLD) * zoom,
            this.cacheCanvas.width,
            this.cacheCanvas.height,
        );
        ctx.restore();
    }
    public copy() {
        return { ...this.options, shape: this.shape };
    }
    public move(walkX: number, walkY: number) {
        const position = useStore.getState().position;

        this.boundingRect[0][0] += walkX;
        this.boundingRect[0][1] += walkY;
        this.boundingRect[1][0] += walkX;
        this.boundingRect[1][1] += walkY;
        return this.regenerate({
            point1: normalizeToGrid(position, this.boundingRect[0]),
            point2: normalizeToGrid(position, this.boundingRect[1]),
        });
    }
    public moveTo(newStart: Point) {
        return this.regenerate({
            point1: newStart,
            point2: [
                newStart[0] + this.boundingRect[1][0] - this.boundingRect[0][0],
                newStart[1] + this.boundingRect[1][1] - this.boundingRect[0][1],
            ],
        });
    }
    public isElementInside(shape: Shape<unknown>) {
        const [x, y] = this.boundingRect[0];
        const [endX, endY] = this.boundingRect[1];
        const [targetX, targetY] = shape.getBoundingRect()[0];
        const [targetEndX, targetEndY] = shape.getBoundingRect()[1];
        if (targetX >= x && targetY >= y && targetEndX <= endX && targetEndY <= endY) {
            return true;
        }
        return false;
    }
}
