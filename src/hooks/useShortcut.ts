import { useEffect, useMemo, useRef } from "react";
const keysToCodes = {
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
    Shift: "Shift",
    Control: "Control",
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
type Keys = keyof typeof keysToCodes;
type KeyCodes = (typeof keysToCodes)[keyof typeof keysToCodes];
export default function useKeyboardShortcut(
    options: {
        element?: HTMLElement | Window;
        onShortcut: (...args: [KeyboardEvent, ...unknown[]]) => unknown;
        onRelease?: (...args: [KeyboardEvent, ...unknown[]]) => unknown;
        continueWhilePressed?: boolean;
    },
    ..._shortcutCombination: [Keys, ...Keys[]]
) {
    const shortcutCombination = useMemo(
        () => new Set<KeyCodes>(_shortcutCombination.map((key) => keysToCodes[key])),
        [_shortcutCombination]
    );
    const pressedKeys = useRef(new Set<KeyCodes>());
    useEffect(() => {
        const element = options.element ?? window;
        const handleKeydown = (e: KeyboardEvent) => {
            // if the target is an input or textarea, don't do anything (this is to prevent the shortcut from firing while typing)
            const target = e.target as HTMLElement;
            if (target.nodeName === "INPUT" || target.nodeName === "TEXTAREA") return;
            if (shortcutCombination.has(e.code as KeyCodes)) {
                pressedKeys.current.add(e.code as KeyCodes);
            }
            if (pressedKeys.current.size === shortcutCombination.size) {
                if (!options.continueWhilePressed) {
                    pressedKeys.current.clear();
                }
                options.onShortcut(e);
            }
        };
        const handleKeyup = (e: KeyboardEvent) => {
            if (shortcutCombination.has(e.code as KeyCodes)) {
                pressedKeys.current.delete(e.code as KeyCodes);
            }
        };
        // this check is purely for typescript's satisfaction
        if (element instanceof Window) {
            element.addEventListener("keydown", handleKeydown);
            element.addEventListener("keyup", handleKeyup);
        } else {
            element.addEventListener("keydown", handleKeydown);
            element.addEventListener("keyup", handleKeyup);
        }
        return () => {
            if (element instanceof Window) {
                element.removeEventListener("keydown", handleKeydown);
            } else {
                element.removeEventListener("keydown", handleKeydown);
            }
        };
    }, [options, shortcutCombination]);
}

export { keysToCodes };
