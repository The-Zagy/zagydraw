import useGlobalEvent from "hooks/useGlobalEvent";
import { PointerEventHandler, useEffect, useLayoutEffect, useRef } from "react";
import { useStore } from "store";
import drawGrid from "utils/canvas/drawGrid";

const { setPosition, setZoomLevel, setDimensions } = useStore.getState();

const MAX_ZOOM = 96;
const MIN_ZOOM = 24;
type MouseCoords = {
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
};

function App() {
    const position = useStore((state) => state.position);
    const zoom = useStore((state) => state.zoomLevel);
    const width = useStore((state) => state.width);
    const height = useStore((state) => state.height);
    const isMouseDown = useRef<boolean>(false);
    const mouseCoords = useRef<MouseCoords>({
        startX: 0,
        startY: 0,
        scrollLeft: 0,
        scrollTop: 0
    });
    const handleZoom = (zoomType: "in" | "out") => {
        if (zoomType === "in") {
            const currentZoom = zoom + 12;
            if (currentZoom > MAX_ZOOM) return;
            setZoomLevel(currentZoom);
            return;
        }
        const currentZoom = zoom - 12;
        if (currentZoom <= MIN_ZOOM) return;
        setZoomLevel(currentZoom);
    };
    const canvas = useRef<HTMLCanvasElement>(null);
    useLayoutEffect(() => {
        if (canvas.current) {
            //make canvas fill the screen
            canvas.current.width = window.innerWidth;
            canvas.current.height = window.innerHeight;
        }
    }, []);
    useEffect(() => {
        if (!canvas.current) return;
        const ctx = canvas.current.getContext("2d");
        if (!ctx) return;
        //clear the canvas
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
        //draw a the grid
        drawGrid(
            position.x,
            position.y,
            canvas.current.width,
            canvas.current.height,
            ctx
        );
    }, [position, zoom, width, height]);
    const handlePointerDown: PointerEventHandler<HTMLCanvasElement> = (e) => {
        //handle dragging into the canvas
        if (!canvas.current) return;
        isMouseDown.current = true;
        const startX = e.pageX - canvas.current.offsetLeft;
        const startY = e.pageY - canvas.current.offsetTop;
        const scrollLeft = canvas.current.scrollLeft;
        const scrollTop = canvas.current.scrollTop;
        mouseCoords.current = { startX, startY, scrollLeft, scrollTop };
    };
    const handlePointerUp: PointerEventHandler<HTMLCanvasElement> = () => {
        isMouseDown.current = false;
        if (!canvas.current) return;
    };
    const handlePointerMove: PointerEventHandler<HTMLCanvasElement> = (e) => {
        e.preventDefault();
        //handle dragging into the canvas
        if (!isMouseDown.current || !canvas.current) return;
        const x = e.pageX - canvas.current.offsetLeft;
        const y = e.pageY - canvas.current.offsetTop;
        // 50 is an arbitrary number to make the walk distance smaller
        const walkX = (x - mouseCoords.current.startX) / 200;
        const walkY = (y - mouseCoords.current.startY) / 200;
        setPosition({ x: position.x - walkX, y: position.y - walkY });
    };

    const handleScroll = (e: WheelEvent) => {
        const { deltaY } = e;
        if (!deltaY) return;
        if (deltaY > 0) {
            handleZoom("out");
            return;
        }
        handleZoom("in");
    };
    const handleResize = () => {
        if (!canvas.current) return;
        setDimensions(window.innerWidth, window.innerHeight);
        canvas.current.width = window.innerWidth;
        canvas.current.height = window.innerHeight;
    };
    useGlobalEvent("wheel", handleScroll);
    useGlobalEvent("resize", handleResize);
    return (
        <div>
            <canvas
                ref={canvas}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            />
        </div>
    );
}

export default App;
