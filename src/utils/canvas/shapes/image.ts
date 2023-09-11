import { nanoid } from "nanoid";
import Shape from "./shape";
import { Point } from "@/utils";
import { ImageComputedFields, ImageOptions, ImageRequiredOptions } from "@/types/general";
import { useStore } from "@/store";
import { PREVIEW_IMAGE_HEIGHT, PREVIEW_IMAGE_WIDTH } from "@/constants/index";

type ZagyImageCompleteOptions = Partial<ImageOptions & ImageComputedFields> & ImageRequiredOptions;
const { getElementConfigState: getConfigState } = useStore.getState();

export class ZagyImage extends Shape<ImageOptions & ImageRequiredOptions & ImageComputedFields> {
    private cacheCanvas: undefined | HTMLImageElement | Promise<void> = undefined;
    protected options!: ImageOptions & ImageRequiredOptions & ImageComputedFields;
    protected boundingRect!: [Point, Point];

    /**
     * @param data Blob | string image as a blob and will be automatically loaded or string which is DataUrl
     */
    constructor(options: ZagyImageCompleteOptions) {
        super(nanoid(), "image");
        this.generate(options);
    }

    static CreateDataUrl(file: Blob) {
        return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
                // Logs data:<type>;base64,wL2dvYWwgbW9yZ...
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * create new image instance append it to ZagyImageElement
     * filter the store from the element with placeholder image, and append the new one with the loaded image
     */
    async loadImage(file: Blob | string) {
        // create dataUrl if the data is not Blob
        let dataUrl: string;
        if (typeof file === "string") {
            dataUrl = file;
        } else {
            dataUrl = await ZagyImage.CreateDataUrl(file);
        }
        const img = new Image();
        const promise = new Promise<HTMLImageElement>((resolve) => {
            img.onload = () => {
                resolve(img);
            };
        });

        img.src = dataUrl;
        const loadedImage = await promise;
        // create cache canvas ,update `point2` and update the `image` to DataUrl
        this.regenerate({
            point2: [
                this.options.point1[0] + loadedImage.width,
                this.options.point1[1] + loadedImage.height,
            ],
            image: dataUrl,
        });
        this.cacheCanvas = loadedImage;
        this.boundingRect = [this.boundingRect[0], this.options.point2];
        // TODO: i left it like the old API which is image is resposible for re adding itself to the store when the image reload, but is this good API? i mean with this implemention if we changed the store we would need to make changes in this class as well
        const { setElements, elements } = useStore.getState();
        // this suppose to prevent adding loaded image to the store after the user delete the preview
        const oldEl = elements.find((el) => el.id === this.id);
        if (!oldEl) return;
        setElements((prev) => [...prev.filter((el) => el.id !== this.id), this]);
    }

    public generate(options: ZagyImageCompleteOptions) {
        const normalizedOptions = this.normalizeOptions(options);
        this.options = normalizedOptions;
        this.boundingRect = [normalizedOptions.point1, normalizedOptions.point2];
        // only create new promise(load image) if you don't have promise or loaded image
        if (this.cacheCanvas === undefined) {
            this.cacheCanvas = this.loadImage(options.image);
        }
        return this;
    }

    public regenerate(options: Partial<ImageRequiredOptions & ImageOptions & ImageComputedFields>) {
        return this.generate({
            ...this.options,
            ...options,
        });
    }

    private normalizeOptions(
        options: Partial<ImageOptions & ImageComputedFields> & ImageRequiredOptions,
    ): ImageOptions & ImageRequiredOptions & ImageComputedFields {
        const globalConfig = getConfigState();
        const zoom = useStore.getState().zoomLevel;
        return {
            point1: options.point1,
            // if no point2 means the image have been loaded so use the constant PREVIEW_WIDTH
            point2: options.point2 ?? [
                options.point1[0] + PREVIEW_IMAGE_WIDTH,
                options.point1[1] + PREVIEW_IMAGE_HEIGHT,
            ],
            image: options.image,
            opacity: options.opacity || globalConfig.opacity,
            stroke: options.stroke || globalConfig.stroke,
            strokeWidth: options.strokeWidth || globalConfig.strokeWidth,
            zoom: options.zoom || zoom,
        };
    }

    public render(ctx: CanvasRenderingContext2D, zoom: number): void {
        ctx.save();
        super.render(ctx, zoom);
        ctx.scale(1 / zoom, 1 / zoom);
        // draw placeholder while loading the image, when the image is loaded will trigger rerender with new element that is not promise
        if (this.cacheCanvas instanceof Promise || this.cacheCanvas === undefined) {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(
                this.options.point1[0],
                this.options.point1[1],
                PREVIEW_IMAGE_WIDTH,
                PREVIEW_IMAGE_HEIGHT,
            );
        } else {
            ctx.drawImage(
                this.cacheCanvas,
                0,
                0,
                this.options.point2[0] - this.options.point1[0],
                this.options.point2[1] - this.options.point1[1],
                this.options.point1[0] * zoom,
                this.options.point1[1] * zoom,
                this.options.point2[0] - this.options.point1[0],
                this.options.point2[1] - this.options.point1[1],
            );
        }
        ctx.restore();
        return;
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
    //
    public moveTo(newStart: Point) {
        return this.regenerate({
            point1: newStart,
            point2: [
                newStart[0] + this.boundingRect[1][0] - this.boundingRect[0][0],
                newStart[1] + this.boundingRect[1][1] - this.boundingRect[0][1],
            ],
        });
    }

    public isImageLoading(): boolean {
        return this.cacheCanvas === undefined || this.cacheCanvas instanceof Promise;
    }
}
