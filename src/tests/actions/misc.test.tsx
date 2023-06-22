import { fireEvent, render, screen } from "@testing-library/react";
import App from "components/App";
import { useStore } from "store";

const initialStoreState = useStore.getState();
describe("misc", () => {
    beforeEach(() => {
        useStore.setState(initialStoreState, true);
    });
    it("pointerdown event should set isMouseDown to true when down and to false when up", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");

        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: 200,
                clientY: 200,
            })
        );

        expect(useStore.getState().isMouseDown).toBe(true);

        fireEvent.pointerUp(
            canvas,
            new PointerEvent("pointerup", {
                clientX: 200,
                clientY: 200,
            })
        );

        expect(useStore.getState().isMouseDown).toBe(false);
    });
    it("Clicking on any cursor button should transform the cursor to it's corresponding cursor style", async () => {
        const { baseElement } = render(<App />);
        const body = baseElement;
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        const defaultCursor = await screen.findByTestId("default-cursor");
        if (!defaultCursor) throw new Error("drag cursor not found");
        fireEvent.click(defaultCursor);
        expect(body.style.cursor).toBe("default");

        const dragCursor = await screen.findByTestId("drag-cursor");
        if (!dragCursor) throw new Error("drag cursor not found");
        fireEvent.click(dragCursor);
        expect(body.style.cursor).toBe("grab");

        const freedrawCursor = await screen.findByTestId("freedraw-cursor");
        if (!freedrawCursor) throw new Error("drag cursor not found");
        fireEvent.click(freedrawCursor);
        expect(body.style.cursor).toBe("crosshair");

        const eraserCursor = await screen.findByTestId("erase-cursor");
        if (!eraserCursor) throw new Error("drag cursor not found");
        fireEvent.click(eraserCursor);
        expect(body.style.cursor).toBe("crosshair");

        const lineCursor = await screen.findByTestId("line-cursor");
        if (!lineCursor) throw new Error("drag cursor not found");
        fireEvent.click(lineCursor);
        expect(body.style.cursor).toBe("crosshair");

        const rectCursor = await screen.findByTestId("rect-cursor");
        if (!rectCursor) throw new Error("drag cursor not found");
        fireEvent.click(rectCursor);
        expect(body.style.cursor).toBe("crosshair");

        const textCursor = await screen.findByTestId("text-cursor");
        if (!textCursor) throw new Error("drag cursor not found");
        fireEvent.click(textCursor);
        expect(body.style.cursor).toBe("text");
    });
});
