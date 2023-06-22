import { fireEvent, screen } from "@testing-library/react";
import { ZagyCanvasElement } from "types/general";
import { Point } from "utils";

async function createElement(
    elementType: ZagyCanvasElement["shape"],
    canvas: HTMLCanvasElement,
    startPos: Point,
    endPos: Point
) {
    const cursorTestId: {
        [key in ZagyCanvasElement["shape"]]: string;
    } = {
        rectangle: "rect-cursor",
        handdrawn: "freedraw-cursor",
        line: "line-cursor",
        text: "text-cursor",
    };
    const cursor = await screen.findByTestId(cursorTestId[elementType]);
    if (!cursor) throw new Error("Cursor not found");
    fireEvent.click(cursor);
    fireEvent.pointerDown(
        canvas,
        new PointerEvent("pointerdown", {
            clientX: startPos[0],
            clientY: startPos[1],
        })
    );
    fireEvent.pointerMove(
        canvas,
        new PointerEvent("pointermove", {
            clientX: endPos[0],
            clientY: endPos[1],
        })
    );

    fireEvent.pointerUp(
        canvas,
        new PointerEvent("pointerup", {
            clientX: endPos[0],
            clientY: endPos[1],
        })
    );
}

export { createElement };
