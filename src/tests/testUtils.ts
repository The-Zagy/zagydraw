import { fireEvent, screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { CursorFn, ZagyCanvasElement } from "@/types/general";
import { Point } from "@/utils";
const cursorToTestId = {
    [CursorFn.Default]: "default-cursor",
    [CursorFn.Move]: "move-cursor",
    [CursorFn.Rect]: "rect-cursor",
    [CursorFn.FreeDraw]: "freedraw-cursor",
    [CursorFn.Line]: "line-cursor",
    [CursorFn.Text]: "text-cursor",
    [CursorFn.Erase]: "erase-cursor",
    [CursorFn.Drag]: "drag-cursor",
} as const;

const clickCursor = async (cursor: CursorFn) => {
    const cursorTestId = cursorToTestId[cursor];
    const cursorElement = await screen.findByTestId(cursorTestId);
    fireEvent.click(cursorElement);
};

async function createElement(
    elementType: ZagyCanvasElement["shape"],
    canvas: HTMLElement,
    startPos: Point,
    endPos: Point,
) {
    const cursorTestId: {
        [key in ZagyCanvasElement["shape"]]: CursorFn;
    } = {
        rectangle: CursorFn.Rect,
        handdrawn: CursorFn.FreeDraw,
        line: CursorFn.Line,
        text: CursorFn.Text,
        image: CursorFn.Default,
    };
    await clickCursor(cursorTestId[elementType]);
    fireEvent.pointerDown(
        canvas,
        new PointerEvent("pointerdown", {
            clientX: startPos[0],
            clientY: startPos[1],
        }),
    );
    fireEvent.pointerMove(
        canvas,
        new PointerEvent("pointermove", {
            clientX: endPos[0],
            clientY: endPos[1],
        }),
    );

    fireEvent.pointerUp(
        canvas,
        new PointerEvent("pointerup", {
            clientX: endPos[0],
            clientY: endPos[1],
        }),
    );
}
const createTextElement = async (
    canvas: HTMLElement,
    user: UserEvent,
    text: string,
    pos: Point,
) => {
    await clickCursor(CursorFn.Text);
    pointerDown(canvas, pos);
    pointerUp(canvas);
    await user.keyboard(text);
    await user.keyboard("[Escape]");
};
const clickUndo = async () => {
    const undoButton = await screen.findByTestId("undo-button");
    return fireEvent.click(undoButton);
};
const pointerDown = (element: HTMLElement, coords: Point) => {
    return fireEvent.pointerDown(
        element,
        new PointerEvent("pointerdown", {
            clientX: coords[0],
            clientY: coords[1],
        }),
    );
};
const pointerMove = (element: HTMLElement, coords: Point) => {
    return fireEvent.pointerMove(
        element,
        new PointerEvent("pointermove", {
            clientX: coords[0],
            clientY: coords[1],
        }),
    );
};
const pointerUp = (element: HTMLElement, coords?: Point) => {
    if (!coords) return fireEvent.pointerUp(element, new PointerEvent("pointerup"));
    return fireEvent.pointerUp(
        element,
        new PointerEvent("pointerup", {
            clientX: coords[0],
            clientY: coords[1],
        }),
    );
};
export {
    createElement,
    clickCursor,
    clickUndo,
    pointerDown,
    pointerMove,
    pointerUp,
    createTextElement,
};
