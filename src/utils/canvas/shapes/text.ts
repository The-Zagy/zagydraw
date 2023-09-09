import { nanoid } from "nanoid";
import Shape from "./shape";
import { Point, getCorrectCoordOrder } from "@/utils";
import { FontTypeOptions, TextOptions, TextRequiredOptions } from "@/types/general";
import { useStore } from "@/store";
const { getElementConfigState: getConfigState } = useStore.getState();
export class Text extends Shape<TextOptions & TextRequiredOptions> {
    // todo add a cache canvas for text
    protected options!: TextOptions & TextRequiredOptions;
    protected text!: string[];
    protected boundingRect!: [Point, Point];
    constructor(options: Partial<TextOptions> & TextRequiredOptions) {
        super(nanoid(), "rectangle");
        this.generate(options);
    }
    public generate(options: Partial<TextOptions> & TextRequiredOptions) {
        const normalizedOptions = this.normalizeOptions(options);
        const tempCanvas = document.createElement("canvas");
        const ctx = tempCanvas.getContext("2d");
        if (!ctx) throw new Error("GENERATE TEXT: must have ctx to be able to create new text");
        const lines = options.text.split("\n");
        // text element width is the largest line width
        let largestLineIndex = 0;
        let tempLen = lines[0].length;
        lines.forEach((val, i) => {
            if (val.length > tempLen) {
                tempLen = val.length;
                largestLineIndex = i;
            }
        });
        ctx.save();
        ctx.font = `${normalizedOptions.fontSize}px ` + FontTypeOptions[normalizedOptions.font];
        const width = ctx.measureText(lines[largestLineIndex]).width;
        ctx.restore();
        // note using font-size as line height
        // calc height = number of lines * lineHeight
        const height = lines.length * normalizedOptions.fontSize;
        const text = lines;
        const endPos = [options.point1[0] + width, options.point1[1] + height];
        const { x, y, endX, endY } = getCorrectCoordOrder(options.point1, endPos as Point);
        this.boundingRect = [
            [x, y],
            [endX, endY],
        ];
        this.text = text;
        this.options = normalizedOptions;
        return this;
    }
    public regenerate(options: Partial<TextOptions & TextRequiredOptions>) {
        return this.generate({
            ...this.options,
            ...options,
        });
    }
    private normalizeOptions(
        options: Partial<TextOptions> & TextRequiredOptions,
    ): TextOptions & TextRequiredOptions {
        const globalConfig = getConfigState();
        const zoom = useStore.getState().zoomLevel;
        return {
            ...options,
            opacity: options.opacity || globalConfig.opacity,
            stroke: options.stroke || globalConfig.stroke,
            strokeWidth: options.strokeWidth || globalConfig.strokeWidth,
            font: options.font || globalConfig.font,
            fontSize: options.fontSize || globalConfig.fontSize,
            zoom: options.zoom || zoom,
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public render(ctx: CanvasRenderingContext2D, zoom: number): void {
        ctx.save();
        ctx.font = `${this.options.fontSize}px ` + FontTypeOptions[this.options.font];
        ctx.fillStyle = this.options.stroke;
        ctx.textBaseline = "top";
        this.text.forEach((val, i) =>
            ctx.fillText(
                val,
                this.boundingRect[0][0],
                this.boundingRect[0][1] + i * this.options.fontSize,
            ),
        );
        ctx.restore();
    }
    public copy() {
        return { ...this.options, shape: this.shape };
    }
    public move(walkX: number, walkY: number) {
        const newStart = [this.options.point1[0] + walkX, this.options.point1[1] + walkY] as Point;
        return this.regenerate({
            point1: newStart,
        });
    }
}
