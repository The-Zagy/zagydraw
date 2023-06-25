import { render, screen } from "@testing-library/react";
import App from "components/App";
import { useStore } from "store";
import { pointerDown, pointerUp } from "tests/testUtils";

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
});
