import { useGlobalEvent } from "./useGlobalEvent";

export function usePreventDefaultZoom() {
    useGlobalEvent(
        "wheel",
        (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        },
        { passive: false },
    );
}
