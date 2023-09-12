import { Command } from "./types";
import { useStore } from "@/store/index";
import { getBoundingRect } from "@/utils";
import renderElements from "@/utils/canvas/renderElements";
import { ZagyShape } from "@/types/general";

export type ExportOpeions = {
    onlySelected: boolean;
    background: boolean;
};

export const ExportTypes = {
    PNG: 0,
    SVG: 1,
    COPY: 2,
} as const;

type ExportTypes = (typeof ExportTypes)[keyof typeof ExportTypes];

/**
 * must call showPreview before you can download because showPreview is what set the canvas ref into the class
 */
export class ActionExportScene extends Command {
    private static exportCanvas: HTMLCanvasElement | null | undefined;

    private type: ExportTypes;
    constructor(type: ExportTypes) {
        super();
        this.type = type;
    }

    private static drawCanvas(elements: ZagyShape[], options: ExportOpeions) {
        if (!ActionExportScene.exportCanvas) return false;
        const exportContext = ActionExportScene.exportCanvas.getContext("2d");
        if (exportContext === null) return;

        // get canvas width/height to hold all elements
        const rect = getBoundingRect(...elements);
        const [x, y] = [rect[0][0], rect[0][1]];
        const [endX, endY] = [rect[1][0], rect[1][1]];
        const width = endX - x;
        const height = endY - y;

        ActionExportScene.exportCanvas.width = width;
        ActionExportScene.exportCanvas.height = height;

        // apply background
        if (options.background) {
            exportContext.fillStyle = "black";
            exportContext.fillRect(0, 0, width, height);
        } else {
            exportContext.fillStyle = "trsnsparent";
            exportContext.clearRect(0, 0, width, height);
        }
        // Translate the context to match the top-left corner of the selected elements
        exportContext.translate(-rect[0][0], -rect[0][1]);

        renderElements(elements, exportContext, 1);
        return true;
    }

    public static showPreview(canvas: HTMLCanvasElement, options: ExportOpeions) {
        const { elements, selectedElements } = useStore.getState();
        ActionExportScene.exportCanvas = canvas;
        ActionExportScene.drawCanvas(options.onlySelected ? selectedElements : elements, options);
    }

    public execute() {
        if (!ActionExportScene.exportCanvas) {
            throw new Error("cannot download before showing preview");
        }

        if (this.type === ExportTypes.PNG) {
            // Create a link to trigger the download
            const downloadLink = document.createElement("a");
            downloadLink.href = ActionExportScene.exportCanvas.toDataURL("image/png");
            downloadLink.download = "selected_elements.png";

            // Simulate a click event on the link to trigger the download
            downloadLink.click();
        } else if (this.type === ExportTypes.COPY) {
            ActionExportScene.exportCanvas.toBlob(function (blob) {
                if (blob) {
                    navigator.clipboard
                        .write([
                            new ClipboardItem({
                                [blob.type]: blob,
                            }),
                        ])
                        .then(function () {
                            console.log("Image copied to clipboard");
                        })
                        .catch(function (error) {
                            console.error("Unable to copy image to clipboard", error);
                        });
                }
            });
        }

        return;
    }
}
