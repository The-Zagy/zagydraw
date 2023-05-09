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

import {
    getHitElement,
    getSvgPathFromStroke,
    normalizePos,
    normalizeToGrid
} from "utils";
import {
    ZagyCanvasHandDrawnElement,
    ZagyCanvasLineElement,
    ZagyCanvasRectElement,
    ZagyCanvasTextElement,
    CursorFn,
    FontTypeOptions
} from "types/general";
import renderScene from "utils/canvas/renderScene";
import useCursor from "hooks/useCursor";
import {
    generateHandDrawnElement,
    generateLineElement,
    generateRectElement,
    generateTextElement
} from "utils/canvas/generateElement";
import { nanoid } from "nanoid";
import clsx from "clsx";

const {
    setPosition,
    setZoomLevel,
    setDimensions,
    setElements,
    setCursorFn,
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
    const font = useStore((state) => state.font);
    const fontSize = useStore((state) => state.fontSize);
    const stroke = useStore((state) => state.stroke);
    const opacity = useStore((state) => state.opacity);
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
    const [isWriting, setIsWriting] = useState(false);
    const startPos = useRef<[number, number]>([0, 0]);
    const endPos = useRef<[number, number]>([0, 0]);
    const canvasElements = useStore((state) => state.elements);
    console.log(
        "🪵 [ZagyDraw.tsx:68] ~ token ~ \x1b[0;32mcanvasElements\x1b[0m = ",
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
    const textareaInput = useRef<HTMLTextAreaElement>(null);

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
    useEffect(() => {
        if (
            cursorFn === CursorFn.Text &&
            textareaInput.current !== null &&
            previewElement !== null &&
            isWriting === true
        ) {
            textareaInput.current.focus();
        }
    }, [previewElement, isWriting]);
    // each time the global font/fontSize changes i need to sync the canvas context with it because
    // the ctx font affect how the canvas measure text width/height
    useEffect(() => {
        if (!canvas.current || !roughCanvas.current) return;
        const ctx = canvas.current.getContext("2d");
        if (!ctx) return;
        ctx.font =
            `${fontSize}px ` +
            (font === FontTypeOptions.code
                ? "FiraCode"
                : font === FontTypeOptions.hand
                ? "HandWritten"
                : "Minecraft");
    }, [font, fontSize]);
    useCursor(cursorFn, isMouseDown);

    console.log("sel", selectedElements);

    const handlePointerDown: PointerEventHandler<HTMLCanvasElement> = (e) => {
        //handle dragging into the canvas
        if (!canvas.current) return;
        if (isWriting && cursorFn === CursorFn.Text) return;

        setIsMouseDown(true);
        const startX = e.pageX;
        const startY = e.pageY;

        mouseCoords.current = { startX, startY };
        // draw shape logic?
        if (cursorFn === CursorFn.Rect) {
            currentSeed.current = Math.random() * 1000000;
            const norm = normalizeToGrid(position, startX, startY);
            startPos.current = norm;
        } else if (cursorFn === CursorFn.Line) {
            const norm = normalizeToGrid(position, startX, startY);
            startPos.current = norm;
        } else if (cursorFn === CursorFn.FreeDraw) {
            setCurrentlyDrawnFreeHand([
                [startX - position.x, startY - position.y]
            ]);
        } else if (cursorFn === CursorFn.Text) {
            const norm = normalizeToGrid(position, startX, startY);
            startPos.current = norm;
            setIsWriting(true);
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
        // why handle before remove preview? because we want the preview to be set to the current text until finish editing in the text area
        // in other words we need to take control of preview element from this handler
        if (cursorFn === CursorFn.Text && isWriting) {
            const textEl = generateTextElement(
                "",
                startPos.current,
                // todo change start pos to correct pos
                startPos.current,
                position,
                {}
            );
            setPreviewElement(textEl);
            return;
        }
        if (!canvas.current) return;
        if (!roughCanvas.current) return;
        const generator = roughCanvas.current.generator;

        setPreviewElement(null);
        if (cursorFn === CursorFn.Line) {
            const line: ZagyCanvasLineElement = generateLineElement(
                generator,
                startPos.current,
                endPos.current,
                position,
                {}
            );
            setElements((prev) => {
                return [...prev, line];
            });
        } else if (cursorFn === CursorFn.Rect) {
            const rect: ZagyCanvasRectElement = generateRectElement(
                generator,
                startPos.current,
                endPos.current,
                position,
                {},
                currentSeed.current
            );

            setElements((prev) => {
                return [...prev, rect];
            });
        } else if (cursorFn === CursorFn.FreeDraw) {
            // todo change this to one function like any other element
            const path = generateHandDrawnElement(currentlyDrawnFreeHand);
            const el: ZagyCanvasHandDrawnElement = {
                id: nanoid(),
                shape: "handdrawn",
                x: 0,
                y: 0,
                curPos: position,
                path: path,
                options: {
                    opacity: 1,
                    stroke: "transparent",
                    strokeLineDash: [],
                    strokeWidth: 1
                }
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
            const norm = normalizeToGrid(position, x, y);
            endPos.current = norm;
            const generator = roughCanvas.current.generator;
            if (cursorFn === CursorFn.Rect) {
                const rect: ZagyCanvasRectElement = generateRectElement(
                    generator,
                    startPos.current,
                    endPos.current,
                    position,
                    {},
                    currentSeed.current
                );
                setPreviewElement(rect);
            }
            if (cursorFn === CursorFn.Line) {
                const line: ZagyCanvasLineElement = generateLineElement(
                    generator,
                    startPos.current,
                    endPos.current,
                    position,
                    {}
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
                    path: path,
                    options: {
                        opacity: 1,
                        stroke: "transparent",
                        strokeLineDash: [],
                        strokeWidth: 1
                    }
                } as ZagyCanvasHandDrawnElement);
            }
        }
    };

    // todo chaneg to pointer move and delete any hit along the way
    const handleOnClick: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
        if (cursorFn === CursorFn.Erase) {
            const startX = e.pageX;
            const startY = e.pageY;
            const el = getHitElement(
                canvasElements,
                [startX, startY],
                position
            );
            if (el !== null) {
                setElements((prev) => prev.filter((val) => val.id !== el.id));
            }
        }
    };

    const handleTextAreaBlur: React.FocusEventHandler<HTMLTextAreaElement> = (
        e
    ) => {
        if (canvas.current === null) return;
        const ctx = canvas.current.getContext("2d");
        if (ctx === null) return;
        if (isWriting && previewElement !== null) {
            const text = e.target.value;
            const width = ctx.measureText(text).width;
            const norm = normalizePos(
                previewElement.curPos,
                previewElement.x + width,
                previewElement.y + fontSize
            );
            const t = generateTextElement(
                text,
                [previewElement.x, previewElement.y],
                [norm[0], norm[1]],
                previewElement.curPos,
                {}
            );
            setCursorFn(CursorFn.Default);
            setElements((prev) => [...prev, t]);
            setPreviewElement(null);
            setIsWriting(false);
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
            {isWriting === true ? (
                <textarea
                    ref={textareaInput}
                    onBlur={handleTextAreaBlur}
                    className={clsx(
                        { "font-firacode": font === FontTypeOptions.code },
                        { "font-handwritten": font === FontTypeOptions.hand },
                        {
                            "font-minecraft": font === FontTypeOptions.minecraft
                        },

                        "pointer-events-none fixed bg-transparent overflow-hidden resize-none border-2 border-white h-7 text-white outline-none border-none p-0 m-0"
                    )}
                    style={{
                        top: mouseCoords.current.startY,
                        left: mouseCoords.current.startX,
                        fontSize: fontSize + "px",
                        opacity
                    }}
                ></textarea>
            ) : null}
            <canvas
                className="h-screen w-screen overflow-hidden"
                ref={canvas}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={handleOnClick}
            />
        </>
    );
}

export default ZagyDraw;
