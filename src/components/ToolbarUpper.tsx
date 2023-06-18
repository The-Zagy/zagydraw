import { clsx } from "clsx";
import { BsSquare, BsSquareFill, BsPencil, BsPencilFill } from "react-icons/bs";
import { RiCursorLine, RiCursorFill, RiText } from "react-icons/ri";
import { CiEraser } from "react-icons/ci";
import { MdOutlineHorizontalRule, MdOutlineBackHand, MdBackHand } from "react-icons/md";
import { CursorFn } from "types/general";
import { useStore } from "store";
const { setCursorFn } = useStore.getState();
export default function ToolbarUpper() {
    const cursorFn = useStore((state) => state.cursorFn);

    return (
        <div className="withFira scrollbar-thin scrollbar-thumb-zinc-600 bg-primary-600 fixed left-1/2 top-4 w-11/12 -translate-x-1/2 cursor-default  overflow-auto  whitespace-nowrap rounded-md py-1 sm:m-0 sm:w-auto sm:max-w-none">
            <div className="mx-auto w-fit">
                <button
                    onClick={() => setCursorFn(CursorFn.Default)}
                    className={clsx(
                        "mx-1 h-12 w-16 cursor-pointer rounded-2xl rounded-l-lg text-xl sm:w-14",
                        { "bg-background-700": cursorFn === CursorFn.Default },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Default,
                        }
                    )}>
                    {cursorFn === CursorFn.Default ? (
                        <RiCursorFill className="m-auto text-white" />
                    ) : (
                        <RiCursorLine className="m-auto" color="white" />
                    )}
                </button>
                <button
                    onClick={() => setCursorFn(CursorFn.FreeDraw)}
                    className={clsx(
                        "mx-1  h-12  w-16 cursor-pointer rounded-2xl text-xl sm:w-14",
                        {
                            "bg-background-700": cursorFn === CursorFn.FreeDraw,
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.FreeDraw,
                        }
                    )}>
                    {cursorFn === CursorFn.FreeDraw ? (
                        <BsPencilFill className="m-auto" color="white" />
                    ) : (
                        <BsPencil className="m-auto" color="white" />
                    )}
                </button>
                <button
                    className={clsx(
                        "mx-1 h-12 w-16 cursor-pointer rounded-2xl text-xl sm:w-14",
                        {
                            "bg-background-700": cursorFn === CursorFn.Drag,
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Drag,
                        }
                    )}
                    onClick={() => setCursorFn(CursorFn.Drag)}>
                    {cursorFn === CursorFn.Drag ? (
                        <MdBackHand className="m-auto" color="white" />
                    ) : (
                        <MdOutlineBackHand className="m-auto" color="white" />
                    )}
                </button>
                <button
                    onClick={() => setCursorFn(CursorFn.Rect)}
                    className={clsx(
                        "mx-1 h-12 w-16 cursor-pointer rounded-2xl text-xl sm:w-14",
                        {
                            "bg-background-700": cursorFn === CursorFn.Rect,
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Rect,
                        }
                    )}>
                    {cursorFn === CursorFn.Rect ? (
                        <BsSquareFill className="m-auto" color="white" />
                    ) : (
                        <BsSquare className="m-auto" color="white" />
                    )}
                </button>
                <button
                    onClick={() => setCursorFn(CursorFn.Line)}
                    className={clsx(
                        "mx-1 h-12 w-16 cursor-pointer rounded-2xl text-xl sm:w-14",
                        {
                            "bg-background-700": cursorFn === CursorFn.Line,
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Line,
                        }
                    )}>
                    <MdOutlineHorizontalRule className="m-auto" color="white" />
                </button>

                <button
                    onClick={() => setCursorFn(CursorFn.Text)}
                    className={clsx(
                        "mx-1 h-12 w-16 cursor-pointer rounded-2xl text-xl sm:w-14",
                        {
                            "bg-background-700": cursorFn === CursorFn.Text,
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Text,
                        }
                    )}>
                    <RiText className="m-auto" color="white" />
                </button>
                <button
                    onClick={() => setCursorFn(CursorFn.Erase)}
                    className={clsx(
                        "mx-1 h-12 w-16 cursor-pointer rounded-2xl rounded-r-lg text-xl sm:w-14",
                        {
                            "bg-background-700": cursorFn === CursorFn.Erase,
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Erase,
                        }
                    )}>
                    <CiEraser className="m-auto" color="white" />
                </button>
            </div>
        </div>
    );
}
