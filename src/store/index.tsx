//gitkeep
//init zustand store
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
type CanvasState = {
    width: number;
    height: number;
    position: { x: number; y: number };
    zoomLevel: number;
};
type CanvasActions = {
    setDimensions: (
        width: CanvasState["width"],
        height: CanvasState["height"]
    ) => void;
    setPosition: (position: CanvasState["position"]) => void;
    setZoomLevel: (zoomLevel: CanvasState["zoomLevel"]) => void;
};

export const useStore = create<CanvasState & CanvasActions>()(
    devtools(
        persist(
            (set) => ({
                //state
                position: { x: 0, y: 0 },
                zoomLevel: 48,
                width: 400,
                height: 300,
                //actions
                setPosition: (position) => set({ position }),
                setZoomLevel: (zoomLevel) => set({ zoomLevel }),
                setDimensions: (width, height) => set({ width, height })
            }),
            {
                name: "canvas-store",
                getStorage: () => sessionStorage
            }
        )
    )
);
