import { useEffect, useRef } from "react";
import renderScene from "utils/canvas/renderScene";
type Nullable<T> = { [P in keyof T]: T[P] | null };
type Params = Nullable<Parameters<typeof renderScene>>;
//useRenderScne params are the same as renderScene params
const useRenderScene = (...params: Params) => {
    const [roughCanvas, ctx, canvasState, multiSelectRect] = params;
    const lastAnimationFrame = useRef<number | null>(null);
    useEffect(() => {
        if (!ctx || !canvasState) return;
        if (lastAnimationFrame.current) {
            cancelAnimationFrame(lastAnimationFrame.current);
        }
        lastAnimationFrame.current = requestAnimationFrame(() => {
            if (!roughCanvas) return;
            renderScene(roughCanvas, ctx, canvasState, multiSelectRect);
            lastAnimationFrame.current = null;
        });
    }, [canvasState]);
};

export { useRenderScene };
