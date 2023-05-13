import { describe, expect, it } from "vitest";
import { CommonConfigOptions, getElementsCommonConfig } from "utils";

describe.only("common config between elements", () => {
    it("one rect element", () => {
        const data = [
            {
                id: "vFLqWUH1xOsr6VM3wTBKA",
                shape: "rectangle",
                options: {
                    fill: "#A7A7A7",
                    fillStyle: "zigzag",
                    opacity: 1,
                    stroke: "#9b59b6",
                    strokeLineDash: [],
                    strokeWidth: 5,
                },
                opacity: 1,
            },
        ];
        const res: CommonConfigOptions = {
            cursorFn: undefined,
            fill: "#A7A7A7",
            fillStyle: "zigzag",
            font: undefined,
            fontSize: undefined,
            opacity: 1,
            stroke: "#9b59b6",
            strokeLineDash: [],
            strokeWidth: 5,
        };
        // @ts-ignore
        expect(getElementsCommonConfig(data)).toEqual(res);
    });
    it("one text element", () => {
        const data = [
            {
                id: "1nFu5p9GRfBsgE3SnGwFe",
                shape: "text",
                options: {
                    font: 2,
                    fontSize: 24,
                    opacity: 1,
                    stroke: "#9b59b6",
                    strokeLineDash: [],
                    strokeWidth: 5,
                },
                opacity: 1,
            },
        ];
        const res: CommonConfigOptions = {
            cursorFn: undefined,
            fill: undefined,
            fillStyle: undefined,
            font: 2,
            fontSize: 24,
            opacity: 1,
            stroke: "#9b59b6",
            strokeLineDash: [],
            strokeWidth: 5,
        };
        // @ts-ignore
        expect(getElementsCommonConfig(data)).toEqual(res);
    });
    it("same options with no conflict", () => {
        const data = [
            {
                id: "vFLqWUH1xOsr6VM3wTBKA",
                shape: "rectangle",
                options: {
                    fill: "#A7A7A7",
                    fillStyle: "zigzag",
                    opacity: 1,
                    stroke: "#9b59b6",
                    strokeLineDash: [],
                    strokeWidth: 5,
                },
                opacity: 1,
            },
            {
                id: "2fZgPEgDbiiaSApLbLWm-",
                shape: "line",
                options: {
                    fill: "#A7A7A7",
                    fillStyle: "zigzag",
                    opacity: 1,
                    stroke: "#9b59b6",
                    strokeLineDash: [],
                    strokeWidth: 5,
                },
                opacity: 1,
            },
        ];
        const res: CommonConfigOptions = {
            cursorFn: undefined,
            fill: "#A7A7A7",
            fillStyle: "zigzag",
            font: undefined,
            fontSize: undefined,
            opacity: 1,
            stroke: "#9b59b6",
            strokeLineDash: [],
            strokeWidth: 5,
        };
        // @ts-ignore
        expect(getElementsCommonConfig(data)).toEqual(res);
    });
    it("same elements with conflict", () => {
        const data = [
            {
                id: "vFLqWUH1xOsr6VM3wTBKA",
                shape: "rectangle",
                options: {
                    fill: "#A7A7A7",
                    fillStyle: "zigzag",
                    opacity: 0.5, // conflict
                    stroke: "#9b59b6",
                    strokeLineDash: [],
                    strokeWidth: 3, // conflict
                },
                opacity: 1,
            },
            {
                id: "2fZgPEgDbiiaSApLbLWm-",
                shape: "rectangle",
                options: {
                    fill: "#A7A7A7",
                    fillStyle: "dots", // conflict
                    opacity: 1,
                    stroke: "#9b59b6",
                    strokeLineDash: [],
                    strokeWidth: 5,
                },
                opacity: 1,
            },
        ];
        const res: CommonConfigOptions = {
            cursorFn: undefined,
            fill: "#A7A7A7",
            fillStyle: null, // conflict
            font: undefined,
            fontSize: undefined,
            opacity: null, // conflict
            stroke: "#9b59b6",
            strokeLineDash: [],
            strokeWidth: null, // conflict
        };
        // @ts-ignore
        expect(getElementsCommonConfig(data)).toEqual(res);
    });
    it("diff elements with diff options", () => {
        const data = [
            {
                id: "vFLqWUH1xOsr6VM3wTBKA",
                shape: "rectangle",
                options: {
                    fill: "#A7A7A7",
                    fillStyle: "zigzag",
                    opacity: 1,
                    stroke: "#9b59b6",
                    strokeLineDash: [],
                    strokeWidth: 3, // conflict
                },
                opacity: 1,
            },
            {
                id: "2fZgPEgDbiiaSApLbLWm-",
                shape: "line",
                options: {
                    fill: "#A7A7A7", // not shared
                    fillStyle: "dots", // conflict // not shared
                    opacity: 1,
                    stroke: "#9b59b6",
                    strokeLineDash: [5, 5], // conflict
                    strokeWidth: 5,
                },
                opacity: 1,
            },
            {
                id: "1nFu5p9GRfBsgE3SnGwFe",
                shape: "text",
                options: {
                    font: 2, // not shared
                    fontSize: 24, // not shared
                    opacity: 1,
                    stroke: "#9b59b6",
                    strokeLineDash: [5, 5], // conflict
                    strokeWidth: 5,
                },
                opacity: 1,
            },
        ];
        const res: CommonConfigOptions = {
            cursorFn: undefined,
            fill: undefined, // not shared
            fillStyle: undefined, // conflict
            font: undefined, // not shared
            fontSize: undefined, // not shared
            opacity: 1,
            stroke: "#9b59b6",
            strokeLineDash: null, // conflict
            strokeWidth: null, // conflict
        };
        // @ts-ignore
        expect(getElementsCommonConfig(data)).toEqual(res);
    });
});
