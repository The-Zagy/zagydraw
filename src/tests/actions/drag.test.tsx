import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "components/App";
import { useStore } from "store";
import { act } from "react-dom/test-utils";
import { vi } from "vitest";

const initialStoreState = useStore.getState();
describe("dragging", () => {
    beforeEach(() => {
        useStore.setState(initialStoreState, true);
    });
    it("should be able to drag into the canvas", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        //set cursor to drag
        const dragCursor = await screen.findByTestId("drag-cursor");
        if (!dragCursor) throw new Error("drag cursor not found");
        act(() => fireEvent.click(dragCursor));
        const spy = vi.spyOn(useStore.getState(), "setPosition");
        act(() =>
            fireEvent.pointerDown(
                canvas,
                new PointerEvent("pointerdown", {
                    clientX: 200,
                    clientY: 200,
                })
            )
        );
        for (let i = 0; i <= 30; i++) {
            act(() =>
                fireEvent.pointerMove(
                    canvas,
                    new PointerEvent("pointermove", {
                        clientX: 200 + i,
                        clientY: 200 + i,
                    })
                )
            );
        }
        console.log(spy.mock.calls);
        await waitFor(() => {
            expect(useStore.getState().position).toEqual({ x: 30, y: 30 });
        });
    });
});
