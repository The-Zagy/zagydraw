import rough from "roughjs";
import { randomSeed } from "roughjs/bin/math";
import { nanoid } from "nanoid";
import Shape from "./shape";
import { Point, distance, getGlobalMinMax } from "@/utils";
import { LineOptions, LineRequiredOptions } from "@/types/general";
import { CACHE_CANVAS_SIZE_THRESHOLD } from "@/constants";
import { useStore } from "@/store";
const { getElementConfigState: getConfigState } = useStore.getState();

export class Line extends Shape<LineOptions & LineRequiredOptions> {
    private cacheCanvas!: HTMLCanvasElement;
    private cacheCtx!: CanvasRenderingContext2D;
    protected options!: LineOptions & LineRequiredOptions;
    protected boundingRect!: [Point, Point];
    static pointNearLine = (A: Point, B: Point, M: Point): boolean => {
        A = [Math.round(A[0]), Math.round(A[1])];
        B = [Math.round(B[0]), Math.round(B[1])];
        M = [Math.round(M[0]), Math.round(M[1])];
        const AM = distance(A, M);
        const MB = distance(M, B);
        const AB = distance(A, B);
        const diff = Math.abs(AB - (AM + MB));
        // 3 is the threshold for now
        if (diff < 3) return true;
        return false;
    };
    constructor(options: Partial<LineOptions> & LineRequiredOptions) {
        super(nanoid(), "line");
        this.generate(options);
    }
    public generate(options: Partial<LineOptions> & LineRequiredOptions) {
        const {
            minX: x,
            minY: y,
            maxX: endX,
            maxY: endY,
        } = getGlobalMinMax([options.point1, options.point2]);
        //choose point1 as the point with the loweer y and point2 as the point with the higher y
        if (options.point1[1] < options.point2[1]) {
            const temp = options.point1;
            options.point1 = options.point2;
            options.point2 = temp;
        }
        const normalizedOptions = this.normalizeOptions(options);
        const tempStartPos: Point = [
            options.point1[0] + CACHE_CANVAS_SIZE_THRESHOLD,
            options.point1[1] + CACHE_CANVAS_SIZE_THRESHOLD,
        ];
        const tempEndPos: Point = [
            options.point2[0] + CACHE_CANVAS_SIZE_THRESHOLD,
            options.point2[1] + CACHE_CANVAS_SIZE_THRESHOLD,
        ];
        const roughElement = Shape.generator.line(...tempStartPos, ...tempEndPos, {
            roughness: 2,
            ...normalizedOptions,
        });
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
        cacheCtx.translate(-x, -y);
        rough.canvas(cacheCanvas).draw(roughElement);
        this.boundingRect = [
            [x, y],
            [endX, endY],
        ];
        this.cacheCanvas = cacheCanvas;
        this.cacheCtx = cacheCtx;
        this.options = normalizedOptions;
        return this;
    }
    public regenerate(options: Partial<LineOptions & LineRequiredOptions>) {
        return this.generate({
            ...this.options,
            ...options,
        });
    }
    private normalizeOptions(
        options: Partial<LineOptions> & LineRequiredOptions,
    ): LineOptions & LineRequiredOptions {
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
        super.render(ctx, zoom);
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

    public move(walkX: number, walkY: number) {
        this.boundingRect[0][0] += walkX;
        this.boundingRect[0][1] += walkY;
        this.boundingRect[1][0] += walkX;
        this.boundingRect[1][1] += walkY;

        return this.regenerate({
            point1: this.boundingRect[0],
            point2: this.boundingRect[1],
        });
    }

    //@ts-ignore-next-line
    public moveTo(newStart: Point) {
        const offsetX = newStart[0] - this.boundingRect[0][0];
        const offsetY = newStart[1] - this.boundingRect[0][1];
        const point1 = [
            this.options.point1[0] + offsetX,
            this.options.point1[1] + offsetY,
        ] as Point;
        const point2 = [
            this.options.point2[0] + offsetX,
            this.options.point2[1] + offsetY,
        ] as Point;
        return this.regenerate({
            point1,
            point2,
        });
    }
    public isHit(mouseCoords: Point): boolean {
        return Line.pointNearLine(this.options.point1, this.options.point2, mouseCoords);
    }
}
