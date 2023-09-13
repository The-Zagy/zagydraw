import { fireEvent, render, screen } from "@testing-library/react";
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
        // because we paste the element under the curosor
        const halfWidth = Math.floor((boundingRect[1][0] - boundingRect[0][0]) / 2);
        const halfHeigt = Math.floor((boundingRect[1][1] - boundingRect[0][1]) / 2);
        const targetPosition = [boundingRect[0][0] + halfWidth, boundingRect[0][1] + halfHeigt];
        await user.keyboard("{Control>}c{/Control}");
        pointerMove(canvas, targetPosition as Point);
        await user.paste();
        for (const element of useStore.getState().elements) {
            const orginialElement = elements.find((e) => e.shape === element.shape);
            expect(orginialElement?.getOptions()).toEqual(element.getOptions());
        }
    });

    it("can paste image", async () => {
        render(<App />);
        // const user = userEvent.setup();
        const canvas = await screen.findByTestId("canvas");
        if (!canvas) throw new Error("canvas not found");
        act(() => useStore.setState({ width: 1000, height: 1000 }));
        const imgDataUrl =
            "data:image/jpeg;base64,/9j/4QDcRXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABwAAkAcABAAAADAyMTABkQcABAAAAAECAwCGkgcAFAAAAMAAAAAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAAAoAAAADoAQAAQAAAAoAAAAAAAAAQVNDSUkAAABQaWNzdW0gSUQ6IDH/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wgARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQME/8QAFAEBAAAAAAAAAAAAAAAAAAAAAv/aAAwDAQACEAMQAAABOlhFK//EABoQAAICAwAAAAAAAAAAAAAAAAABAwQCEyH/2gAIAQEAAQUCwqxJbYC7xn//xAAXEQEAAwAAAAAAAAAAAAAAAAABABEx/9oACAEDAQE/AVrJ/8QAFhEBAQEAAAAAAAAAAAAAAAAAAQAR/9oACAECAQE/ATG//8QAHRAAAQMFAQAAAAAAAAAAAAAAAQADEwIQEjJBQv/aAAgBAQAGPwJ1x/CLzGtAVSOW/8QAGxABAAICAwAAAAAAAAAAAAAAAQARIaExQVH/2gAIAQEAAT8h2TEN4lO496iQGqcEt9Z//9oADAMBAAIAAwAAABAn/8QAFhEBAQEAAAAAAAAAAAAAAAAAAQAR/9oACAEDAQE/EEeK/8QAFhEBAQEAAAAAAAAAAAAAAAAAAQAR/9oACAECAQE/ECGpf//EAB0QAQACAgIDAAAAAAAAAAAAAAEAESFRMUFhcfH/2gAIAQEAAT8QMQDlQxqXaYrJZ1AALjCxfk7RR3ZqN8e59yf/2Q==";
        const imgFile = new File([imgDataUrl], "img.png", {
            type: "image/png",
            lastModified: new Date().getTime(),
        });
        // const ds = new DataTransfer();
        // ds.items.add(imgFile);
        pointerDown(canvas, [10, 10]);
        pointerUp(canvas, [10, 10]);
        // const ds = await user.copy();
        // if (ds === undefined) expect(true).toBe(false);
        fireEvent.paste(document, {
            clipboardData: {
                items: [
                    {
                        kind: "file",
                        type: "image/png",
                        getAsFile() {
                            return imgFile;
                        },
                    },
                ],
            },
        });
        expect(useStore.getState().elements.length).toBe(1);
    });
});
