import { useCallback } from "react";
import { useStore } from "store";
import { useGlobalEvent } from "./useGlobalEvent";
const { setIsMobile } = useStore.getState();
const useIsMobile = () => {
    const isMobileCallback = useCallback(() => {
        if (typeof window === "undefined") return false;
        if (window.innerWidth > 768) return false;
        setIsMobile(true);
    }, []);
    useGlobalEvent("resize", isMobileCallback);
    useGlobalEvent("orientationchange", isMobileCallback);
    useGlobalEvent("load", isMobileCallback);
};
export { useIsMobile };
