import { PointerEventHandler, useEffect, useLayoutEffect, useRef } from "react";
import rough from "roughjs";
import { useStore } from "store";

import useGlobalEvent from "hooks/useGlobalEvent";
import { RoughCanvas } from "roughjs/bin/canvas";
import { throttle } from "throttle-debounce";
import { normalize } from "utils";
import { CanvasLineElement, CanvasRectElement } from "types/general";
import renderScene from "utils/canvas/renderScene";

const {
    setPosition,
    setZoomLevel,
    setDimensions,
    setCursorFn,
    setElements,
    getCanvasState,
    setNotReady
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
    const startPos = useRef([0, 0]);
    const endPos = useRef([0, 0]);
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
    const lastAnimationFrame = useRef<number | null>(null);
    useLayoutEffect(() => {
        if (canvas.current) {
            //make canvas fill the screen
            canvas.current.width = document.body.clientWidth;
            canvas.current.height = document.body.clientHeight;
        }
    }, []);
    useEffect(() => {
        //set canvas dimensions
        setDimensions(document.body.clientWidth, document.body.clientHeight);
        // init rough canvas
        if (roughCanvas.current || !canvas.current) return;
        roughCanvas.current = rough.canvas(canvas.current);
    }, []);
    useEffect(() => {
        console.log("pos", position.x, position.y);
        if (!canvas.current || !roughCanvas.current) return;
        const ctx = canvas.current.getContext("2d");
        if (!ctx) return;

        renderScene(roughCanvas.current, ctx, canvasState);
    }, [position, zoom, width, height, canvasElements]);
    const handlePointerDown: PointerEventHandler<HTMLCanvasElement> = (e) => {
        //handle dragging into the canvas
        if (!canvas.current) return;
        document.body.style.cursor = "dragging";
        isMouseDown.current = true;
        const startX = e.pageX;
        const startY = e.pageY;

        mouseCoords.current = { startX, startY };
        // draw shape logic?
        if (cursorFn === "rect") {
            const norm = normalize(position, startX, startY);
            startPos.current = norm;
        } else if (cursorFn === "line") {
            const norm = normalize(position, startX, startY);
            startPos.current = norm;
        }
    };
    const handlePointerUp: PointerEventHandler<HTMLCanvasElement> = () => {
        isMouseDown.current = false;
        document.body.style.cursor = "default";
        if (!canvas.current) return;
        if (!roughCanvas.current) return;
        const generator = roughCanvas.current.generator;
        if (cursorFn === "line") {
            // todo don't repeat yourself => NOT WORKING
            // setNotReady(null);
            const line: CanvasLineElement = {
                ...generator.line(
                    startPos.current[0],
                    startPos.current[1],
                    endPos.current[0],
                    endPos.current[1],
                    {
                        fill: "blue",
                        stroke: "red",
                        strokeWidth: 2,
                        roughness: 0
                    }
                ),
                x: startPos.current[0],
                y: startPos.current[1],
                color: "blue",
                shape: "line",
                curPos: position,
                length: 20
            };
            setElements((prev) => {
                return [...prev, line];
            });
        } else if (cursorFn === "rect") {
            // todo don't repeat yourself => NOT WORKING
            // setNotReady(null);
            const rect: CanvasRectElement = {
                ...generator.rectangle(
                    startPos.current[0],
                    startPos.current[1],
                    endPos.current[0] - startPos.current[0],
                    endPos.current[1] - startPos.current[1],
                    {
                        fill: "blue",
                        stroke: "red",
                        strokeWidth: 2,
                        roughness: 0
                    }
                ),
                x: startPos.current[0],
                y: startPos.current[1],
                w: 100,
                h: 100,
                color: "blue",
                shape: "rectangle",
                curPos: position
            };
            setElements((prev) => {
                return [...prev, rect];
            });
        }
    };
    const handlePointerMove: PointerEventHandler<HTMLCanvasElement> = (e) => {
        // get the current mouse position
        const x = e.pageX;
        const y = e.pageY;
        //handle dragging into the canvas
        if (isMouseDown.current && canvas.current && cursorFn === "drag") {
            e.preventDefault();

            if (lastAnimationFrame.current) {
                cancelAnimationFrame(lastAnimationFrame.current);
            }
            lastAnimationFrame.current = requestAnimationFrame(() => {
                // calculate how far the mouse has been moved
                const walkX = x - mouseCoords.current.startX;
                const walkY = y - mouseCoords.current.startY;
                // set the mouse position to the current position
                mouseCoords.current = { startX: x, startY: y };
                setPosition({ x: position.x + walkX, y: position.y + walkY });
                lastAnimationFrame.current = null;
            });
        }
        if (isMouseDown.current && canvas.current && cursorFn !== "drag") {
            // if (!roughCanvas.current) return;
            // const generator = roughCanvas.current.generator;
            const norm = normalize(position, x, y);
            endPos.current = norm;
            // TODO insertion preview not working
            // const line: CanvasLineElement = {
            //     ...generator.line(
            //         startPos.current[0],
            //         startPos.current[1],
            //         norm[0],
            //         norm[1],
            //         {
            //             fill: "blue",
            //             stroke: "red",
            //             strokeWidth: 2,
            //             roughness: 0
            //         }
            //     ),
            //     x: startPos.current[0],
            //     y: startPos.current[1],
            //     color: "blue",
            //     shape: "line",
            //     curPos: position,
            //     length: 20
            // };
            // setNotReady(line);
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
        <>
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
                className="h-screen w-screen overflow-hidden"
                ref={canvas}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            />
        </>
    );
}

export default App;
