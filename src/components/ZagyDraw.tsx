import {
    PointerEventHandler,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import rough from "roughjs";
import { nanoid } from "nanoid";
import { useStore } from "store";

import useGlobalEvent from "hooks/useGlobalEvent";
import { RoughCanvas } from "roughjs/bin/canvas";

import { getHitElement, normalize } from "utils";
import { CanvasLineElement, CanvasRectElement, CursorFn } from "types/general";
import renderScene from "utils/canvas/renderScene";
import useCursor from "hooks/useCursor";

const {
    setPosition,
    setZoomLevel,
    setDimensions,

    setElements,

    setPreviewElement,
    setSelectedElements
} = useStore.getState();

const MAX_ZOOM = 96;
const MIN_ZOOM = 24;
type MouseCoords = {
    startX: number;
    startY: number;
};

function ZagyDraw() {
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
    console.log(
        "🪵 [ZagyDraw.tsx:52] ~ token ~ \x1b[0;32mcanvasElements\x1b[0m = ",
        canvasElements
    );
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
        } else if (cursorFn === CursorFn.Default) {
            const el = getHitElement(
                canvasElements,
                [startX, startY],
                position
            );

            console.log(
                "🪵 [ZagyDraw.tsx:113] ~ token ~ \x1b[0;32mel\x1b[0m = ",
                el
            );
            if (el !== null) {
                setSelectedElements(() => [el]);
            } else {
                setSelectedElements(() => []);
            }
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
                id: nanoid(),
                x: startPos.current[0],
                y: startPos.current[1],
                endX: endPos.current[0],
                endY: endPos.current[1],
                color: "#0b7285",
                shape: "line",
                curPos: position
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
                        stroke: "#B223DB",
                        strokeWidth: 2,
                        roughness: 2
                    }
                ),
                id: nanoid(),
                x: startPos.current[0],
                y: startPos.current[1],
                endX: endPos.current[0],
                endY: endPos.current[1],
                color: "#0b7285",
                shape: "rectangle",
                curPos: position
            };
            console.log(rect);
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
        if (
            isMouseDown &&
            canvas.current &&
            cursorFn !== CursorFn.Drag &&
            cursorFn !== CursorFn.Default
        ) {
            // if (!roughCanvas.current) return;
            // const generator = roughCanvas.current.generator;

            const norm = normalize(position, x, y);
            endPos.current = norm;
            if (!roughCanvas.current) return;
            const generator = roughCanvas.current.generator;
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
                id: nanoid(),
                x: startPos.current[0],
                y: startPos.current[1],
                endX: endPos.current[0],
                endY: endPos.current[1],
                color: "#0b7285",
                shape: "rectangle",
                curPos: position
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
        <canvas
            className="h-screen w-screen overflow-hidden"
            ref={canvas}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        />
    );
}

export default ZagyDraw;