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
        if (cursorFn === "shape") {
            setElements((prev) => {
                return [
                    ...prev,
                    {
                        color: "blue",
                        x: startX + position.x,
                        y: startY + position.y
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
            console.log(
                "🪵 [App.tsx:104] ~ token ~ \x1b[0;32me.pageX\x1b[0m = ",
                e.pageX
            );
            const y = e.pageY;
            console.log(
                "🪵 [App.tsx:106] ~ token ~ \x1b[0;32me.pageY\x1b[0m = ",
                e.pageY
            );

            // 50 is an arbitrary number to make the walk distance smaller
            const walkX = x - mouseCoords.current.startX;
            const walkY = y - mouseCoords.current.startY;
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
                    setCursorFn("shape");
                }}
                className="fixed left-3 top-0 h-5 w-6 bg-slate-600 "
            >
                shape
            </button>
            <button
                onClick={() => {
                    setCursorFn("drag");
                }}
                className="fixed left-12 top-0 h-5 w-6 bg-slate-600 "
            >
                drag
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
