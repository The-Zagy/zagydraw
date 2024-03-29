import { fileOpen } from "browser-fs-access";
import { Command } from "./types";
import {
    isZagyPortable,
    isLine,
    isRect,
    isText,
    isImage,
    isHanddrawn,
    ZagyShape,
} from "@/types/general";
import { useStore } from "@/store/index";
import { ZagyLine, ZagyRectangle, ZagyText, ZagyImage, ZagyHandDrawn } from "@/utils/canvas/shapes";

/**
 * future version should support loading scene from Z+ as well
 */
export class ActionOpenScene extends Command {
    public async execute() {
        const { setSelectedElements, setElements, setPosition } = useStore.getState();
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
                const elsToPush: ZagyShape[] = [];
                for (const el of portable.elements) {
                    if (isRect(el)) {
                        elsToPush.push(new ZagyRectangle(el.options));
                    } else if (isLine(el)) {
                        elsToPush.push(new ZagyLine(el.options));
                    } else if (isText(el)) {
                        elsToPush.push(new ZagyText(el.options));
                    } else if (isHanddrawn(el)) {
                        elsToPush.push(new ZagyHandDrawn(el.options));
                    } else if (isImage(el)) {
                        elsToPush.push(new ZagyImage(el.options));
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
