import { PointerEventHandler, useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import clsx from "clsx";
import { randomSeed } from "roughjs/bin/math";
import { RoughGenerator } from "roughjs/bin/generator";
import { commandManager } from "actions/commandManager";

import { useCursor, useEvent, useGlobalEvent, useMultiPhaseEvent, useRenderScene } from "hooks";
import { getHitElement, isElementInRect, normalizePos, normalizeToGrid } from "utils";
import {
    ZagyCanvasLineElement,
    ZagyCanvasRectElement,
    CursorFn,
    FontTypeOptions,
    ZagyCanvasElement,
} from "types/general";
import {
    generateCacheRectElement,
    generateCachedHandDrawnElement,
    generateHandDrawnElement,
    generateLineElement,
    generateRectElement,
    generateSelectRectElement,
    generateTextElement,
} from "utils/canvas/generateElement";
import { useStore } from "store";
import { ActionDeleteMarkedElements } from "actions/delete";
import { ActionInsertElements } from "actions/insertElement";
import { MdUndo } from "react-icons/md";
const {
    setPosition,
    setZoomLevel,
    setDimensions,
    setElements,
    setCursorFn,
    setPreviewElement,
    setSelectedElements,
} = useStore.getState();

const MAX_ZOOM = 96;
const MIN_ZOOM = 24;
type MouseCoords = {
    startX: number;
    startY: number;
};
const initialLocalStateForEventHandlers: {
    draw: { currentSeed: number; currentText: string; currentlyDrawnFreeHand: [number, number][] };
    multiSelect: {
        multiSelectRect: ZagyCanvasRectElement | null;
    };
} = {
    draw: { currentSeed: randomSeed(), currentText: "", currentlyDrawnFreeHand: [] },
    multiSelect: { multiSelectRect: null },
};
const roughGenerator = new RoughGenerator();
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
    const visibleElements = useStore((state) => state.visibleElements);
    //changes every time a new element is drawn
    const willDelete = useRef<boolean>(false);
    const [currentText, setCurrentText] = useState<string>("");

    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [multiSelectRect, setMultiSelectRect] = useState<ZagyCanvasRectElement | null>(null);
    const mouseCoords = useRef<MouseCoords>({
        startX: 0,
        startY: 0,
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
    useRenderScene(
        roughCanvas.current,
        canvas.current?.getContext("2d") || null,
        {
            width,
            height,
            position,
            zoomLevel,
            elements: canvasElements,
            previewElement,
            selectedElements,
            visibleElements,
        },
        multiSelectRect
    );

    useEffect(() => {
        if (
            cursorFn === CursorFn.Text &&
            textareaInput.current !== null &&
            previewElement !== null &&
            isWriting === true
        ) {
            textareaInput.current.focus();
        }
    }, [previewElement, isWriting, cursorFn]);
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

    useCursor(cursorFn, isMouseDown, null);

    const handlePointerDown: PointerEventHandler<HTMLCanvasElement> = (e) => {
        setIsMouseDown(true);
        const startX = e.pageX;
        const startY = e.pageY;
        mouseCoords.current = { startX, startY };
    };

    const handlePointerUp: PointerEventHandler<HTMLCanvasElement> = () => {
        setIsMouseDown(false);

        if (!canvas.current) return;

        const ctx = canvas.current.getContext("2d");
        if (ctx === null) return;

        // why handle before remove preview? because we want the preview to be set to the current text until finish editing in the text area
        // in other words we need to take control of preview element from this handler
        if (cursorFn === CursorFn.Text && isWriting) {
            const textEl = generateTextElement(ctx, "", startPos.current, {});
            setPreviewElement(textEl);
            return;
        }
    };

    // const cursorfnHandler = () => {
    //     if (cursorFn === CursorFn.Default) {
    //         if (isMouseDown) {
    //             const selectionRect = generateSelectRectElement(
    //                 roughGenerator,
    //                 startPos.current,
    //                 endPos.current
    //             );
    //             setMultiSelectRect(selectionRect);
    //         }
    //     }
    // };

    // cursorfnHandler();

    const handleTextAreaBlur: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
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
    const dragIntoCanvas = (e: PointerEvent) => {
        const x = e.pageX;
        const y = e.pageY;
        if (isMouseDown && canvas.current && cursorFn === CursorFn.Drag) {
            // calculate how far the mouse has been moved
            const walkX = x - mouseCoords.current.startX;
            const walkY = y - mouseCoords.current.startY;
            // set the mouse position to the current position
            mouseCoords.current = { startX: x, startY: y };
            setPosition({ x: position.x + walkX, y: position.y + walkY });
        }
    };
    const selectSingleElement = (e: PointerEvent) => {
        const startX = e.pageX;
        const startY = e.pageY;
        if (!canvas.current) return;
        const ctx = canvas.current.getContext("2d");
        if (!ctx) return;
        if (cursorFn === CursorFn.Default) {
            const el = getHitElement(canvasElements, ctx, [startX, startY], position);
            if (el !== null) {
                setSelectedElements(() => [el]);
            } else {
                setSelectedElements(() => []);
            }
        }
    };

    useGlobalEvent("wheel", handleScroll);
    useGlobalEvent("resize", handleResize);
    useEvent("pointermove", dragIntoCanvas, canvas.current);
    useEvent("pointerdown", selectSingleElement, canvas.current);
    useMultiPhaseEvent(
        "drawElement",
        initialLocalStateForEventHandlers["draw"],
        [
            {
                event: "pointerdown",
                callback: (e, _, setState) => {
                    const startX = e.pageX;
                    const startY = e.pageY;

                    if (cursorFn === CursorFn.Rect) {
                        const norm = normalizeToGrid(position, [startX, startY]);
                        startPos.current = norm;
                    } else if (cursorFn === CursorFn.Line) {
                        const norm = normalizeToGrid(position, [startX, startY]);
                        startPos.current = norm;
                    } else if (cursorFn === CursorFn.FreeDraw) {
                        setState((prev) => ({
                            ...prev,
                            currentlyDrawnFreeHand: [[startX - position.x, startY - position.y]],
                        }));
                    } else if (cursorFn === CursorFn.Text) {
                        const norm = normalizePos(position, [startX, startY]);
                        startPos.current = norm;
                        setIsWriting(true);
                    }
                },
                options: true,
            },
            {
                event: "pointermove",
                callback: (e, localState, setState) => {
                    const x = e.pageX;
                    const y = e.pageY;
                    const { currentSeed, currentlyDrawnFreeHand } = localState;
                    if (isMouseDown && canvas.current) {
                        // if (!roughCanvas.current) return;
                        const norm = normalizeToGrid(position, [x, y]);
                        endPos.current = norm;
                        if (cursorFn === CursorFn.Rect) {
                            const rect: ZagyCanvasRectElement = generateRectElement(
                                roughGenerator,
                                startPos.current,
                                endPos.current,
                                { seed: currentSeed }
                            );
                            setPreviewElement(rect);
                        } else if (cursorFn === CursorFn.Line) {
                            const line: ZagyCanvasLineElement = generateLineElement(
                                roughGenerator,
                                startPos.current,
                                endPos.current,
                                {}
                            );
                            setPreviewElement(line);
                        } else if (cursorFn === CursorFn.FreeDraw) {
                            setState((prev) => ({
                                ...prev,
                                currentlyDrawnFreeHand: [
                                    ...prev.currentlyDrawnFreeHand,
                                    [x - position.x, y - position.y],
                                ],
                            }));
                            setPreviewElement(generateHandDrawnElement(currentlyDrawnFreeHand));
                        }
                    }
                },
            },
            {
                event: "pointerup",
                callback: (_, localState, setState) => {
                    const { currentSeed, currentlyDrawnFreeHand } = localState;
                    setPreviewElement(null);
                    let el: ZagyCanvasElement | null = null;
                    if (cursorFn === CursorFn.Line) {
                        const line: ZagyCanvasLineElement = generateLineElement(
                            roughGenerator,
                            startPos.current,
                            endPos.current,

                            {}
                        );
                        el = line;
                        setState((prev) => ({ ...prev, currentSeed: randomSeed() }));
                    } else if (cursorFn === CursorFn.Rect) {
                        const rect = generateCacheRectElement(
                            roughGenerator,
                            startPos.current,
                            endPos.current,

                            { seed: currentSeed }
                        );
                        if (rect.endX - rect.x < 10 || rect.endY - rect.y < 10) return;

                        el = rect;
                        setState((prev) => ({ ...prev, currentSeed: randomSeed() }));
                    } else if (cursorFn === CursorFn.FreeDraw) {
                        // todo change this to one function like any other element

                        const handDrawnElement =
                            generateCachedHandDrawnElement(currentlyDrawnFreeHand);
                        el = handDrawnElement;
                        setState((prev) => ({ ...prev, currentlyDrawnFreeHand: [] }));
                    }
                    if (el !== null) {
                        commandManager.executeCommand(new ActionInsertElements(el));
                    }
                },
            },
        ],
        canvas.current
    );
    useMultiPhaseEvent(
        "MultiSelect",
        {},
        [
            {
                event: "pointerdown",
                callback: (e) => {
                    const startX = e.pageX;
                    const startY = e.pageY;
                    console.log("in select start");
                    if (cursorFn === CursorFn.Default) {
                        console.log("in select start");
                        const norm = normalizePos(position, [startX, startY]);
                        startPos.current = norm;
                    }
                },
                options: true,
            },
            {
                event: "pointermove",
                callback: (e) => {
                    const x = e.pageX;
                    const y = e.pageY;

                    if (isMouseDown && canvas.current && cursorFn === CursorFn.Default) {
                        const norm = normalizePos(position, [x, y]);
                        endPos.current = norm;

                        const rect: ZagyCanvasRectElement = generateSelectRectElement(
                            roughGenerator,
                            startPos.current,
                            endPos.current
                        );
                        setMultiSelectRect(rect);
                    }
                },
            },
            {
                event: "pointerup",
                callback: () => {
                    if (multiSelectRect !== null) {
                        const selected = canvasElements.filter((el) =>
                            isElementInRect(el, multiSelectRect)
                        );
                        setSelectedElements(() => selected);
                    }
                    setMultiSelectRect(null);
                },
            },
        ],
        canvas.current
    );
    useMultiPhaseEvent(
        "delete",
        {},
        [
            {
                event: "pointermove",
                callback: (e) => {
                    if (cursorFn === CursorFn.Erase && isMouseDown) {
                        const x = e.pageX;
                        const y = e.pageY;
                        if (!canvas.current) return;
                        const ctx = canvas.current.getContext("2d");
                        if (!ctx) return;
                        const el = getHitElement(canvasElements, ctx, [x, y], position);
                        if (el !== null) {
                            willDelete.current = true;
                            setElements((prev) =>
                                prev.map((val) =>
                                    val.id === el.id ? { ...val, willDelete: true } : val
                                )
                            );
                        }
                    }
                },
            },
            {
                event: "pointerup",
                callback: () => {
                    if (willDelete.current) {
                        commandManager.executeCommand(new ActionDeleteMarkedElements());
                        willDelete.current = false;
                    }
                },
            },
        ],
        canvas.current
    );
    return (
        <>
            {isWriting === true ? (
                <div
                    className={clsx(
                        { "font-firacode ": font === FontTypeOptions.code },
                        {
                            "font-handwritten ": font === FontTypeOptions.hand,
                        },
                        {
                            "font-minecraft ": font === FontTypeOptions.minecraft,
                        },
                        " m-0  p-0  leading-none outline-none",
                        "grow-wrap pointer-events-none fixed bg-transparent"
                    )}
                    data-replicated-value={currentText}
                    style={{
                        color: stroke,
                        top: mouseCoords.current.startY,
                        left: mouseCoords.current.startX,
                        fontSize: fontSize + "px",
                        opacity,
                    }}>
                    <textarea
                        ref={textareaInput}
                        onBlur={handleTextAreaBlur}
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        className=" m-0 bg-transparent p-0  leading-none outline-none"
                    />
                </div>
            ) : null}
            <canvas
                className="h-screen w-screen overflow-hidden"
                ref={canvas}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
            />
            <button
                className="bg-primary-600 fixed bottom-4 left-4 h-fit w-fit  rounded-lg p-2"
                onClick={() => {
                    commandManager.undoCommand();
                    return;
                }}>
                <MdUndo size={35} className="m-auto text-white" />
            </button>
        </>
    );
}

export default ZagyDraw;
