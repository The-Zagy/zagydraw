import { expect } from "vitest";
import matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);
/* Workaround for jest-canvas-mock to work with vitest */
import { afterAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
// @ts-expect-error: Global type missing
global.jest = vi;

declare global {
    // @ts-expect-error: Global type missing
    var jest: typeof vi | undefined;
}

const apis = [
    "Path2D",
    "CanvasGradient",
    "CanvasPattern",
    "CanvasRenderingContext2D",
    "DOMMatrix",
    "ImageData",
    "TextMetrics",
    "ImageBitmap",
    "createImageBitmap",
] as const;

async function importMockWindow() {
    const getCanvasWindow = await import("jest-canvas-mock/lib/window.js").then(
        // @ts-expect-error: Type
        (res) => res.default?.default || res.default || res
    );

    const canvasWindow = getCanvasWindow({ document: window.document });

    apis.forEach((api) => {
        global[api] = canvasWindow[api];
        global.window[api] = canvasWindow[api];
    });
}

importMockWindow();

afterAll(() => {
    //@ts-expect-error
    delete global.jest;
    //@ts-expect-error
    delete global.window.jest;
});

/* Workaround for jest-canvas-mock to work with vitest */

// Workaround for PointerEvent not being supported in JSDOM
const pointerEventCtorProps = ["clientX", "clientY", "pointerType"];
export default class PointerEventFake extends Event {
    constructor(type, props = {}) {
        super(type, props);
        pointerEventCtorProps.forEach((prop) => {
            if (props[prop] != null) {
                this[prop] = props[prop];
            }
        });
    }
}
// @ts-expect-error: Global type missing
global.PointerEvent = PointerEventFake;

// cleanup dom after each test
afterEach(() => {
    cleanup();
});
