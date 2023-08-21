import { useEffect } from "react";
import isClient from "@/utils/isClient";

export function useGlobalEvent<K extends keyof WindowEventMap>(
    event: K,
    callback: (event: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions
) {
    useEffect(() => {
        if (!isClient) {
            return;
        }
        window.addEventListener(event, callback, options);
        return () => {
            window.removeEventListener(event, callback, options);
        };
    });
}
