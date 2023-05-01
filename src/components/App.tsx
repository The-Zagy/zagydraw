import { PointerEventHandler, useEffect, useLayoutEffect, useRef } from "react";
import rough from "roughjs";
import { useStore } from "store";
import drawGrid from "utils/canvas/drawGrid";
import useGlobalEvent from "hooks/useGlobalEvent";
import { RoughCanvas } from "roughjs/bin/canvas";
import drawElements from "utils/canvas/drawElements";

const { setPosition, setZoomLevel, setDimensions, setCursorFn, setElements } =
    useStore.getState();

const MAX_ZOOM = 96;
const MIN_ZOOM = 24;
type MouseCoords = {
    startX: number;
    startY: number;
};

function App() {
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
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
        ctx.fillStyle = "dark";
        ctx.fillRect(0, 0, canvas.current.width, canvas.current.height);
        //draw a the grid
        drawGrid(
            position.x,
            position.y,
            canvas.current.width,
            canvas.current.height,
            ctx
        );
        drawElements(canvasElements, roughCanvas.current, position);
    }, [position, zoom, width, height, canvasElements]);
    const handlePointerDown: PointerEventHandler<HTMLCanvasElement> = (e) => {
        //handle dragging into the canvas
        if (!canvas.current) return;
        isMouseDown.current = true;
        const startX = e.pageX;
        const startY = e.pageY;
        mouseCoords.current = { startX, startY };
        // draw shape logic?
        if (cursorFn === "rect") {
            setElements((prev) => {
                return [
                    ...prev,
                    {
                        color: "blue",
                        x: startX,
                        y: startY,
                        curPos: position,
                        // TODO w and h must be calclauted from mouse down pos to up pos
                        h: 100,
                        w: 100
                    }
                ];
            });
        } else if (cursorFn === "line") {
            setElements((prev) => {
                return [
                    ...prev,
                    {
                        color: "blue",
                        x: startX,
                        y: startY,
                        curPos: position,
                        // TODO w must be calclauted from mouse down pos to up pos
                        w: 100
                    }
                ];
            });
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
