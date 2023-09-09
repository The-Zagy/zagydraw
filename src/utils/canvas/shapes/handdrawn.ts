import { nanoid } from "nanoid";
import getStroke from "perfect-freehand";
import Shape from "./shape";
import { Point, average, getGlobalMinMax } from "@/utils";
import { HandDrawnOptions, HandDrawnRequiredOptions } from "@/types/general";
import { CACHE_CANVAS_SIZE_THRESHOLD } from "@/constants";
import { useStore } from "@/store";
const { getElementConfigState: getConfigState } = useStore.getState();

export class HandDrawn extends Shape<HandDrawnOptions & HandDrawnRequiredOptions> {
    private cacheCanvas!: HTMLCanvasElement;
    private cacheCtx!: CanvasRenderingContext2D;
    protected options!: HandDrawnOptions & HandDrawnRequiredOptions;
    protected boundingRect!: [Point, Point];
    protected path2D!: Path2D;

    static constructHandDrawnElementPath2D = (
        options: HandDrawnOptions & HandDrawnRequiredOptions,
    ) => {
        const stroke = getStroke(options.paths, {
            size: options.strokeWidth + 2,
            smoothing: 1.5,
            thinning: 0,
            streamline: 0,
            easing: (t) => t,
            start: {
                taper: 0,
                cap: true,
            },
            end: {
                taper: 0,
                cap: true,
            },
        });
        const svgFromStroke = HandDrawn.getSvgPathFromStroke(stroke);
        return new Path2D(svgFromStroke);
    };
    static getSvgPathFromStroke(points: number[][], closed = true): string {
        const len = points.length;
        if (len < 4) {
            return ``;
        }
        let a = points[0];
        let b = points[1];
        const c = points[2];
        let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(
            2,
        )} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;
        for (let i = 2, max = len - 1; i < max; i++) {
            a = points[i];
            b = points[i + 1];
            result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
        }
        if (closed) {
            result += "Z";
        }
        return result;
    }
    constructor(options: Partial<HandDrawnOptions> & HandDrawnRequiredOptions) {
        super(nanoid(), "handdrawn");
        this.generate(options);
    }
    public generate(options: Partial<HandDrawnOptions> & HandDrawnRequiredOptions) {
        const normalizedOptions = this.normalizeOptions(options);
        const path2D = HandDrawn.constructHandDrawnElementPath2D(normalizedOptions);
        const { minX: x, minY: y, maxX: endX, maxY: endY } = getGlobalMinMax(options.paths);
        const cacheCanvas = document.createElement("canvas");
        cacheCanvas.width = endX - x + CACHE_CANVAS_SIZE_THRESHOLD;
        cacheCanvas.height = endY - y + CACHE_CANVAS_SIZE_THRESHOLD;
        // we need to account for zooming
        cacheCanvas.width *= normalizedOptions.zoom;
        cacheCanvas.height *= normalizedOptions.zoom;
        const cacheCtx = cacheCanvas.getContext("2d");
        if (!cacheCtx) throw new Error("cacheCtx is null");
        cacheCtx.scale(normalizedOptions.zoom, normalizedOptions.zoom);
        cacheCtx.translate(
            -x + CACHE_CANVAS_SIZE_THRESHOLD / 2,
            -y + CACHE_CANVAS_SIZE_THRESHOLD / 2,
        );
        cacheCtx.fillStyle = normalizedOptions.stroke;
        cacheCtx.fill(path2D);
        this.boundingRect = [
            [x, y],
            [endX, endY],
        ];
        this.cacheCanvas = cacheCanvas;
        this.cacheCtx = cacheCtx;
        this.options = normalizedOptions;
        this.path2D = path2D;
        return this;
    }
    public regenerate(options: Partial<HandDrawnOptions & HandDrawnRequiredOptions>) {
        return this.generate({
            ...this.options,
            ...options,
        });
    }
    private normalizeOptions(
        options: Partial<HandDrawnOptions> & HandDrawnRequiredOptions,
    ): HandDrawnOptions & HandDrawnRequiredOptions {
        const globalConfig = getConfigState();
        const zoom = useStore.getState().zoomLevel;
        return {
            ...options,
            opacity: options.opacity || globalConfig.opacity,
            stroke: options.stroke || globalConfig.stroke,
            strokeWidth: options.strokeWidth || globalConfig.strokeWidth,
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
        const newPaths = this.options.paths.map((p) => [p[0] - walkX, p[1] - walkY] as Point);
        return this.regenerate({ paths: newPaths });
    }
}
