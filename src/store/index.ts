import { randomSeed } from "roughjs/bin/math";
import { create } from "zustand";
import { CursorFn, GlobalElementOptions, ZagyShape } from "@/types/general";
import { Rectangle } from "@/utils/canvas/shapes";

type ConfigState = Omit<GlobalElementOptions, "seed"> & {
    cursorFn: CursorFn;
    isToolbarElementConfigOpen: boolean;
    isMobile: boolean;
};

export type CanvasState = {
    width: number;
    height: number;
    position: { x: number; y: number };
    zoomLevel: number;
    elements: ZagyShape[];
    previewElement: ZagyShape | null;
    selectedElements: ZagyShape[];
    visibleElements: ZagyShape[];
    multiSelectRect: Rectangle | null;
};

export type GeneralActionsState = {
    isMouseDown: boolean;
    cursorFn: CursorFn;
};
export type GeneralActionsActions = {
    setIsMouseDown: (isMouseDown: boolean) => void;
    setCursorFn: (fn: CursorFn) => void;
};
// const CanvasStateDefaults: CanvasState = {
//     width: 400,
//     height: 300,
//     position: { x: 0, y: 0 },
//     zoomLevel: 48,
//     elements: [],
//     previewElement: null,
//     selectedElements: [],
//     visibleElements: [],
//     multiSelectRect: null,
// };
export type ActionDrawElementState = {
    currentText: string;
    isWriting: boolean;
};

export type ActionDrawElementActions = {
    setCurrentText: (currentText: string) => void;
    setIsWriting: (isWriting: boolean) => void;
};

type CanvasActions = {
    setDimensions: (width: CanvasState["width"], height: CanvasState["height"]) => void;
    setPosition: (position: CanvasState["position"]) => void;
    setZoomLevel: (zoomLevel: CanvasState["zoomLevel"]) => void;
    setElements: (callback: (prev: ZagyShape[]) => ZagyShape[]) => void;
    setPreviewElement: (el: CanvasState["previewElement"]) => void;
    setSelectedElements: (callback: (prev: ZagyShape[]) => ZagyShape[]) => void;
    setMultiSelectRect: (rect: CanvasState["multiSelectRect"]) => void;
    getPosition: () => { x: number; y: number };
};
type ConfigStateActions = {
    [K in keyof ConfigState as `set${Capitalize<K & string>}`]: (value: ConfigState[K]) => void;
} & {
    getElementConfigState: () => GlobalElementOptions;
};

export const useStore = create<
    CanvasState &
        CanvasActions &
        ConfigStateActions &
        ConfigState &
        GeneralActionsState &
        GeneralActionsActions &
        ActionDrawElementState &
        ActionDrawElementActions
>()((set, get) => ({
    //state
    position: { x: 0, y: 0 },
    zoomLevel: 1,
    width: 400,
    height: 300,
    cursorFn: CursorFn.Drag,
    elements: [],
    previewElement: null,
    selectedElements: [],
    visibleElements: [],
    multiSelectRect: null,

    isMouseDown: false,
    currentText: "",
    isWriting: false,
    isToolbarElementConfigOpen: false,
    isMobile: false,
    getPosition: () => {
        return {
            x: get().position.x / get().zoomLevel,
            y: get().position.y / get().zoomLevel,
        };
    },
    setIsMobile: (isMobile) => {
        set({ isMobile });
    },
    setIsToolbarElementConfigOpen: (isToolbarElementConfigOpen) => {
        set({ isToolbarElementConfigOpen });
    },
    setCurrentText: (currentText) => {
        set({ currentText });
    },
    setIsWriting: (isWriting) => {
        set({ isWriting });
    },
    setMultiSelectRect: (multiSelectRect) => {
        set({ multiSelectRect });
    },
    //actions
    //getCanvasState
    setPosition: (position) => {
        set({ position });
        //update visible elements
        set(({ elements, width, height, zoomLevel, getPosition }) => ({
            visibleElements: elements.filter((el) => {
                const position = getPosition();

                return el.isVisible([-position.x, -position.y], width, height, zoomLevel);
            }),
        }));
    },
    setZoomLevel: (newZoomLevel) => {
        // zoom on the cursor
        set(() => {
            return {
                zoomLevel: newZoomLevel,
            };
        });
    },
    setDimensions: (width, height) => {
        set({ width, height });
        set(({ elements, width, height, zoomLevel, getPosition }) => ({
            visibleElements: elements.filter((el) => {
                const position = getPosition();
                return el.isVisible([-position.x, -position.y], width, height, zoomLevel);
            }),
        }));
    },
    setElements: (callback) => {
        set((state) => ({ elements: callback(state.elements) }));
        set(({ getPosition, width, height, elements, zoomLevel }) => ({
            visibleElements: elements.filter((el) => {
                const position = getPosition();
                return el.isVisible([-position.x, -position.y], width, height, zoomLevel);
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
    font: "minecraft",
    fontSize: 24,
    opacity: 1,
    getElementConfigState() {
        return {
            fill: get().fill,
            fillStyle: get().fillStyle,
            font: get().font,
            fontSize: get().fontSize,
            opacity: get().opacity,
            stroke: get().stroke,
            strokeLineDash: get().strokeLineDash,
            strokeWidth: get().strokeWidth,
            seed: randomSeed(),
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
    setIsMouseDown(isMouseDown) {
        set({ isMouseDown });
    },
}));
