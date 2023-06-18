import { useStore } from "store";
import { CursorFn, ZagyCanvasElement } from "types/general";
import { Point, normalizePos } from "utils";
import { Command, UndoableCommand } from "./types";
import { generateTextElement } from "utils/canvas/generateElement";

class TextAction {
    private static lastMouseDownPosition: Point = [0, 0];
    private static isAlreadyElement: boolean;
    private static _start(coords: Point) {
        const { cursorFn, currentText } = useStore.getState();
        //todo maybe find a better way to do this

        if (cursorFn === CursorFn.Text && (!this.isAlreadyElement || currentText === "")) {
            this.isAlreadyElement = true;
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

    public static preEnd(text: string): Command {
        return {
            execute: () => {
                const { currentText, setCurrentText } = useStore.getState();
                setCurrentText(text);
                if (currentText === "") return;
            },
        };
    }

    public static end(
        canvas: HTMLCanvasElement | null,
        textArea: HTMLTextAreaElement | null
    ): UndoableCommand | null {
        let element: ZagyCanvasElement | null = null;
        const { cursorFn } = useStore.getState();
        if (cursorFn !== CursorFn.Text) return null;
        return {
            execute: () => {
                if (canvas === null) return;
                const ctx = canvas.getContext("2d");
                if (ctx === null) return;
                const { currentText } = useStore.getState();
                element = generateTextElement(
                    ctx,
                    currentText,
                    [this.lastMouseDownPosition[0], this.lastMouseDownPosition[1]],
                    {}
                );
                const { setCurrentText, setIsWriting } = useStore.getState();
                this.isAlreadyElement = false;
                const { setElements } = useStore.getState();
                setElements((prev) => [...prev, element!]);
                setCurrentText("");
                setIsWriting(false);
                textArea?.blur();
            },
            undo: () => {
                const { setElements } = useStore.getState();
                if (element === null) return;
                setElements((prev) => prev.filter((val) => val.id !== element!.id));
            },
        };
    }
}

export default TextAction;