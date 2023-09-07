import { Command } from "./types";
import {
    type ZagyCanvasElement,
    isRect,
    isImage,
    ZagyCanvasImageElement,
    ZagyCanvasRectElement,
    isLine,
    ZagyCanvasLineElement,
    CleanedElement,
    ZagyPortableT,
} from "@/types/general";
import { useStore } from "@/store/index";
import { isText } from "@/types/general";
import { ZagyCanvasTextElement } from "@/types/general";
import { isHanddrawn } from "@/types/general";
import { ZagyCanvasHandDrawnElement } from "@/types/general";

export const DestOpts = {
    CLIPBOARD: 0,
    JSON: 1,
} as const;
export type DestOpts = (typeof DestOpts)[keyof typeof DestOpts];

/**
 * clean up the elements state from unnecessary props like (cache and so on...) then copy them async to the clipboard in portable format
 *
 * @param dest DestOpts where to copy the data [clipboard, json file]
 * @param onlySelected boolean only export selected elements or all the scene, default `false`
 */
export class ActionExportScene extends Command {
    constructor(private dest: DestOpts, private onlySelected = false) {
        super();
    }

    /**
     * elements in the store contains props that is needed when exporting them, or when the user import them again so we clean those props up to propably make the exported size small
     */
    private static cleanupItem<T extends ZagyCanvasElement>(el: T): CleanedElement<T> {
        const baseTemp: CleanedElement<ZagyCanvasElement> = {
            id: el.id,
            shape: el.shape,
            x: el.x,
            y: el.y,
            endX: el.endX,
            endY: el.endY,
            options: el.options,
        };
        if (isImage(el)) {
            return {
                ...baseTemp,
                shape: el.shape,
                image: el.image,
            } satisfies CleanedElement<ZagyCanvasImageElement> as unknown as CleanedElement<T>;
        } else if (isRect(el)) {
            return {
                ...baseTemp,
                shape: el.shape,
                options: el.options,
            } satisfies CleanedElement<ZagyCanvasRectElement> as unknown as CleanedElement<T>;
        } else if (isLine(el)) {
            return {
                ...baseTemp,
                shape: el.shape,
                point1: el.point1,
                point2: el.point2,
                options: el.options,
            } satisfies CleanedElement<ZagyCanvasLineElement> as unknown as CleanedElement<T>;
        } else if (isText(el)) {
            return {
                ...baseTemp,
                shape: el.shape,
                text: el.text,
                options: el.options,
            } satisfies CleanedElement<ZagyCanvasTextElement> as unknown as CleanedElement<T>;
        } else if (isHanddrawn(el)) {
            return {
                ...baseTemp,
                shape: el.shape,
                paths: el.paths,
                options: el.options,
            } satisfies CleanedElement<ZagyCanvasHandDrawnElement> as unknown as CleanedElement<T>;
        } else {
            throw new Error("EXPORT SCENE: cannot export unknown item");
        }
    }

    public async execute() {
        const { selectedElements, elements } = useStore.getState();
        try {
            // clean up the items
            const portable: ZagyPortableT = {
                type: "ZagyPortableContent",
                elements: [],
            };
            // choose which items to clean up
            if (this.onlySelected) {
                selectedElements.forEach((el) =>
                    portable.elements.push(ActionExportScene.cleanupItem(el)),
                );
            } else {
                elements.forEach((el) => portable.elements.push(ActionExportScene.cleanupItem(el)));
            }
            // don't copy dump text into the user clipboard if there's no data to copy
            if (portable.elements.length === 0) return;
            // choose export mechanism
            if (this.dest === DestOpts.CLIPBOARD) {
                await navigator.clipboard.writeText(JSON.stringify(portable));
            } else if (this.dest === DestOpts.JSON) {
                // Create a Blob from the JSON string
                const blob = new Blob([JSON.stringify(portable)], { type: "application/zagydraw" });
                // Create a Blob URL
                const blobUrl = URL.createObjectURL(blob);

                // Create an <a> element
                const downloadLink = document.createElement("a");

                // Set the href attribute to the Blob URL
                downloadLink.href = blobUrl;

                // Set the download attribute to specify the filename
                downloadLink.download = "zagy.zagydraw";

                // Trigger a click event to open the file save dialog
                downloadLink.click();

                // Clean up by revoking the Blob URL
                URL.revokeObjectURL(blobUrl);
            }
        } catch (e) {
            console.log("🪵 [copySelected.ts:15] ~ token ~ \x1b[0;32me\x1b[0m = ", e);
        }
    }
}
