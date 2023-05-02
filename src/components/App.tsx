import { PointerEventHandler, useEffect, useLayoutEffect, useRef } from "react";
import rough from "roughjs";
import { useStore } from "store";

import useGlobalEvent from "hooks/useGlobalEvent";
import { RoughCanvas } from "roughjs/bin/canvas";

import { normalize } from "utils";
import { CanvasRectElement } from "types/general";
import renderScene from "utils/canvas/renderScene";

const {
    setPosition,
    setZoomLevel,
    setDimensions,
    setCursorFn,
    setElements,
    getCanvasState
} = useStore.getState();

const MAX_ZOOM = 96;
const MIN_ZOOM = 24;
type MouseCoords = {
    startX: number;
    startY: number;
};

function App() {
    const canvasState = getCanvasState();
    const position = useStore((state) => state.position);
    const zoom = useStore((state) => state.zoomLevel);
    const width = useStore((state) => state.width);
    const height = useStore((state) => state.height);
    const cursorFn = useStore((state) => state.cursorFn);
    const isMouseDown = useRef<boolean>(false);
    const mouseCoords = useRef<MouseCoords>({
        startX: 0,
        startY: 0
    });
    const canvasElements = useStore((state) => state.elements);
    const handleZoom = (zoomType: "in" | "out") => {
        if (zoomType === "in") {
            const currentZoom = zoom + 12;
            if (currentZoom > MAX_ZOOM) return;
            setZoomLevel(currentZoom);
            return;
        }
        const currentZoom = zoom - 12;
        if (currentZoom <= MIN_ZOOM) return;
        setZoomLevel(currentZoom);
    };
    const canvas = useRef<HTMLCanvasElement>(null);
    const roughCanvas = useRef<RoughCanvas | null>(null);
    useLayoutEffect(() => {
        if (canvas.current) {
            //make canvas fill the screen
            canvas.current.width = document.body.clientWidth;
            canvas.current.height = document.body.clientHeight;
            // init rough canvas
            roughCanvas.current = rough.canvas(canvas.current);
        }
    }, []);
    useEffect(() => {
        if (!canvas.current || !roughCanvas.current) return;
        const ctx = canvas.current.getContext("2d");
        if (!ctx) return;
        //clear the canvas

        renderScene(roughCanvas.current, ctx, canvasState);
    }, [position, zoom, width, height, canvasElements]);
    const handlePointerDown: PointerEventHandler<HTMLCanvasElement> = (e) => {
        //handle dragging into the canvas
        if (!canvas.current) return;
        isMouseDown.current = true;
        const startX = e.pageX;
        const startY = e.pageY;

        mouseCoords.current = { startX, startY };
        // draw shape logic?
        if (!roughCanvas.current) return;
        const generator = roughCanvas.current.generator;
        if (cursorFn === "rect") {
            const norm = normalize(position, startX, startY);
            console.log(
                "startX",
                startX,
                "startY",
                startY,
                "startXNormalized",
                norm[0],
                "startYNormalized",
                norm[1]
            );
            const rect: CanvasRectElement = {
                ...generator.rectangle(norm[0], norm[1], 100, 100, {
                    fill: "blue",
                    stroke: "red",
                    strokeWidth: 2,
                    roughness: 0
                }),
                x: norm[0],
                y: norm[1],
                w: 100,
                h: 100,
                color: "blue",
                shape: "rectangle",
                curPos: position
            };
            console.log("rect", rect);
            setElements((prev) => {
                return [...prev, rect];
            });
        } else if (cursorFn === "line") {
            //     setElements((prev) => {
            //         const norm = normalize(position, startX, startY);
            //         return [
            //             ...prev,
            //             {
            //                 color: "blue",
            //                 x: norm[0],
            //                 y: norm[1],
            //                 curPos: position,
            //                 // TODO w must be calclauted from mouse down pos to up pos
            //                 w: 100
            //             }
            //         ];
            //     });
            // }
        }
    };
    const handlePointerUp: PointerEventHandler<HTMLCanvasElement> = () => {
        isMouseDown.current = false;
        if (!canvas.current) return;
    };
    const handlePointerMove: PointerEventHandler<HTMLCanvasElement> = (e) => {
        e.preventDefault();
        //handle dragging into the canvas
        if (isMouseDown.current && canvas.current && cursorFn === "drag") {
            const x = e.pageX;
            const y = e.pageY;

            // 50 is an arbitrary number to make the walk distance smaller
            const walkX = (x - mouseCoords.current.startX) / 69;
            const walkY = (y - mouseCoords.current.startY) / 69;
            setPosition({ x: position.x - walkX, y: position.y - walkY });
        }
    };

    const handleScroll = (e: WheelEvent) => {
        const { deltaY } = e;
        if (!deltaY) return;
        if (deltaY > 0) {
            handleZoom("out");
            return;
        }
        handleZoom("in");
    };
    const handleResize = () => {
        if (!canvas.current) return;
        setDimensions(document.body.clientWidth, document.body.clientHeight);
        canvas.current.width = document.body.clientWidth;
        canvas.current.height = document.body.clientHeight;
    };
    useGlobalEvent("wheel", handleScroll);
    useGlobalEvent("resize", handleResize);
    return (
        <div className="h-screen w-screen overflow-hidden">
            <button
                onClick={() => {
                    setCursorFn("rect");
                }}
                className="fixed left-3 top-0 h-5 w-8 bg-slate-600 "
            >
                Rect
            </button>
            <button
                onClick={() => {
                    setCursorFn("drag");
                }}
                className="fixed left-12 top-0 h-5 w-8 bg-slate-600 "
            >
                drag
            </button>
            <button
                onClick={() => {
                    setCursorFn("line");
                }}
                className="fixed left-3 top-7 h-5 w-8 bg-slate-600 "
            >
                Line
            </button>
            <canvas
                ref={canvas}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            />
        </div>
    );
}

export default App;
