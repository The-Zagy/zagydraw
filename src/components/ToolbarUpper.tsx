import { clsx } from "clsx";
import { BsSquare, BsSquareFill, BsPencil, BsPencilFill } from "react-icons/bs";
import { RiCursorLine, RiCursorFill, RiText } from "react-icons/ri";
import { CiEraser } from "react-icons/ci";
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
        <div className="withFira cursor-default scrollbar-thin scrollbar-thumb-zinc-600 fixed left-1/2 top-4 w-11/12 -translate-x-1/2 overflow-auto  whitespace-nowrap  rounded-md bg-primary-600 sm:m-0 sm:w-auto sm:max-w-none py-1">
            <div className="mx-auto w-fit">
                <button
                    onClick={() => setCursorFn(CursorFn.Default)}
                    className={clsx(
                        "h-12 mx-1 w-16 cursor-pointer rounded-l-lg sm:w-14 rounded-2xl text-xl",
                        { "bg-background-700": cursorFn === CursorFn.Default },
                        {
                            "hover:bg-primary-400":
                                cursorFn !== CursorFn.Default
                        }
                    )}
                >
                    {cursorFn === CursorFn.Default ? (
                        <RiCursorFill className="m-auto text-white" />
                    ) : (
                        <RiCursorLine className="m-auto" color="white" />
                    )}
                </button>
                <button
                    onClick={() => setCursorFn(CursorFn.FreeDraw)}
                    className={clsx(
                        "h-12  mx-1  w-16 cursor-pointer sm:w-14 rounded-2xl text-xl",
                        {
                            "bg-background-700": cursorFn === CursorFn.FreeDraw
                        },
                        {
                            "hover:bg-primary-400":
                                cursorFn !== CursorFn.FreeDraw
                        }
                    )}
                >
                    {cursorFn === CursorFn.FreeDraw ? (
                        <BsPencilFill className="m-auto" color="white" />
                    ) : (
                        <BsPencil className="m-auto" color="white" />
                    )}
                </button>
                <button
                    className={clsx(
                        "h-12 mx-1 w-16 cursor-pointer sm:w-14 rounded-2xl text-xl",
                        {
                            "bg-background-700": cursorFn === CursorFn.Drag
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Drag
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
                        "h-12 mx-1 w-16 cursor-pointer sm:w-14 rounded-2xl text-xl",
                        {
                            "bg-background-700": cursorFn === CursorFn.Rect
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Rect
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
                        "h-12 mx-1 w-16 cursor-pointer sm:w-14 rounded-2xl text-xl",
                        {
                            "bg-background-700": cursorFn === CursorFn.Line
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Line
                        }
                    )}
                >
                    <MdOutlineHorizontalRule className="m-auto" color="white" />
                </button>

                <button
                    onClick={() => setCursorFn(CursorFn.Text)}
                    className={clsx(
                        "h-12 mx-1 w-16 cursor-pointer sm:w-14 rounded-2xl text-xl",
                        {
                            "bg-background-700": cursorFn === CursorFn.Text
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Text
                        }
                    )}
                >
                    <RiText className="m-auto" color="white" />
                </button>
                <button
                    onClick={() => setCursorFn(CursorFn.Erase)}
                    className={clsx(
                        "h-12 mx-1 w-16 cursor-pointer sm:w-14 rounded-2xl rounded-r-lg text-xl",
                        {
                            "bg-background-700": cursorFn === CursorFn.Erase
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Erase
                        }
                    )}
                >
                    <CiEraser className="m-auto" color="white" />
                </button>
            </div>
        </div>
    );
}
