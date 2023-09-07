const CELL_SIZE = 20;
const CACHE_CANVAS_SIZE_THRESHOLD = 10;

const PREVIEW_IMAGE_WIDTH = 200;
const PREVIEW_IMAGE_HEIGHT = 200;

export { CELL_SIZE, CACHE_CANVAS_SIZE_THRESHOLD, PREVIEW_IMAGE_WIDTH, PREVIEW_IMAGE_HEIGHT };

export const keysToCodes = {
    Enter: "Enter",
    Escape: "Escape",
    ArrowUp: "ArrowUp",
    ArrowDown: "ArrowDown",
    ArrowLeft: "ArrowLeft",
    ArrowRight: "ArrowRight",
    Tab: "Tab",
    Home: "Home",
    End: "End",
    PageUp: "PageUp",
    PageDown: "PageDown",
    Backspace: "Backspace",
    Delete: "Delete",
    Space: "Space",
    ShiftLeft: "ShiftLeft",
    ShiftRight: "ShiftRight",
    ControlLeft: "ControlLeft",
    ControlRight: "ControlRight",
    AltLeft: "AltLeft",
    AltRight: "AltRight",
    Meta: "Meta",
    a: "KeyA",
    b: "KeyB",
    c: "KeyC",
    d: "KeyD",
    e: "KeyE",
    f: "KeyF",
    g: "KeyG",
    h: "KeyH",
    i: "KeyI",
    j: "KeyJ",
    k: "KeyK",
    l: "KeyL",
    m: "KeyM",
    n: "KeyN",
    o: "KeyO",
    p: "KeyP",
    q: "KeyQ",
    r: "KeyR",
    s: "KeyS",
    t: "KeyT",
    u: "KeyU",
    v: "KeyV",
    w: "KeyW",
    x: "KeyX",
    y: "KeyY",
    z: "KeyZ",
    "0": "Digit0",
    "1": "Digit1",
    "2": "Digit2",
    "3": "Digit3",
    "4": "Digit4",
    "5": "Digit5",
    "6": "Digit6",
    "7": "Digit7",
    "8": "Digit8",
    "9": "Digit9",
    "`": "Backquote",
    NumpadSubtract: "NumpadSubtract",
    "-": "Minus",
    "=": "Equal",
    "[": "BracketLeft",
    "]": "BracketRight",
    "\\": "Backslash",
    "'": "Quote",
    ",": "Comma",
    ".": "Period",
    "/": "Slash",
    ";": "Semicolon",
    NumpadMultiply: "NumpadMultiply",
    NumpadAdd: "NumpadAdd",
} as const;
export type Keys = keyof typeof keysToCodes;
export type KeyCodes = (typeof keysToCodes)[keyof typeof keysToCodes];

/**
 * {
 * group: {name: {description, keys}}
 * }
 */
export const SHORTCUTS = {
    editor: {
        copy: { description: "copy selected", keys: ["ControlLeft", "c"] },
        paste: { description: "paste into the canvas", keys: ["ControlLeft", "v"] },
        undo: { description: "undo", keys: ["ControlLeft", "z"] },
        delete: { description: "delete selected", keys: ["Delete"] },
    },
    tools: {
        select: { description: "select", keys: ["1"] },
        hand: { description: "hand(move in the canvas)", keys: ["2"] },
        pen: { description: "create free hand draw", keys: ["3"] },
        rect: { description: "create rect", keys: ["4"] },
        line: { description: "create line", keys: ["5"] },
        text: { description: "create text", keys: ["6"] },
        erase: { description: "erase", keys: ["7"] },
    },
} as const satisfies {
    [g: string]: { [k: string]: { description: string; keys: readonly [Keys, ...Keys[]] } };
};
