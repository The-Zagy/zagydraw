import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "@testing-library/react";
import {
    clickCursor,
    createElement,
    createTextElement,
    pointerDown,
    pointerMove,
    pointerUp,
} from "../testUtils";
import App from "@/components/App";

import { useStore } from "@/store";
import { CursorFn } from "@/types/general";
import { Point, getBoundingRect } from "@/utils";

const initialStoreState = useStore.getState();
describe("import-export", () => {
    beforeEach(() => {
        useStore.setState(initialStoreState, true);
    });
    it("import should copy elements identically through clipboard", async () => {
        render(<App />);
        const user = userEvent.setup();
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        act(() => useStore.setState({ width: 1000, height: 1000 }));
        await createTextElement(canvas, user, "hello world", [60, 60]);
        await createElement("rectangle", canvas, [50, 50], [120, 120]);
        await createElement("handdrawn", canvas, [70, 70], [130, 130]);
        await createElement("line", canvas, [80, 80], [140, 140]);
        await clickCursor(CursorFn.Default);
        pointerDown(canvas, [210, 210]);
        pointerMove(canvas, [10, 10]);
        pointerUp(canvas, [10, 10]);
        const elements = [...useStore.getState().elements];
        useStore.getState().setElements(() => []);
        const boundingRect = getBoundingRect(...elements);
        const targetPosition = boundingRect[0];
        await user.keyboard("{Control>}c{/Control}");
        pointerMove(canvas, targetPosition as Point);
        await user.paste();
        for (const element of useStore.getState().elements) {
            const orginialElement = elements.find((e) => e.shape === element.shape);
            expect(orginialElement?.getOptions()).toEqual(element.getOptions());
        }
    });
    it("import should copy elements identically through file", async () => {
        render(<App />);
        const user = userEvent.setup();
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        act(() => useStore.setState({ width: 1000, height: 1000 }));
    });
});
