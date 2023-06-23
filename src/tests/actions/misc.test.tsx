import { render, screen } from "@testing-library/react";
import App from "components/App";
import { useStore } from "store";
import { clickCursor, pointerDown, pointerUp } from "tests/testUtils";
import { CursorFn } from "types/general";
const initialStoreState = useStore.getState();
describe("misc", () => {
    beforeEach(() => {
        useStore.setState(initialStoreState, true);
    });
    it("pointerdown event should set isMouseDown to true when down and to false when up", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        pointerDown(canvas, [200, 200]);
        expect(useStore.getState().isMouseDown).toBe(true);
        pointerUp(canvas, [200, 200]);
        expect(useStore.getState().isMouseDown).toBe(false);
    });
    it("Clicking on any cursor button should transform the cursor to it's corresponding cursor style", async () => {
        const { baseElement } = render(<App />);
        const body = baseElement;
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        await clickCursor(CursorFn.Default);
        expect(body.style.cursor).toBe("default");
        await clickCursor(CursorFn.Drag);
        expect(body.style.cursor).toBe("grab");
        await clickCursor(CursorFn.FreeDraw);
        expect(body.style.cursor).toBe("crosshair");
        await clickCursor(CursorFn.Erase);
        expect(body.style.cursor).toBe("crosshair");
        await clickCursor(CursorFn.Line);
        expect(body.style.cursor).toBe("crosshair");
        await clickCursor(CursorFn.Rect);
        expect(body.style.cursor).toBe("crosshair");
        await clickCursor(CursorFn.Text);
        expect(body.style.cursor).toBe("text");
    });
});
