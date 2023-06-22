import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "components/App";
import { useStore } from "store";

const initialStoreState = useStore.getState();
describe("dragging", () => {
    beforeEach(() => {
        useStore.setState(initialStoreState, true);
    });
    it("should be able to drag into the canvas", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");

        const dragCursor = await screen.findByTestId("drag-cursor");
        if (!dragCursor) throw new Error("drag cursor not found");
        fireEvent.click(dragCursor);

        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: 200,
                clientY: 200,
            })
        );

        for (let i = 0; i <= 30; i++) {
            fireEvent.pointerMove(
                canvas,
                new PointerEvent("pointermove", {
                    clientX: 200 + i,
                    clientY: 200 + i,
                })
            );
        }

        await waitFor(() => {
            expect(useStore.getState().position).toEqual({ x: 30, y: 30 });
        });
    });
    it("shouldn't be able to drag if cursor function isn't currently drag", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        const defaultCursor = await screen.findByTestId("default-cursor");
        if (!defaultCursor) throw new Error("drag cursor not found");
        fireEvent.click(defaultCursor);

        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: 200,
                clientY: 200,
            })
        );

        fireEvent.pointerMove(
            canvas,
            new PointerEvent("pointermove", {
                clientX: 200 + 100,
                clientY: 200 + 100,
            })
        );

        expect(useStore.getState().position).toEqual({ x: 0, y: 0 });
    });

    it("shouldn't be able to drag if pointer isn't down", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        const dragCursor = await screen.findByTestId("drag-cursor");
        if (!dragCursor) throw new Error("drag cursor not found");
        fireEvent.click(dragCursor);
        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: 200,
                clientY: 200,
            })
        );
        fireEvent.pointerUp(
            canvas,
            new PointerEvent("pointerup", {
                clientX: 200,
                clientY: 200,
            })
        );

        expect(useStore.getState().isMouseDown).toEqual(false);

        for (let i = 0; i <= 30; i++) {
            fireEvent.pointerMove(
                canvas,
                new PointerEvent("pointermove", {
                    clientX: 200 + i,
                    clientY: 200 + i,
                })
            );
        }

        expect(useStore.getState().position).toEqual({ x: 0, y: 0 });
    });
});
