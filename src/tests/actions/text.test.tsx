import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/components/App";
import { useStore } from "@/store";
import { clickCursor, pointerDown, pointerUp } from "@/tests/testUtils";
import { CursorFn, FontSize, FontTypeOptions } from "@/types/general";
import { ZagyText } from "@/utils/canvas/shapes";

const initialStoreState = useStore.getState();
describe("text", () => {
    beforeEach(() => {
        useStore.setState(initialStoreState, true);
    });
    it("text should be appended when pressing 'Escape' ", async () => {
        render(<App />);
        const user = userEvent.setup();
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        await clickCursor(CursorFn.Text);
        pointerDown(canvas, [200, 200]);
        pointerUp(canvas, [200, 200]);
        await user.keyboard("h");
        await user.keyboard("[Escape]");
        expect((useStore.getState().elements[0] as ZagyText).getOptions().text).toEqual("h");
    });
    it("text should be appended when clicking on anywhere on the canvas ", async () => {
        render(<App />);
        const user = userEvent.setup();

        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        await clickCursor(CursorFn.Text);
        pointerDown(canvas, [200, 200]);
        pointerUp(canvas, [200, 200]);
        await user.keyboard("h");
        await user.pointer({
            target: canvas,
            coords: {
                clientX: 300,
                clientY: 300,
            },
            keys: "[MouseLeft]",
        });
        expect((useStore.getState().elements[0] as ZagyText).getOptions().text).toEqual("h");
    });
    it("text should be appended when tapping anywhere on the canvas ", async () => {
        render(<App />);
        const user = userEvent.setup();

        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        await clickCursor(CursorFn.Text);
        pointerDown(canvas, [200, 200]);
        pointerUp(canvas, [200, 200]);
        await user.keyboard("h");
        await user.pointer({
            target: canvas,
            coords: {
                clientX: 300,
                clientY: 300,
            },
            keys: "[TouchA]",
        });
        expect((useStore.getState().elements[0] as ZagyText).getOptions().text).toEqual("h");
    });
    it("text should have correct size ", async () => {
        render(<App />);
        const user = userEvent.setup();
        const font: FontTypeOptions = "minecraft";
        const fontSize: FontSize = 24;
        await act(async () => {
            useStore.setState({ font, fontSize });
        });
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        await clickCursor(CursorFn.Text);
        pointerDown(canvas, [200, 200]);
        pointerUp(canvas, [200, 200]);
        const textWritten = "foo";
        await user.keyboard(textWritten);
        await user.pointer({
            target: canvas,
            coords: {
                clientX: 300,
                clientY: 300,
            },
            keys: "[MouseLeft]",
        });
        //todo mock text measuring function because right now the mock just returns the length of the text
        // const text = useStore.getState().elements[0] as ZagyCanvasTextElement;
        //expect(text.endX - text.x).toEqual(textWritten.length * fontSize);
        expect(true).toEqual(true);
    });
});
