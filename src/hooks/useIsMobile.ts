import { useCallback, useEffect } from "react";
import { useStore } from "store";
import { useGlobalEvent } from "./useGlobalEvent";
const { setIsMobile } = useStore.getState();
const useIsMobile = () => {
    const isMobileCallback = useCallback(() => {
        if (window.innerWidth > 768) {
            setIsMobile(false);
            return false;
        }
        setIsMobile(true);
    }, []);
    useEffect(() => {
        isMobileCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useGlobalEvent("resize", isMobileCallback);
    useGlobalEvent("orientationchange", isMobileCallback);
    useGlobalEvent("load", isMobileCallback);
};
export { useIsMobile };
