//gitkeep
//init zustand store
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
export type CanvasElement = {
    // absolute x and y to GOD
    x: number;
    y: number;
    color: "red" | "blue";
};
export type CanvasRectElement = CanvasElement & {
    w: number;
    h: number;
};
export type CanvasState = {
    width: number;
    height: number;
    position: { x: number; y: number };
    zoomLevel: number;
    elements: CanvasElement[];
};

type ConfigState = {
    cursorFn: "drag" | "shape";
};

type CanvasActions = {
    setDimensions: (
        width: CanvasState["width"],
        height: CanvasState["height"]
    ) => void;
    setPosition: (position: CanvasState["position"]) => void;
    setZoomLevel: (zoomLevel: CanvasState["zoomLevel"]) => void;
    setElements: (callback: (prev: CanvasElement[]) => CanvasElement[]) => void;
};

type ConfigActions = {
    setCursorFn: (fn: ConfigState["cursorFn"]) => void;
};

export const useStore = create<
    CanvasState & CanvasActions & ConfigActions & ConfigState
>()(
    devtools(
        persist(
            (set) => ({
                //state
                position: { x: 0, y: 0 },
                zoomLevel: 48,
                width: 400,
                height: 300,
                cursorFn: "drag",
                elements: [],
                //actions
                setPosition: (position) => set({ position }),
                setZoomLevel: (zoomLevel) => set({ zoomLevel }),
                setDimensions: (width, height) => set({ width, height }),
                setElements: (callback) => {
                    set((state) => ({ elements: callback(state.elements) }));
                },
                setCursorFn(fn) {
                    set({ cursorFn: fn });
                }
            }),
            {
                name: "canvas-store",
                getStorage: () => sessionStorage
            }
        )
    )
);
