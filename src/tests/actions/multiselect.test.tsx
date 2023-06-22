import { fireEvent, render, screen } from "@testing-library/react";
import App from "components/App";
import { act } from "react-dom/test-utils";
import { useStore } from "store";

const initialStoreState = useStore.getState();
describe("multi selection", () => {
    beforeEach(() => {
        useStore.setState(initialStoreState, true);
    });
    it("should create a selection rect that is visible to the user", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");

        const defaultCursor = await screen.findByTestId("default-cursor");
        if (!defaultCursor) throw new Error("drag cursor not found");
        fireEvent.click(defaultCursor);

        const pointerDownPos = [300, 300];
        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: pointerDownPos[0],
                clientY: pointerDownPos[1],
            })
        );
        const movement = [100, 100];
        const endPos = [pointerDownPos[0] + movement[0], pointerDownPos[1] + movement[1]];
        fireEvent.pointerMove(
            canvas,
            new PointerEvent("pointermove", {
                clientX: endPos[0],
                clientY: endPos[1],
            })
        );

        expect(useStore.getState().multiSelectRect?.x).toEqual(pointerDownPos[0]);
        expect(useStore.getState().multiSelectRect?.y).toEqual(pointerDownPos[1]);
        expect(useStore.getState().multiSelectRect?.endX).toEqual(endPos[0]);
        expect(useStore.getState().multiSelectRect?.endY).toEqual(endPos[1]);
    });
    it("should disappear when on pointerup", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");

        const defaultCursor = await screen.findByTestId("default-cursor");
        if (!defaultCursor) throw new Error("drag cursor not found");
        fireEvent.click(defaultCursor);

        const pointerDownPos = [300, 300];
        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: pointerDownPos[0],
                clientY: pointerDownPos[1],
            })
        );
        const movement = [100, 100];
        const endPos = [pointerDownPos[0] + movement[0], pointerDownPos[1] + movement[1]];
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

        expect(useStore.getState().multiSelectRect).toBeNull();
    });

    it("should select elements within this rect", async () => {
        render(<App />);
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        // set screen size
        //todo maybe add this to some kind of test utils
        act(() => useStore.setState({ width: 1000, height: 1000 }));
        const pointerDownPos = [300, 300];
        const movement = [200, 200];
        const endPos = [pointerDownPos[0] + movement[0], pointerDownPos[1] + movement[1]];
        const rectCursor = await screen.findByTestId("rect-cursor");
        if (!rectCursor) throw new Error("rect cursor not found");
        fireEvent.click(rectCursor);
        //create selectable rect element
        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: pointerDownPos[0] + 50,
                clientY: pointerDownPos[1] + 50,
            })
        );
        fireEvent.pointerMove(
            canvas,
            new PointerEvent("pointermove", {
                clientX: endPos[0] - 50,
                clientY: endPos[1] - 50,
            })
        );
        fireEvent.pointerUp(
            canvas,
            new PointerEvent("pointerup", {
                clientX: endPos[0] - 50,
                clientY: endPos[1] - 50,
            })
        );
        // create unselectable rect element
        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: pointerDownPos[0] + 50,
                clientY: pointerDownPos[1] + 50,
            })
        );
        fireEvent.pointerMove(
            canvas,
            new PointerEvent("pointermove", {
                clientX: pointerDownPos[0] - 150,
                clientY: pointerDownPos[1] - 150,
            })
        );
        fireEvent.pointerUp(
            canvas,
            new PointerEvent("pointerup", {
                clientX: pointerDownPos[0] - 150,
                clientY: pointerDownPos[1] - 150,
            })
        );
        //create handdrawn element
        const freedrawCursor = await screen.findByTestId("freedraw-cursor");
        if (!freedrawCursor) throw new Error("freedraw cursor not found");
        fireEvent.click(freedrawCursor);
        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: pointerDownPos[0] + 50,
                clientY: pointerDownPos[1] + 50,
            })
        );
        fireEvent.pointerMove(
            canvas,
            new PointerEvent("pointermove", {
                clientX: endPos[0] - 50,
                clientY: endPos[1] - 50,
            })
        );
        fireEvent.pointerUp(
            canvas,
            new PointerEvent("pointerup", {
                clientX: endPos[0] - 50,
                clientY: endPos[1] - 50,
            })
        );

        //create line
        const lineCursor = await screen.findByTestId("line-cursor");
        if (!lineCursor) throw new Error("line cursor not found");
        fireEvent.click(lineCursor);
        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: pointerDownPos[0] + 50,
                clientY: pointerDownPos[1] + 50,
            })
        );
        fireEvent.pointerMove(
            canvas,
            new PointerEvent("pointermove", {
                clientX: endPos[0] - 50,
                clientY: endPos[1] - 50,
            })
        );
        fireEvent.pointerUp(
            canvas,
            new PointerEvent("pointerup", {
                clientX: endPos[0] - 50,
                clientY: endPos[1] - 50,
            })
        );
        //todo add text element when its bounding rect is fixed
        const defaultCursor = await screen.findByTestId("default-cursor");
        if (!defaultCursor) throw new Error("drag cursor not found");
        fireEvent.click(defaultCursor);

        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: pointerDownPos[0],
                clientY: pointerDownPos[1],
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

        expect(useStore.getState().selectedElements.length).toBe(3);
    });
});
