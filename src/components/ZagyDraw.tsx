import {
    PointerEventHandler,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import rough from "roughjs";
import { useStore } from "store";
import { getStroke } from "perfect-freehand";
import useGlobalEvent from "hooks/useGlobalEvent";
import { RoughCanvas } from "roughjs/bin/canvas";

import { getHitElement, getSvgPathFromStroke, normalize } from "utils";
import {
    CanvasHandDrawnElement,
    CanvasLineElement,
    CanvasRectElement,
    CursorFn
} from "types/general";
import renderScene from "utils/canvas/renderScene";
import useCursor from "hooks/useCursor";
import {
    generateHandDrawnElement,
    generateLineElement,
    generateRectElement
} from "utils/canvas/generateElement";
import { nanoid } from "nanoid";

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
    const selectedElements = useStore((state) => state.selectedElements);
    const currentSeed = useRef<number>(Math.random() * 1000000);
    const [currentlyDrawnFreeHand, setCurrentlyDrawnFreeHand] = useState<
        [number, number][]
    >([]);
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

    const mouseCoords = useRef<MouseCoords>({
        startX: 0,
        startY: 0
    });
    const startPos = useRef<[number, number]>([0, 0]);
    const endPos = useRef<[number, number]>([0, 0]);
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
            previewElement: previewElement,
            selectedElements: selectedElements
        });
    }, [
        width,
        height,
        position,
        zoom,
        canvasElements,
        previewElement,
        selectedElements
    ]);
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
            currentSeed.current = Math.random() * 1000000;
            const norm = normalize(position, startX, startY);
            startPos.current = norm;
        } else if (cursorFn === CursorFn.Line) {
            const norm = normalize(position, startX, startY);
            startPos.current = norm;
        } else if (cursorFn === CursorFn.FreeDraw) {
            setCurrentlyDrawnFreeHand([
                [startX - position.x, startY - position.y]
            ]);
        } else if (cursorFn === CursorFn.Default) {
            const el = getHitElement(
                canvasElements,
                [startX, startY],
                position
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
            const line: CanvasLineElement = generateLineElement(
                generator,
                startPos.current,
                endPos.current,
                position
            );
            setElements((prev) => {
                return [...prev, line];
            });
        } else if (cursorFn === CursorFn.Rect) {
            // todo don't repeat yourself => NOT WORKING
            // setNotReady(null);
            const rect: CanvasRectElement = generateRectElement(
                generator,
                startPos.current,
                endPos.current,
                position,
                {
                    seed: currentSeed.current
                }
            );

            setElements((prev) => {
                return [...prev, rect];
            });
        } else if (cursorFn === CursorFn.FreeDraw) {
            const path = generateHandDrawnElement(currentlyDrawnFreeHand);
            const el: CanvasHandDrawnElement = {
                id: nanoid(),
                shape: "handdrawn",
                x: 0,
                y: 0,
                curPos: position,
                color: "#fffffff",
                path: path
            };
            setElements((prev) => {
                return [...prev, el];
            });
        }
    };
    const handlePointerMove: PointerEventHandler<HTMLCanvasElement> = (e) => {
        // get the current mouse position
        const x = e.pageX;
        const y = e.pageY;
        //handle dragging into the canvas
        e.preventDefault();
        if (isMouseDown && canvas.current && cursorFn === CursorFn.Drag) {
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
        if (isMouseDown && canvas.current && roughCanvas.current) {
            // if (!roughCanvas.current) return;
            // const generator = roughCanvas.current.generator;
            const norm = normalize(position, x, y);
            endPos.current = norm;
            const generator = roughCanvas.current.generator;
            if (cursorFn === CursorFn.Rect) {
                const rect: CanvasRectElement = generateRectElement(
                    generator,
                    startPos.current,
                    endPos.current,
                    position,
                    {
                        seed: currentSeed.current
                    }
                );
                setPreviewElement(rect);
            }
            if (cursorFn === CursorFn.Line) {
                const line: CanvasLineElement = generateLineElement(
                    generator,
                    startPos.current,
                    endPos.current,
                    position
                );
                setPreviewElement(line);
            }

            if (cursorFn === CursorFn.FreeDraw) {
                setCurrentlyDrawnFreeHand((prev) => [
                    ...prev,
                    [x - position.x, y - position.y]
                ]);

                const path = generateHandDrawnElement(currentlyDrawnFreeHand);
                setPreviewElement({
                    id: nanoid(),
                    shape: "handdrawn",
                    x: 0,
                    y: 0,
                    curPos: position,
                    color: "#fffffff",
                    path: path
                } as CanvasHandDrawnElement);
            }
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
