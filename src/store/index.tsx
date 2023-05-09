//gitkeep
//init zustand store
import {
    CanvasElement,
    CursorFn,
    GlobalConfigOptions,
    FillStyleOptions,
    FontTypeOptions
} from "types/general";
import { create } from "zustand";

type ConfigState = GlobalConfigOptions;

export type CanvasState<T extends CanvasElement = CanvasElement> = {
    width: number;
    height: number;
    position: { x: number; y: number };
    zoomLevel: number;
    elements: T[];
    previewElement: T | null;
    selectedElements: T[];
};

type CanvasActions = {
    setDimensions: (
        width: CanvasState["width"],
        height: CanvasState["height"]
    ) => void;
    setPosition: (position: CanvasState["position"]) => void;
    setZoomLevel: (zoomLevel: CanvasState["zoomLevel"]) => void;
    setElements: (callback: (prev: CanvasElement[]) => CanvasElement[]) => void;
    setPreviewElement: (el: CanvasState["previewElement"]) => void;
    setSelectedElements: (
        callback: (prev: CanvasElement[]) => CanvasElement[]
    ) => void;
};
type ConfigStateActions = {
    [K in keyof ConfigState as `set${Capitalize<K & string>}`]: (
        value: ConfigState[K]
    ) => void;
};

export const useStore = create<
    CanvasState & CanvasActions & ConfigStateActions & ConfigState
>()((set, get) => ({
    //state
    position: { x: 0, y: 0 },
    zoomLevel: 48,
    width: 400,
    height: 300,
    cursorFn: CursorFn.Drag,
    elements: [],
    previewElement: null,
    selectedElements: [],
    //actions
    //getCanvasState
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
    },
    setSelectedElements(callback) {
        set((state) => ({
            selectedElements: callback(state.selectedElements)
        }));
    },
    //ConfigState
    fill: "#ffffff0",
    stroke: "#000000",
    strokeWidth: 1,
    strokeLineDash: 1,
    fillStyle: "solid",
    font: FontTypeOptions.hand,
    fontSize: 16,
    opacity: 1,

    //setConfigState
    setFill(fill) {
        set({ fill });
    },
    setStroke(stroke) {
        set({ stroke });
    },
    setStrokeWidth(strokeWidth) {
        set({ strokeWidth });
    },
    setStrokeLineDash(strokeLineDash) {
        set({ strokeLineDash });
    },
    setFillStyle(fillStyle) {
        set({ fillStyle });
    },
    setFont(font) {
        set({ font });
    },
    setFontSize(fontSize) {
        set({ fontSize });
    },
    setOpacity(opacity) {
        set({ opacity });
    }
}));
