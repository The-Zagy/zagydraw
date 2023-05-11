import {
    PointerEventHandler,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import { throttle } from "throttle-debounce";
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
    FontTypeOptions,
    ZagyCanvasElement
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
import useRenderScene from "hooks/useRenderScene";
import { d } from "vitest/dist/types-e3c9754d";

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
    const zoomLevel = useStore((state) => state.zoomLevel);
    const width = useStore((state) => state.width);
    const height = useStore((state) => state.height);
    const cursorFn = useStore((state) => state.cursorFn);
    const previewElement = useStore((state) => state.previewElement);
    const selectedElements = useStore((state) => state.selectedElements);
    const currentSeed = useRef<number>(Math.random() * 1000000);
    const willDelete = useRef<boolean>(false);
    const [deletedElements, setDeletedElements] = useState<string[]>([]);
    const [currentText, setCurrentText] = useState<string>("");
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

    const handleZoom = (zoomType: "in" | "out") => {
        if (zoomType === "in") {
            const currentZoom = zoomLevel + 12;
            if (currentZoom > MAX_ZOOM) return;
            setZoomLevel(currentZoom);
            return;
        }
        const currentZoom = zoomLevel - 12;
        if (currentZoom <= MIN_ZOOM) return;
        setZoomLevel(currentZoom);
    };

    const canvas = useRef<HTMLCanvasElement>(null);
    const roughCanvas = useRef<RoughCanvas | null>(null);
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
    useRenderScene(roughCanvas.current, canvas.current?.getContext("2d"), {
        width,
        height,
        position,
        zoomLevel,
        elements: canvasElements,
        previewElement,
        selectedElements
    });
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

    const handlePointerDown: PointerEventHandler<HTMLCanvasElement> = (e) => {
        setIsMouseDown(true);
        if (!canvas.current) return;
        // if (isWriting && cursorFn === CursorFn.Text) return;

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
            const norm = normalizePos(position, startX, startY);
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
        if (willDelete.current) {
            setElements((prev) => prev.filter((val) => !val.willDelete));
            willDelete.current = false;
        }
        if (!canvas.current) return;
        if (!roughCanvas.current) return;
        const generator = roughCanvas.current.generator;
        const ctx = canvas.current.getContext("2d");
        if (ctx === null) return;
        setIsMouseDown(false);

        // why handle before remove preview? because we want the preview to be set to the current text until finish editing in the text area
        // in other words we need to take control of preview element from this handler
        if (cursorFn === CursorFn.Text && isWriting) {
            const textEl = generateTextElement(
                ctx,
                "",
                startPos.current,
                position,
                {}
            );
            setPreviewElement(textEl);
            return;
        }

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
            // calculate how far the mouse has been moved
            const walkX = x - mouseCoords.current.startX;
            const walkY = y - mouseCoords.current.startY;
            // set the mouse position to the current position
            mouseCoords.current = { startX: x, startY: y };
            setPosition({ x: position.x + walkX, y: position.y + walkY });
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
            } else if (cursorFn === CursorFn.Line) {
                const line: ZagyCanvasLineElement = generateLineElement(
                    generator,
                    startPos.current,
                    endPos.current,
                    position,
                    {}
                );
                setPreviewElement(line);
            } else if (cursorFn === CursorFn.FreeDraw) {
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
            } else if (cursorFn === CursorFn.Erase) {
                const el = getHitElement(canvasElements, [x, y], position);
                if (el !== null) {
                    willDelete.current = true;
                    setElements((prev) =>
                        prev.map((val) =>
                            val.id === el.id
                                ? { ...val, willDelete: true }
                                : val
                        )
                    );
                }
            }
        }
    };

    const handleTextAreaBlur: React.FocusEventHandler<HTMLTextAreaElement> = (
        e
    ) => {
        setCurrentText("");
        if (canvas.current === null) return;
        const ctx = canvas.current.getContext("2d");
        if (ctx === null) return;
        if (isWriting && previewElement !== null) {
            const text = e.target.value;
            const t = generateTextElement(
                ctx,
                text,
                [previewElement.x, previewElement.y],
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
                <div
                    className={clsx(
                        { "font-firacode ": font === FontTypeOptions.code },
                        {
                            "font-handwritten ": font === FontTypeOptions.hand
                        },
                        {
                            "font-minecraft ":
                                font === FontTypeOptions.minecraft
                        },
                        " bg-transparent leading-none outline-none  p-0 m-0",
                        "grow-wrap pointer-events-none fixed bg-transparent"
                    )}
                    data-replicated-value={currentText}
                    style={{
                        color: stroke,
                        top: mouseCoords.current.startY,
                        left: mouseCoords.current.startX,
                        fontSize: fontSize + "px",
                        opacity
                    }}
                >
                    <textarea
                        ref={textareaInput}
                        onBlur={handleTextAreaBlur}
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        className=" bg-transparent leading-none outline-none  p-0 m-0"
                    />
                </div>
            ) : null}
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

export default ZagyDraw;
