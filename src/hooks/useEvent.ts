import { useEffect } from "react";
import isClient from "utils/isClient";

export function useEvent<K extends keyof HTMLElementEventMap>(
    event: K,
    callback: (event: HTMLElementEventMap[K]) => void,
    element: HTMLElement | null,
    options?: AddEventListenerOptions | boolean
) {
    useEffect(() => {
        if (!isClient || !element) {
            return;
        }
        element.addEventListener(event, callback, options);
        return () => {
            element.removeEventListener(event, callback, options);
        };
    });
}
