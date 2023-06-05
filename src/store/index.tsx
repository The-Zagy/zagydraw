//gitkeep
//init zustand store

import { ZagyCanvasElement, CursorFn, GlobalConfigOptions, FontTypeOptions } from "types/general";
import { isElementVisible } from "utils";
import { create } from "zustand";

type ConfigState = GlobalConfigOptions;

export type CanvasState<T extends ZagyCanvasElement = ZagyCanvasElement> = {
    width: number;
    height: number;
    position: { x: number; y: number };
    zoomLevel: number;
    elements: T[];
    previewElement: T | null;
    selectedElements: T[];
    visibleElements: T[];
};

type CanvasActions = {
    setDimensions: (width: CanvasState["width"], height: CanvasState["height"]) => void;
    setPosition: (position: CanvasState["position"]) => void;
    setZoomLevel: (zoomLevel: CanvasState["zoomLevel"]) => void;
    setElements: (callback: (prev: ZagyCanvasElement[]) => ZagyCanvasElement[]) => void;
    setPreviewElement: (el: CanvasState["previewElement"]) => void;
    setSelectedElements: (callback: (prev: ZagyCanvasElement[]) => ZagyCanvasElement[]) => void;
};
type ConfigStateActions = {
    [K in keyof ConfigState as `set${Capitalize<K & string>}`]: (value: ConfigState[K]) => void;
} & {
    getConfigState: () => ConfigState;
};

export const useStore = create<CanvasState & CanvasActions & ConfigStateActions & ConfigState>()(
    (set, get) => ({
        //state
        position: { x: 0, y: 0 },
        zoomLevel: 48,
        width: 400,
        height: 300,
        cursorFn: CursorFn.Drag,
        elements: [],
        previewElement: null,
        selectedElements: [],
        visibleElements: [],
        //actions
        //getCanvasState
        setPosition: (position) => {
            set({ position });
            //update visible elements
            set(({ elements, position, width, height }) => ({
                visibleElements: elements.filter((el) => {
                    return isElementVisible(el, [
                        [-position.x, -position.y],
                        [-position.x + width, position.y + height],
                    ]);
                }),
            }));
        },
        setZoomLevel: (zoomLevel) => set({ zoomLevel }),
        setDimensions: (width, height) => set({ width, height }),
        setElements: (callback) => {
            set((state) => ({ elements: callback(state.elements) }));

            set(({ position, width, height, elements }) => ({
                visibleElements: callback(elements).filter((el) => {
                    return isElementVisible(el, [
                        [-position.x, -position.y],
                        [-position.x + width, position.y + height],
                    ]);
                }),
            }));
        },
        setCursorFn(fn) {
            set({ cursorFn: fn });
        },
        setPreviewElement(el) {
            set({ previewElement: el });
        },
        setSelectedElements(callback) {
            set((state) => ({
                selectedElements: callback(state.selectedElements),
            }));
        },
        //ConfigState
        fill: "#A7A7A7",
        stroke: "#9b59b6",
        strokeWidth: 6,
        strokeLineDash: [],
        fillStyle: "hachure",
        font: FontTypeOptions.minecraft,
        fontSize: 24,
        opacity: 1,
        getConfigState() {
            return {
                cursorFn: get().cursorFn,
                fill: get().fill,
                fillStyle: get().fillStyle,
                font: get().font,
                fontSize: get().fontSize,
                opacity: get().opacity,
                stroke: get().stroke,
                strokeLineDash: get().strokeLineDash,
                strokeWidth: get().strokeWidth,
            };
        },
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
        },
    })
);
