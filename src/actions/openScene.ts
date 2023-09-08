import { RoughGenerator } from "roughjs/bin/generator";
import { fileOpen } from "browser-fs-access";
import { Command } from "./types";
import {
    ZagyCanvasElement,
    isZagyPortable,
    isLine,
    isRect,
    isText,
    isImage,
    isHanddrawn,
} from "@/types/general";
import { useStore } from "@/store/index";
import {
    generateCacheLineElement,
    generateCacheRectElement,
    generateCachedHandDrawnElement,
    generateTextElement,
} from "@/utils/canvas/generateElement";

/**
 * future version should support loading scene from Z+ as well
 */
export class ActionOpenScene extends Command {
    public async execute() {
        const { setSelectedElements, setElements, setPosition, zoomLevel } = useStore.getState();
        try {
            const blob = await fileOpen({
                // List of allowed file extensions (with leading '.'), defaults to `''`.
                extensions: [".zagydraw"],
                // Textual description for file dialog , defaults to `''`.
                description: "Open Zagydraw",
                // By specifying an ID, the user agent can remember different directories for different IDs.
                id: "zagydraw",
            });
            const text = await (await blob.handle?.getFile())?.text();
            if (text) {
                const portable = JSON.parse(text);
                isZagyPortable(portable);
                const roughGenerator = new RoughGenerator();
                const elsToPush: ZagyCanvasElement[] = [];
                for (const el of portable.elements) {
                    if (isRect(el)) {
                        elsToPush.push(
                            generateCacheRectElement(
                                roughGenerator,
                                [el.x, el.y],
                                [el.endX, el.endY],
                                zoomLevel,
                                el.options,
                            ),
                        );
                    } else if (isLine(el)) {
                        elsToPush.push(
                            generateCacheLineElement(
                                roughGenerator,
                                el.point1,
                                el.point2,
                                zoomLevel,
                                el.options,
                            ),
                        );
                    } else if (isText(el)) {
                        elsToPush.push(
                            generateTextElement(el.text.join("\n"), [el.x, el.y], el.options),
                        );
                    } else if (isHanddrawn(el)) {
                        elsToPush.push(
                            generateCachedHandDrawnElement(el.paths, zoomLevel, el.options),
                        );
                    } else if (isImage(el)) {
                        // generateImageElement();
                    }

                    setPosition({ x: 0, y: 0 });
                    setSelectedElements(() => []);
                    setElements(() => [...elsToPush]);
                }
            }
        } catch (e) {
            console.log("🪵 [copySelected.ts:15] ~ token ~ \x1b[0;32me\x1b[0m = ", e);
        }
    }
}
