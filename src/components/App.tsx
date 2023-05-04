import {
    PointerEventHandler,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import rough from "roughjs";
import { useStore } from "store";

import useGlobalEvent from "hooks/useGlobalEvent";
import { RoughCanvas } from "roughjs/bin/canvas";

import { normalize } from "utils";
import { CanvasLineElement, CanvasRectElement, CursorFn } from "types/general";
import renderScene from "utils/canvas/renderScene";
import useCursor from "hooks/useCursor";

const {
    setPosition,
    setZoomLevel,
    setDimensions,
    setCursorFn,
    setElements,
    getCanvasState,
    setPreviewElement
} = useStore.getState();

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
    const previewElement = useStore((state) => state.previewElement);
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

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
        if (!canvas.current || !roughCanvas.current) return;
        const ctx = canvas.current.getContext("2d");
        if (!ctx) return;
        renderScene(roughCanvas.current, ctx, {
            width,
            height,
            position,
            elements: canvasElements,
            zoomLevel: zoom,
            previewElement: previewElement
        });
    }, [width, height, position, zoom, canvasElements, previewElement]);
    useCursor(cursorFn, isMouseDown);
    const handlePointerDown: PointerEventHandler<HTMLCanvasElement> = (e) => {
        //handle dragging into the canvas
        if (!canvas.current) return;

        setIsMouseDown(true);
        const startX = e.pageX;
        const startY = e.pageY;

        mouseCoords.current = { startX, startY };
        // draw shape logic?
        if (cursorFn === CursorFn.Rect) {
            const norm = normalize(position, startX, startY);
            startPos.current = norm;
        } else if (cursorFn === CursorFn.Line) {
            const norm = normalize(position, startX, startY);
            startPos.current = norm;
        }
    };
    const handlePointerUp: PointerEventHandler<HTMLCanvasElement> = () => {
        setIsMouseDown(false);
        if (!canvas.current) return;
        if (!roughCanvas.current) return;
        const generator = roughCanvas.current.generator;
        setPreviewElement(null);
        if (cursorFn === CursorFn.Line) {
            // todo don't repeat yourself => NOT WORKING
            // setNotReady(null);
            const line: CanvasLineElement = {
                ...generator.line(
                    startPos.current[0],
                    startPos.current[1],
                    endPos.current[0],
                    endPos.current[1],
                    {
                        fill: "#0b7285",
                        stroke: "#0b7285",
                        strokeWidth: 2,
                        roughness: 0
                    }
                ),
                x: startPos.current[0],
                y: startPos.current[1],
                color: "#0b7285",
                shape: "line",
                curPos: position,
                length: 20
            };
            setElements((prev) => {
                return [...prev, line];
            });
        } else if (cursorFn === CursorFn.Rect) {
            // todo don't repeat yourself => NOT WORKING
            // setNotReady(null);
            const rect: CanvasRectElement = {
                ...generator.rectangle(
                    startPos.current[0],
                    startPos.current[1],
                    endPos.current[0] - startPos.current[0],
                    endPos.current[1] - startPos.current[1],
                    {
                        fill: "#0b7285",
                        stroke: "#0b7285",
                        strokeWidth: 2,
                        roughness: 0
                    }
                ),
                x: startPos.current[0],
                y: startPos.current[1],
                w: 100,
                h: 100,
                color: "#0b7285",
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
        if (isMouseDown && canvas.current && cursorFn === CursorFn.Drag) {
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
        if (isMouseDown && canvas.current && cursorFn !== CursorFn.Drag) {
            // if (!roughCanvas.current) return;
            // const generator = roughCanvas.current.generator;

            const norm = normalize(position, x, y);
            endPos.current = norm;
            if (!roughCanvas.current) return;
            const generator = roughCanvas.current.generator;
            // TODO insertion preview not working
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
                color: "blue",
                shape: "rectangle",
                curPos: position,
                length: 20
            };
            setPreviewElement(rect);
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
                    setCursorFn(CursorFn.Rect);
                }}
                className="fixed left-3 top-0 h-5 w-8 bg-slate-600 "
            >
                Rect
            </button>
            <button
                onClick={() => {
                    setCursorFn(CursorFn.Drag);
                }}
                className="fixed left-12 top-0 h-5 w-8 bg-slate-600 "
            >
                drag
            </button>
            <button
                onClick={() => {
                    setCursorFn(CursorFn.Line);
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
