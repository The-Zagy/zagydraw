import { PointerEventHandler, useEffect, useLayoutEffect, useRef } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import clsx from "clsx";
import { commandManager } from "actions/commandManager";
import { useCursor, useEvent, useGlobalEvent, useMultiPhaseEvent, useRenderScene } from "hooks";
import { FontTypeOptions } from "types/general";

import { useStore } from "store";

import DeleteAction from "actions/delete";
import DrawAction from "actions/draw";
import DragAction from "actions/drag";
import SingleSelectAction from "actions/singleSelect";
import MultiSelectAction from "actions/multiselect";
import TextAction from "actions/createText";
import MoveElementAction from "actions/moveElement";
const { setZoomLevel, setDimensions, setIsMouseDown } = useStore.getState();

const MAX_ZOOM = 96;
const MIN_ZOOM = 24;

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
    const multiSelectRect = useStore((state) => state.multiSelectRect);
    const isWriting = useStore((state) => state.isWriting);
    const currentText = useStore((state) => state.currentText);
    // no need to use useStore() since mouseCoords shouldn't trigger a re-render when it changes
    const mouseCoords = useRef<[number, number]>([0, 0]);
    const textAreaWrapper = useRef<HTMLDivElement>(null);
    const isMouseDown = useStore((state) => state.isMouseDown);

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
    useRenderScene(roughCanvas.current, canvas.current?.getContext("2d") || null, {
        width,
        height,
        position,
        zoomLevel,
        elements: canvasElements,
        previewElement,
        selectedElements,
        visibleElements,
        multiSelectRect,
    });

    useCursor(cursorFn, isMouseDown, null);

    const handlePointerDown: PointerEventHandler<HTMLCanvasElement> = (e) => {
        setIsMouseDown(true);
        const startX = e.clientX;
        const startY = e.clientY;
        mouseCoords.current = [startX, startY];
    };

    const handlePointerUp: PointerEventHandler<HTMLCanvasElement> = () => {
        setIsMouseDown(false);

        if (!canvas.current) return;

        const ctx = canvas.current.getContext("2d");
        if (ctx === null) return;
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

    const handleTextAreaBlur: React.FocusEventHandler<HTMLTextAreaElement> = () => {
        if (currentText === "") return;
        commandManager.executeCommand(TextAction.end(canvas.current, textareaInput.current));
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

    const selectSingleElement = (e: PointerEvent) => {
        commandManager.executeCommand(
            SingleSelectAction.inProgress([e.clientX, e.clientY], canvas.current)
        );
    };

    useGlobalEvent("wheel", handleScroll);
    useGlobalEvent("resize", handleResize);

    useEvent("pointerdown", selectSingleElement, canvas.current);
    useMultiPhaseEvent(
        "dragIntoCanvas",
        [
            {
                event: "pointerdown",
                callback: (e) => {
                    commandManager.executeCommand(DragAction.start([e.clientX, e.clientY]));
                },
                options: true,
            },
            {
                event: "pointermove",
                callback: (e) => {
                    commandManager.executeCommand(
                        DragAction.inProgress([e.clientX, e.clientY], canvas.current)
                    );
                },
            },
        ],
        canvas.current
    );
    useMultiPhaseEvent(
        "drawElement",
        [
            {
                event: "pointerdown",
                callback: (e) => {
                    commandManager.executeCommand(DrawAction.start([e.clientX, e.clientY]));
                },
                options: true,
            },
            {
                event: "pointermove",
                callback: (e) => {
                    commandManager.executeCommand(
                        DrawAction.inProgress([e.clientX, e.clientY], canvas.current)
                    );
                },
            },
            {
                event: "pointerup",
                callback: () => {
                    commandManager.executeCommand(DrawAction.end());
                },
            },
        ],
        canvas.current
    );
    useMultiPhaseEvent(
        "MultiSelect",
        [
            {
                event: "pointerdown",
                callback: (e) => {
                    commandManager.executeCommand(MultiSelectAction.start([e.clientX, e.clientY]));
                },
                options: true,
            },
            {
                event: "pointermove",
                callback: (e) => {
                    commandManager.executeCommand(
                        MultiSelectAction.inProgress([e.clientX, e.clientY], canvas.current)
                    );
                },
            },
            {
                event: "pointerup",
                callback: () => {
                    commandManager.executeCommand(MultiSelectAction.end());
                },
            },
        ],
        canvas.current
    );
    useMultiPhaseEvent(
        "delete",
        [
            {
                event: "pointermove",
                callback: (e) => {
                    commandManager.executeCommand(
                        DeleteAction.inProgress([e.clientX, e.clientY], canvas.current)
                    );
                },
            },
            {
                event: "pointerup",
                callback: () => {
                    commandManager.executeCommand(DeleteAction.end());
                },
            },
        ],
        canvas.current
    );
    useMultiPhaseEvent(
        "createText",
        [
            {
                event: "pointerdown",
                callback: (e) => {
                    commandManager.executeCommand(TextAction.start([e.clientX, e.clientY]));
                },
                options: true,
            },
            {
                event: "pointerup",
                callback: () => {
                    commandManager.executeCommand(
                        TextAction.inProgress(textAreaWrapper.current, textareaInput.current)
                    );
                },
            },
        ],
        canvas.current
    );
    useMultiPhaseEvent(
        "moveElement",
        [
            {
                event: "pointerdown",
                callback: (e) => {
                    commandManager.executeCommand(MoveElementAction.start([e.clientX, e.clientY]));
                },
                options: true,
            },
            {
                event: "pointermove",
                callback: (e) => {
                    commandManager.executeCommand(
                        MoveElementAction.inProgress([e.clientX, e.clientY], canvas.current)
                    );
                },
            },
            {
                event: "pointerup",
                callback: () => {
                    commandManager.executeCommand(MoveElementAction.end());
                },
            },
        ],
        canvas.current
    );
    return (
        <>
            {isWriting === true ? (
                <div
                    ref={textAreaWrapper}
                    className={clsx(
                        { "font-firacode ": font === "code" },
                        {
                            "font-handwritten ": font === "hand",
                        },
                        {
                            "font-minecraft ": font === "minecraft",
                        },
                        " m-0  p-0  leading-none outline-none",
                        "grow-wrap pointer-events-none fixed bg-transparent"
                    )}
                    //for wrapping text
                    data-replicated-value={currentText}
                    style={{
                        color: stroke,
                        fontSize: fontSize + "px",
                        opacity,
                    }}>
                    <textarea
                        ref={textareaInput}
                        onBlur={handleTextAreaBlur}
                        value={currentText}
                        onChange={(e) => {
                            commandManager.executeCommand(TextAction.preEnd(e.target.value));
                        }}
                        onKeyUp={(e) => {
                            if (e.key === "Escape") {
                                commandManager.executeCommand(
                                    TextAction.end(canvas.current, textareaInput.current)
                                );
                            }
                        }}
                        className="m-0 bg-transparent p-0  leading-none outline-none"
                    />
                </div>
            ) : null}
            <canvas
                className="h-screen w-screen touch-none overflow-hidden"
                ref={canvas}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                data-testid="canvas"
            />
            {/* <div className="fixed bottom-4 right-4 text-lg text-white">
                <pre>{JSON.stringify(position)}</pre>
                <pre>{JSON.stringify(normalizePos(position, mouseCoords.current))}</pre>
            </div> */}
        </>
    );
}

export default ZagyDraw;
