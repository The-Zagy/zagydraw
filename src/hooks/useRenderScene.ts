import { useEffect, useRef } from "react";
import renderScene from "@/utils/canvas/renderScene";
type Nullable<T> = { [P in keyof T]: T[P] | null };
type Params = Nullable<Parameters<typeof renderScene>>;
//useRenderScne params are the same as renderScene params
const useRenderScene = (...params: Params) => {
    const [ctx, canvasState] = params;
    const lastAnimationFrame = useRef<number | null>(null);
    useEffect(() => {
        if (!ctx || !canvasState) return;
        if (lastAnimationFrame.current) {
            cancelAnimationFrame(lastAnimationFrame.current);
        }
        lastAnimationFrame.current = requestAnimationFrame(() => {
            renderScene(ctx, canvasState);
            lastAnimationFrame.current = null;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasState]);
};

export { useRenderScene };
