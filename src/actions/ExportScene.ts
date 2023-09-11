import { fileSave } from "browser-fs-access";
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
import { isText, isHanddrawn } from "@/types/general";
import { ZagyCanvasTextElement } from "@/types/general";
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

    public async execute() {
        const { selectedElements, elements } = useStore.getState();
        try {
            // don't copy dump text into the user clipboard if there's no data to copy
            if (elements.length === 0 && selectedElements.length === 0) return;
            // cleaned up the items
            const portable: ZagyPortableT<unknown> = {
                type: "ZagyPortableContent",
                version: 1,
                elements: [],
            };

            // choose which items to clean up
            (this.onlySelected ? selectedElements : elements).forEach((el) =>
                portable.elements.push(el.copy()),
            );

            // choose export mechanism
            if (this.dest === DestOpts.CLIPBOARD) {
                await navigator.clipboard.writeText(JSON.stringify(portable));
            } else if (this.dest === DestOpts.JSON) {
                const blob = new Blob([JSON.stringify(portable)], { type: "application/zagydraw" });
                await fileSave(blob, {
                    fileName: "zagy.zagydraw",
                    description: "Zagy Portable",
                    extensions: [".zagydraw"],
                    id: "zagydraw",
                });
            }
        } catch (e) {
            console.log("🪵 [copySelected.ts:15] ~ token ~ \x1b[0;32me\x1b[0m = ", e);
        }
    }
}
