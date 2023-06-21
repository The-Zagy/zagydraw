import { render, screen } from "@testing-library/react";

import App from "./ZagyDraw/ZagyDraw";

describe("<App />", () => {
    it("should render the App", () => {
        const { container } = render(<App />);
        expect(screen.getByTestId("canvas")).toBeInTheDocument();
        const upperToolbar = screen.getByRole("radiogroup");
        expect(upperToolbar).toBeInTheDocument();
        const child = upperToolbar.firstChild as HTMLDivElement;
        const buttons = child.children;
        expect(buttons.length).toBe(7);
        const undoButton = screen.getByTestId("undo-button");
        expect(undoButton).toBeInTheDocument();
        expect(container.firstChild).toBeInTheDocument();
    });
});
