import { Command, UndoableCommand } from "./types";
import { useStore } from "@/store";
import { CursorFn, ZagyCanvasElement } from "@/types/general";
import { Point, normalizePos } from "@/utils";
import { generateTextElement } from "@/utils/canvas/generateElement";

class TextAction {
    private static lastMouseDownPosition: Point = [0, 0];
    private static isAlreadyElement: boolean;
    private static _start(coords: Point) {
        const { cursorFn, currentText } = useStore.getState();
        //todo maybe find a better way to do this

        if (cursorFn === CursorFn.Text && (!this.isAlreadyElement || currentText === "")) {
            this.isAlreadyElement = true;
            const { setIsWriting } = useStore.getState();
            this.lastMouseDownPosition = coords;
            setIsWriting(true);
            return;
        }
    }
    private static _inProgress(
        textAreaWrapper: HTMLDivElement | null,
        textArea: HTMLTextAreaElement | null
    ) {
        const { cursorFn, zoomLevel } = useStore.getState();
        if (!textAreaWrapper || !textArea || cursorFn !== CursorFn.Text) return;

        textAreaWrapper.style.left = `${this.lastMouseDownPosition[0] * zoomLevel}px`;
        textAreaWrapper.style.top = `${this.lastMouseDownPosition[1] * zoomLevel}px`;
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
        textArea?.blur();
        if (cursorFn !== CursorFn.Text) return null;
        const { currentText } = useStore.getState();
        if (currentText === "") return null;
        return {
            execute: () => {
                if (canvas === null) return;
                const ctx = canvas.getContext("2d");
                if (ctx === null) return;
                const { currentText, position } = useStore.getState();
                const normalizedPosition = normalizePos(position, this.lastMouseDownPosition);
                element = generateTextElement(ctx, currentText, normalizedPosition, {});

                const { setCurrentText, setIsWriting } = useStore.getState();
                this.isAlreadyElement = false;
                const { setElements } = useStore.getState();
                setElements((prev) => [...prev, element!]);
                setCurrentText("");
                setIsWriting(false);
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
