import { fireEvent, render, screen } from "@testing-library/react";
import App from "components/App";
import { useStore } from "store";
import { createElement } from "./testUtils";
import { Point } from "utils";
import { act } from "@testing-library/react";

const initialStoreState = useStore.getState();
initialStoreState.width = 1000;
initialStoreState.height = 1000;
describe("delete elements with cursor", () => {
    const deleteStartPos: Point = [100, 100];
    const deleteEndPos: Point = [300, 300];
    const elementStartPos: Point = [deleteEndPos[0], deleteStartPos[1]];
    const elementEndPos: Point = [deleteStartPos[0], deleteEndPos[1]];
    beforeEach(async () => {
        useStore.setState(initialStoreState, true);
        render(<App />);
        const canvas = await screen.findByTestId<HTMLCanvasElement>("canvas");
        if (!canvas) throw new Error("canvas not found");
        await act(() => useStore.setState({ width: 1000, height: 1000 }));

        //create rect in delete way
        const offset = 10;

        createElement("rectangle", canvas, deleteStartPos, [
            deleteEndPos[0] / 2,
            deleteEndPos[1] / 2,
        ]);
        //create rect not in delete way
        createElement("rectangle", canvas, [800, 800], [1000, 1000]);
        //and so on
        // todo add handdrawn when we have better threshold
        // createElement(
        //     "handdrawn",
        //     canvas,
        //     [elementStartPos[0] + offset, elementStartPos[0] + offset],
        //     [elementStartPos[0] + offset, elementStartPos[0] + offset]
        // );
        // offset += 10;
        createElement(
            "line",
            canvas,
            [elementStartPos[0] + offset, elementStartPos[0] + offset],
            [elementEndPos[0] + offset, elementEndPos[0] + offset]
        );

        //todo add text element when its bounding rect is fixed
        const deleteCursor = await screen.findByTestId("erase-cursor");
        if (!deleteCursor) throw new Error("drag cursor not found");
        fireEvent.click(deleteCursor);
    });
    it("should mark the items hit as willDelete", async () => {
        const canvas = await screen.findByTestId<HTMLCanvasElement>("canvas");
        if (!canvas) throw new Error("canvas not found");
        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: deleteStartPos[0],
                clientY: deleteStartPos[1],
            })
        );
        for (let i = 0; i < deleteEndPos[0]; i += 0.5) {
            fireEvent.pointerMove(
                canvas,
                new PointerEvent("pointermove", {
                    clientX: deleteStartPos[0] + i,
                    clientY: deleteStartPos[1] + i,
                })
            );
        }
        const willBeDeletedCount = useStore
            .getState()
            .visibleElements.filter((item) => item.willDelete).length;
        expect(willBeDeletedCount).toBe(2);
    });
    it("should delete the items on pointerup", async () => {
        const canvas = await screen.findByTestId<HTMLCanvasElement>("canvas");
        if (!canvas) throw new Error("canvas not found");
        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: deleteStartPos[0],
                clientY: deleteStartPos[1],
            })
        );
        for (let i = 0; i < deleteEndPos[0]; i += 0.5) {
            fireEvent.pointerMove(
                canvas,
                new PointerEvent("pointermove", {
                    clientX: deleteStartPos[0] + i,
                    clientY: deleteStartPos[1] + i,
                })
            );
        }
        fireEvent.pointerUp(canvas, new PointerEvent("pointerup"));
        expect(useStore.getState().elements.length).toBe(1);
    });

    it("should be able to undo deletion action upon clicking on undo", async () => {
        const canvas = await screen.findByTestId<HTMLCanvasElement>("canvas");
        if (!canvas) throw new Error("canvas not found");
        fireEvent.pointerDown(
            canvas,
            new PointerEvent("pointerdown", {
                clientX: deleteStartPos[0],
                clientY: deleteStartPos[1],
            })
        );
        for (let i = 0; i < deleteEndPos[0]; i += 0.5) {
            fireEvent.pointerMove(
                canvas,
                new PointerEvent("pointermove", {
                    clientX: deleteStartPos[0] + i,
                    clientY: deleteStartPos[1] + i,
                })
            );
        }
        fireEvent.pointerUp(canvas, new PointerEvent("pointerup"));
        const undoButton = await screen.findByTestId("undo-button");
        if (!undoButton) throw new Error("undo button not found");
        fireEvent.click(undoButton);
        expect(useStore.getState().elements.length).toBe(3);
    });
});
