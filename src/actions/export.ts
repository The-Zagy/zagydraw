import { useStore } from "store/index";
import { getBoundingRect } from "utils";
import rough from "roughjs";
import renderElements from "utils/canvas/renderElements";
import { type ZagyCanvasElement } from "types/general";
import { Command } from "./types";

export type ExportOpeions = {
    onlySelected: boolean;
    background: boolean;
};

/**
 * must call showPreview before you can download because showPreview is what set the canvas ref into the class
 */
export class ActionExportScene extends Command {
    private static exportCanvas: HTMLCanvasElement | null | undefined;

    private static drawCanvas(elements: ZagyCanvasElement[], options: ExportOpeions) {
        if (!ActionExportScene.exportCanvas) return false;
        const exportContext = ActionExportScene.exportCanvas.getContext("2d");
        if (exportContext === null) return;
        const roughCanvas = rough.canvas(ActionExportScene.exportCanvas);

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

        renderElements(elements, roughCanvas, exportContext);
        return true;
    }

    public static showPreview(canvas: HTMLCanvasElement, options: ExportOpeions) {
        const { elements, selectedElements } = useStore.getState();
        ActionExportScene.exportCanvas = canvas;
        ActionExportScene.drawCanvas(options.onlySelected ? selectedElements : elements, options);
    }

    public execute() {
        if (ActionExportScene.exportCanvas === null) return;

        if (ActionExportScene.exportCanvas) {
            // Create a link to trigger the download
            const downloadLink = document.createElement("a");
            downloadLink.href = ActionExportScene.exportCanvas.toDataURL("image/png");
            downloadLink.download = "selected_elements.png";

            // Simulate a click event on the link to trigger the download
            downloadLink.click();
        } else {
            throw new Error("cannot download before showing");
        }

        return;
    }
}
