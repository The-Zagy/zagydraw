//gitkeep
//init zustand store
import { CanvasElement, CursorFn } from "types/general";
import { create } from "zustand";

export type CanvasState<T extends CanvasElement = CanvasElement> = {
    width: number;
    height: number;
    position: { x: number; y: number };
    zoomLevel: number;
    elements: T[];
    previewElement: T | null;
};

type ConfigState = {
    cursorFn: CursorFn;
};

type CanvasActions = {
    getCanvasState: () => CanvasState;
    setDimensions: (
        width: CanvasState["width"],
        height: CanvasState["height"]
    ) => void;
    setPosition: (position: CanvasState["position"]) => void;
    setZoomLevel: (zoomLevel: CanvasState["zoomLevel"]) => void;
    setElements: (callback: (prev: CanvasElement[]) => CanvasElement[]) => void;
    setPreviewElement: (el: CanvasState["previewElement"]) => void;
};

type ConfigActions = {
    setCursorFn: (fn: ConfigState["cursorFn"]) => void;
};

export const useStore = create<
    CanvasState & CanvasActions & ConfigActions & ConfigState
>()((set, get) => ({
    //state
    position: { x: 0, y: 0 },
    zoomLevel: 48,
    width: 400,
    height: 300,
    cursorFn: CursorFn.Drag,
    elements: [],
    previewElement: null,
    //actions
    //getCanvasState
    getCanvasState: () => {
        return {
            position: get().position,
            zoomLevel: get().zoomLevel,
            width: get().width,
            height: get().height,
            elements: get().elements,
            previewElement: get().previewElement
        };
    },
    setPosition: (position) => set({ position }),
    setZoomLevel: (zoomLevel) => set({ zoomLevel }),
    setDimensions: (width, height) => set({ width, height }),
    setElements: (callback) => {
        set((state) => ({ elements: callback(state.elements) }));
    },
    setCursorFn(fn) {
        set({ cursorFn: fn });
    },
    setPreviewElement(el) {
        set({ previewElement: el });
    }
}));
