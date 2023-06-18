import { useStore } from "store";
import { CursorFn, ZagyCanvasElement } from "types/general";
import { Point, normalizePos } from "utils";
import { Command, UndoableCommand } from "./types";
import { generateTextElement } from "utils/canvas/generateElement";
import { flushSync } from "react-dom";

class TextAction {
    private static lastMouseDownPosition: Point = [0, 0];
    private static _start(coords: Point, textArea: HTMLTextAreaElement | null) {
        const { cursorFn } = useStore.getState();
        const { currentText, setCurrentText } = useStore.getState();
        //todo maybe find a better way to do this
        flushSync(() => {
            textArea?.blur();
        });
        if (currentText === "") setCurrentText("");

        //at this point we're starting new text element, previous textField should be cleared

        if (cursorFn === CursorFn.Text) {
            const { position, setIsWriting } = useStore.getState();
            const norm = normalizePos(position, coords);
            this.lastMouseDownPosition = norm;
            setIsWriting(true);
            return;
        }
    }
    private static _inProgress(
        textAreaWrapper: HTMLDivElement | null,
        textArea: HTMLTextAreaElement | null
    ) {
        if (!textAreaWrapper || !textArea) return;

        textAreaWrapper.style.left = `${this.lastMouseDownPosition[0]}px`;
        textAreaWrapper.style.top = `${this.lastMouseDownPosition[1]}px`;
        textArea.focus();
    }
    public static inProgress(...args: Parameters<typeof TextAction._inProgress>): Command {
        return {
            execute: () => {
                TextAction._inProgress(...args);
            },
        };
    }

    public static start(...args: Parameters<typeof TextAction._start>): Command {
        return {
            execute: () => {
                TextAction._start(...args);
            },
        };
    }

    public static end(canvas: HTMLCanvasElement | null): UndoableCommand {
        let element: ZagyCanvasElement | null = null;
        return {
            execute: () => {
                const { currentText, setCurrentText } = useStore.getState();
                if (currentText === "") return;
                if (canvas === null) return;
                const ctx = canvas.getContext("2d");
                if (ctx === null) return;
                const { setElements, isWriting, setIsWriting } = useStore.getState();
                if (isWriting) {
                    element = generateTextElement(
                        ctx,
                        currentText,
                        [this.lastMouseDownPosition[0], this.lastMouseDownPosition[1]],
                        {}
                    );
                    setCurrentText("");
                    setElements((prev) => [...prev, element!]);
                    setIsWriting(false);
                }
            },
            undo: () => {
                if (element === null) return;
                const { setElements } = useStore.getState();
                setElements((prev) => prev.filter((val) => val.id !== element?.id));
            },
        };
    }
}

export default TextAction;
