import { fireEvent, render } from "@testing-library/react";
import App from "@/components/App";
import { useStore } from "@/store";
import { clickCursor } from "@/tests/testUtils";
import { CursorFn } from "@/types/general";

const initialStoreState = useStore.getState();
describe("ToolbarUpper", () => {
    beforeEach(() => {
        useStore.setState(initialStoreState, true);
    });
    it("Clicking on any cursor button should transform the cursor to it's corresponding cursor style", async () => {
        const { baseElement } = render(<App />);
        const body = baseElement;
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
    it("Shortcuts should transform the cursor to it's corresponding cursor style and function", async () => {
        const { baseElement } = render(<App />);
        const body = baseElement;

        fireEvent.keyDown(window, { key: "1", code: "Digit1" });
        let cursorFn = useStore.getState().cursorFn;
        expect(body.style.cursor).toBe("default");
        expect(cursorFn).toBe(CursorFn.Default);
        fireEvent.keyDown(window, { key: "2", code: "Digit2" });
        cursorFn = useStore.getState().cursorFn;
        expect(body.style.cursor).toBe("grab");
        expect(cursorFn).toBe(CursorFn.Drag);
        fireEvent.keyDown(window, { key: "3", code: "Digit3" });
        cursorFn = useStore.getState().cursorFn;
        expect(body.style.cursor).toBe("crosshair");
        expect(cursorFn).toBe(CursorFn.FreeDraw);
        fireEvent.keyDown(window, { key: "4", code: "Digit4" });
        cursorFn = useStore.getState().cursorFn;
        expect(body.style.cursor).toBe("crosshair");
        expect(cursorFn).toBe(CursorFn.Rect);
        fireEvent.keyDown(window, { key: "5", code: "Digit5" });
        cursorFn = useStore.getState().cursorFn;
        expect(body.style.cursor).toBe("crosshair");
        expect(cursorFn).toBe(CursorFn.Line);
        fireEvent.keyDown(window, { key: "6", code: "Digit6" });
        cursorFn = useStore.getState().cursorFn;
        expect(body.style.cursor).toBe("text");
        expect(cursorFn).toBe(CursorFn.Text);
        fireEvent.keyDown(window, { key: "7", code: "Digit7" });
        cursorFn = useStore.getState().cursorFn;
        expect(body.style.cursor).toBe("crosshair");
        expect(cursorFn).toBe(CursorFn.Erase);
    });
});
