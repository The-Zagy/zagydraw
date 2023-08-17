import { render, screen } from "@testing-library/react";
import App from "@/components/App";
import { useStore } from "@/store";
import { clickCursor, pointerDown, pointerMove, pointerUp } from "@/tests/testUtils";
import { CursorFn } from "@/types/general";

const initialStoreState = useStore.getState();
describe("dragging", () => {
    beforeEach(() => {
        useStore.setState(initialStoreState, true);
    });
    it("should be able to drag into the canvas", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        await clickCursor(CursorFn.Drag);
        pointerDown(canvas, [200, 200]);
        for (let i = 0; i <= 30; i++) {
            pointerMove(canvas, [200 + i, 200 + i]);
        }

        expect(useStore.getState().position).toEqual({ x: 30, y: 30 });
    });
    it("shouldn't be able to drag if cursor function isn't currently drag", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        await clickCursor(CursorFn.Default);
        pointerDown(canvas, [200, 200]);
        pointerMove(canvas, [300, 300]);
        expect(useStore.getState().position).toEqual({ x: 0, y: 0 });
    });

    it("shouldn't be able to drag if pointer isn't down", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        await clickCursor(CursorFn.Drag);
        pointerDown(canvas, [200, 200]);
        pointerUp(canvas, [200, 200]);
        expect(useStore.getState().isMouseDown).toEqual(false);
        for (let i = 0; i <= 30; i++) {
            pointerMove(canvas, [200 + i, 200 + i]);
        }
        expect(useStore.getState().position).toEqual({ x: 0, y: 0 });
    });
});
