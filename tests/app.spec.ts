import { test, expect } from "@playwright/test";
test.describe("everything is in place", () => {
    test("has title", async ({ page }) => {
        await page.goto("/");
        // Expect a title "to contain" a substring.
        await expect(page).toHaveTitle(/Zagydraw | The whiteboarding app/);
    });

    test.describe("toolbar", () => {
        test("toolbar visible", async ({ page }) => {
            await page.goto("/");
            const toolbar = page.locator("#upper-toolbar");
            await expect(toolbar).toBeVisible();
        });

        test("toolbar has buttons", async ({ page }) => {
            await page.goto("/");
            const toolbar = page.locator("#upper-toolbar");
            await toolbar.waitFor({ state: "visible" });
            const buttons = toolbar.getByRole("radio");
            expect(buttons).toHaveCount(7);
        });
    });
    test.describe("upper toolbar buttons", () => {
        test("buttons change to their corresponding cursor when clicking on them", async ({
            page,
        }) => {
            await page.goto("/");
            const defaultButton = page.locator("#default-button");
            await defaultButton.waitFor({ state: "visible" });
            await defaultButton.click();
            const body = page.locator("body");
            expect(body).toHaveAttribute("style", "cursor: default;");
            const dragButton = page.locator("#drag-button");
            await dragButton.waitFor({ state: "visible" });
            await dragButton.click();
            expect(body).toHaveAttribute("style", "cursor: grab;");
            const rectButton = page.locator("#rect-button");
            await rectButton.waitFor({ state: "visible" });
            await rectButton.click();
            expect(body).toHaveAttribute("style", "cursor: crosshair;");
            const lineButton = page.locator("#line-button");
            await lineButton.waitFor({ state: "visible" });
            await lineButton.click();
            expect(body).toHaveAttribute("style", "cursor: crosshair;");
            const freeDrawButton = page.locator("#free-draw-button");
            await freeDrawButton.waitFor({ state: "visible" });
            await freeDrawButton.click();
            expect(body).toHaveAttribute("style", "cursor: crosshair;");
            const textButton = page.locator("#text-button");
            await textButton.waitFor({ state: "visible" });
            await textButton.click();
            expect(body).toHaveAttribute("style", "cursor: text;");
            const eraseButton = page.locator("#erase-button");
            await eraseButton.waitFor({ state: "visible" });
            await eraseButton.click();
            expect(body).toHaveAttribute("style", "cursor: crosshair;");
        });
    });
    test("has undo button", async ({ page }) => {
        await page.goto("/");
        const undoButton = page.locator("#undo-button");
        await expect(undoButton).toBeVisible();
    });
    test("has canvas", async ({ page }) => {
        await page.goto("/");
        const canvas = page.locator("canvas");
        await expect(canvas).toBeVisible();
    });

    test("has left toolbar", async ({ page }) => {
        await page.goto("/");
        const leftToolbar = page.locator("#left-toolbar");
        await expect(leftToolbar).toBeVisible();
    });
});
