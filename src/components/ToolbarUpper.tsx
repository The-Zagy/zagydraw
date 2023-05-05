import { clsx } from "clsx";
import { BsSquare, BsSquareFill } from "react-icons/bs";
import { RiCursorLine, RiCursorFill } from "react-icons/ri";
import {
    MdOutlineHorizontalRule,
    MdOutlineBackHand,
    MdBackHand
} from "react-icons/md";
import { useStore } from "store";
import { CursorFn } from "types/general";
const { setCursorFn } = useStore.getState();
export default function ToolbarUpper() {
    const cursorFn = useStore((state) => state.cursorFn);

    return (
        <div className="fixed left-1/2 top-4 z-50 flex  -translate-x-1/2 items-center justify-between overflow-auto rounded-md bg-zinc-800">
            <button
                onClick={() => setCursorFn(CursorFn.Default)}
                className={clsx(
                    "h-12 w-14 cursor-pointer rounded-l-lg",
                    { "bg-zinc-500": cursorFn === CursorFn.Default },
                    {
                        "hover:bg-zinc-700": cursorFn !== CursorFn.Default
                    }
                )}
            >
                {cursorFn === CursorFn.Default ? (
                    <RiCursorFill className="m-auto" color="white" />
                ) : (
                    <RiCursorLine className="m-auto" color="white" />
                )}
            </button>
            <button
                className={clsx(
                    "h-12 w-14 cursor-pointer",
                    {
                        "bg-zinc-500": cursorFn === CursorFn.Drag
                    },
                    {
                        "hover:bg-zinc-700": cursorFn !== CursorFn.Drag
                    }
                )}
                onClick={() => setCursorFn(CursorFn.Drag)}
            >
                {cursorFn === CursorFn.Drag ? (
                    <MdBackHand className="m-auto" color="white" />
                ) : (
                    <MdOutlineBackHand className="m-auto" color="white" />
                )}
            </button>
            <button
                onClick={() => setCursorFn(CursorFn.Rect)}
                className={clsx(
                    "h-12 w-14 cursor-pointer",
                    {
                        "bg-zinc-500": cursorFn === CursorFn.Rect
                    },
                    {
                        "hover:bg-zinc-700": cursorFn !== CursorFn.Rect
                    }
                )}
            >
                {cursorFn === CursorFn.Rect ? (
                    <BsSquareFill className="m-auto" color="white" />
                ) : (
                    <BsSquare className="m-auto" color="white" />
                )}
            </button>
            <button
                onClick={() => setCursorFn(CursorFn.Line)}
                className={clsx(
                    "h-12 w-14 cursor-pointer",
                    {
                        "bg-zinc-500": cursorFn === CursorFn.Line
                    },
                    {
                        "hover:bg-zinc-700": cursorFn !== CursorFn.Line
                    }
                )}
            >
                <MdOutlineHorizontalRule
                    className={clsx("m-auto", {
                        "text-lg": cursorFn === CursorFn.Line
                    })}
                    color="white"
                />
            </button>

            <button className="h-12 w-14 cursor-pointer hover:bg-zinc-700">
                <MdOutlineBackHand className="m-auto" color="white" />
            </button>
            <button className="h-12 w-14 cursor-pointer hover:bg-zinc-700">
                <MdOutlineBackHand className="m-auto" color="white" />
            </button>
            <button className="h-12 w-14 cursor-pointer rounded-r-lg hover:bg-zinc-700">
                <MdOutlineBackHand className="m-auto" color="white" />
            </button>
        </div>
    );
}
