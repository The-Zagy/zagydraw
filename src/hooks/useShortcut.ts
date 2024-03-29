import { useEffect, useMemo, useRef } from "react";
import { keysToCodes, Keys, KeyCodes } from "@/constants/index";

export default function useKeyboardShortcut(
    options: {
        element?: HTMLElement | Window;
        onShortcut: (...args: [KeyboardEvent, ...unknown[]]) => unknown;
        onRelease?: (...args: [KeyboardEvent, ...unknown[]]) => unknown;
        continueWhilePressed?: boolean;
        orderMatters?: boolean;
    },
    ..._shortcutCombination: [Keys, ...Keys[]]
) {
    const shortcutCombinationSet = useMemo(
        () => new Set<KeyCodes>(_shortcutCombination.map((key) => keysToCodes[key])),
        [_shortcutCombination],
    );
    const shortcutCombinationSorted = useMemo(
        () => _shortcutCombination.map((key) => keysToCodes[key]),
        [_shortcutCombination],
    );
    const pressedKeysSet = useRef(new Set<KeyCodes>());
    const pressedKeysSorted = useRef<KeyCodes[]>([]);
    const alreadyExecuted = useRef(false);

    useEffect(() => {
        const element = options.element ?? window;
        const handleKeydown = (e: KeyboardEvent) => {
            // if the target is an input or textarea, don't do anything (this is to prevent the shortcut from firing while typing)
            const target = e.target as HTMLElement;
            if (target.nodeName === "INPUT" || target.nodeName === "TEXTAREA") return;
            if (options.orderMatters) {
                if (shortcutCombinationSorted[pressedKeysSorted.current.length] === e.code) {
                    pressedKeysSorted.current.push(e.code);
                }
                if (pressedKeysSorted.current.length === shortcutCombinationSorted.length) {
                    if (!options.continueWhilePressed) {
                        if (alreadyExecuted.current) {
                            return;
                        }
                        alreadyExecuted.current = true;
                    }
                    options.onShortcut(e);
                }
            } else {
                if (shortcutCombinationSet.has(e.code as KeyCodes)) {
                    pressedKeysSet.current.add(e.code as KeyCodes);
                }
                if (pressedKeysSet.current.size === shortcutCombinationSet.size) {
                    if (!options.continueWhilePressed) {
                        if (alreadyExecuted.current) {
                            return;
                        }
                        alreadyExecuted.current = true;
                    }
                    options.onShortcut(e);
                }
            }
        };
        const handleKeyup = (e: KeyboardEvent) => {
            alreadyExecuted.current = false;
            if (options.orderMatters) {
                const keyIndex = shortcutCombinationSorted.indexOf(e.code as KeyCodes);
                if (keyIndex === -1) return;
                pressedKeysSorted.current.splice(keyIndex);
            } else {
                if (shortcutCombinationSet.has(e.code as KeyCodes)) {
                    pressedKeysSet.current.delete(e.code as KeyCodes);
                }
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
    }, [options, shortcutCombinationSet, shortcutCombinationSorted]);
}

export { keysToCodes };
