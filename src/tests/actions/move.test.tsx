import { render, screen } from "@testing-library/react";
import App from "components/App";
import { useStore } from "store";
import { Point } from "utils";
import { act } from "@testing-library/react";
import { CursorFn } from "types/general";
import {
    clickCursor,
    clickUndo,
    createElement,
    pointerDown,
    pointerMove,
    pointerUp,
} from "../testUtils";

const initialStoreState = useStore.getState();
describe("move elements", () => {
    const rectStartPos: Point = [200, 200];
    const rectEndPos: Point = [300, 300];
    const lineStartPos: Point = [100, 100];
    const lineEndPos: Point = [40, 40];

    const movement = [100, 100];
    beforeEach(async () => {
        useStore.setState(initialStoreState, true);
        render(<App />);
        const canvas = await screen.findByTestId<HTMLCanvasElement>("canvas");
        if (!canvas) throw new Error("canvas not found");
        act(() => useStore.setState({ width: 1000, height: 1000 }));

        createElement("rectangle", canvas, rectStartPos, rectEndPos);
        //and so on
        // todo add handdrawn when we have better threshold
        createElement("line", canvas, lineStartPos, lineEndPos);

        //todo add text element when its bounding rect is fixed
        await clickCursor(CursorFn.Default);
    });
    it("should move rect element", async () => {
        const canvas = await screen.findByTestId<HTMLCanvasElement>("canvas");
        if (!canvas) throw new Error("canvas not found");
        //move rect element
        pointerMove(canvas, [
            (rectStartPos[0] + rectEndPos[0]) / 2,
            (rectStartPos[0] + rectEndPos[0]) / 2,
        ]);
        pointerDown(canvas, [
            (rectStartPos[0] + rectEndPos[0]) / 2,
            (rectStartPos[0] + rectEndPos[0]) / 2,
        ]);
        pointerMove(canvas, [
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[0],
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[1],
        ]);
        pointerUp(canvas, [
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[0],
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[1],
        ]);
        const rect = useStore.getState().elements.find((e) => e.shape === "rectangle");
        expect(rect?.x).toEqual(rectStartPos[0] + movement[0]);
        expect(rect?.y).toEqual(rectStartPos[1] + movement[1]);
        expect(rect?.endX).toEqual(rectEndPos[0] + movement[0]);
        expect(rect?.endY).toEqual(rectEndPos[1] + movement[1]);
    });
    it("should move line element", async () => {
        const canvas = await screen.findByTestId<HTMLCanvasElement>("canvas");
        if (!canvas) throw new Error("canvas not found");
        //move rect element
        pointerMove(canvas, [
            (lineStartPos[0] + lineEndPos[0]) / 2,
            (lineStartPos[0] + lineEndPos[0]) / 2,
        ]);
        pointerDown(canvas, [
            (lineStartPos[0] + lineEndPos[0]) / 2,
            (lineStartPos[0] + lineEndPos[0]) / 2,
        ]);
        pointerMove(canvas, [
            (lineStartPos[0] + lineEndPos[0]) / 2 + movement[0],
            (lineStartPos[0] + lineEndPos[0]) / 2 + movement[1],
        ]);
        pointerUp(canvas, [
            (lineStartPos[0] + lineEndPos[0]) / 2 + movement[0],
            (lineStartPos[0] + lineEndPos[0]) / 2 + movement[1],
        ]);

        const line = useStore.getState().elements.find((e) => e.shape === "line");
        expect(line?.x).toEqual(lineEndPos[0] + movement[0]);
        expect(line?.y).toEqual(lineEndPos[1] + movement[1]);
        expect(line?.endX).toEqual(lineStartPos[0] + movement[0]);
        expect(line?.endY).toEqual(lineStartPos[1] + movement[1]);
    });
    it("shouldn't move an element if pointer isn't down", async () => {
        const canvas = await screen.findByTestId<HTMLCanvasElement>("canvas");
        if (!canvas) throw new Error("canvas not found");
        //move rect element

        pointerMove(canvas, [
            (rectStartPos[0] + rectEndPos[0]) / 2,
            (rectStartPos[0] + rectEndPos[0]) / 2,
        ]);

        pointerMove(canvas, [
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[0],
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[1],
        ]);
        pointerUp(canvas, [
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[0],
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[1],
        ]);
        const rect = useStore.getState().elements.find((e) => e.shape === "rectangle");
        expect(rect?.x).toEqual(rectStartPos[0]);
        expect(rect?.y).toEqual(rectStartPos[1]);
        expect(rect?.endX).toEqual(rectEndPos[0]);
        expect(rect?.endY).toEqual(rectEndPos[1]);
    });
    it("should be able to undo a move", async () => {
        const canvas = await screen.findByTestId<HTMLCanvasElement>("canvas");
        if (!canvas) throw new Error("canvas not found");
        //move rect element
        pointerMove(canvas, [
            (rectStartPos[0] + rectEndPos[0]) / 2,
            (rectStartPos[0] + rectEndPos[0]) / 2,
        ]);
        pointerDown(canvas, [
            (rectStartPos[0] + rectEndPos[0]) / 2,
            (rectStartPos[0] + rectEndPos[0]) / 2,
        ]);
        pointerMove(canvas, [
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[0],
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[1],
        ]);
        pointerUp(canvas, [
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[0],
            (rectStartPos[0] + rectEndPos[0]) / 2 + movement[1],
        ]);
        await clickUndo();
        const rect = useStore.getState().elements.find((e) => e.shape === "rectangle");
        expect(rect?.x).toEqual(rectStartPos[0]);
        expect(rect?.y).toEqual(rectStartPos[1]);
        expect(rect?.endX).toEqual(rectEndPos[0]);
        expect(rect?.endY).toEqual(rectEndPos[1]);
    });
});
