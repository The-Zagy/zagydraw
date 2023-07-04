import { clsx } from "clsx";
import { BsSquare, BsSquareFill, BsPencil, BsPencilFill } from "react-icons/bs";
import { RiCursorLine, RiCursorFill, RiText } from "react-icons/ri";
import { CiEraser } from "react-icons/ci";
import { MdOutlineHorizontalRule, MdOutlineBackHand, MdBackHand } from "react-icons/md";
import { CursorFn } from "types/general";
import { useStore } from "store";
import useKeyboardShortcut from "hooks/useShortcut";
const { setCursorFn } = useStore.getState();
export default function ToolbarUpper() {
    const cursorFn = useStore((state) => state.cursorFn);
    useKeyboardShortcut(
        {
            onShortcut: () => setCursorFn(CursorFn.Default),
        },
        "1"
    );
    useKeyboardShortcut(
        {
            onShortcut: () => setCursorFn(CursorFn.Drag),
        },
        "2"
    );
    useKeyboardShortcut(
        {
            onShortcut: () => setCursorFn(CursorFn.FreeDraw),
        },
        "3"
    );
    useKeyboardShortcut(
        {
            onShortcut: () => setCursorFn(CursorFn.Rect),
        },
        "4"
    );
    useKeyboardShortcut(
        {
            onShortcut: () => setCursorFn(CursorFn.Line),
        },
        "5"
    );
    useKeyboardShortcut(
        {
            onShortcut: () => setCursorFn(CursorFn.Text),
        },
        "6"
    );
    useKeyboardShortcut(
        {
            onShortcut: () => setCursorFn(CursorFn.Erase),
        },
        "7"
    );
    return (
        <div className="withFira scrollbar-thin scrollbar-thumb-zinc-600 bg-primary-600 fixed left-1/2 top-4 w-11/12 -translate-x-1/2 cursor-default select-none overflow-auto  whitespace-nowrap  rounded-md py-1 md:w-6/12 lg:m-0 lg:w-auto lg:max-w-none">
            <div className="mx-auto w-fit">
                <button
                    data-testid="default-cursor"
                    onClick={() => setCursorFn(CursorFn.Default)}
                    className={clsx(
                        "relative mx-1 h-12 w-12 cursor-pointer rounded-lg text-xl lg:rounded-l-none  ",
                        {
                            "bg-background-700":
                                cursorFn === CursorFn.Default || cursorFn === CursorFn.Move,
                        },
                        {
                            "hover:bg-primary-400":
                                cursorFn !== CursorFn.Default && cursorFn !== CursorFn.Move,
                        }
                    )}>
                    {cursorFn === CursorFn.Default ? (
                        <RiCursorFill className="m-auto text-white" />
                    ) : (
                        <RiCursorLine className="m-auto" color="white" />
                    )}
                    <span className="absolute bottom-1.5 left-1.5 text-xs font-thin text-gray-500">
                        1
                    </span>
                </button>

                <button
                    data-testid="drag-cursor"
                    className={clsx(
                        "relative mx-1 h-12 w-12 cursor-pointer rounded-lg text-xl  ",
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
                    <span className="absolute bottom-1.5 left-1.5 text-xs font-thin text-gray-500">
                        2
                    </span>
                </button>
                <button
                    data-testid="freedraw-cursor"
                    onClick={() => setCursorFn(CursorFn.FreeDraw)}
                    className={clsx(
                        "relative mx-1 h-12 w-12 cursor-pointer rounded-lg text-xl  ",
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
                    <span className="absolute bottom-1.5 left-1.5 text-xs font-thin text-gray-500">
                        3
                    </span>
                </button>
                <button
                    data-testid="rect-cursor"
                    onClick={() => setCursorFn(CursorFn.Rect)}
                    className={clsx(
                        "relative mx-1 h-12 w-12 cursor-pointer rounded-lg text-xl  ",
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
                    <span className="absolute bottom-1.5 left-1.5 text-xs font-thin text-gray-500 ">
                        4
                    </span>
                </button>
                <button
                    data-testid="line-cursor"
                    onClick={() => setCursorFn(CursorFn.Line)}
                    className={clsx(
                        "relative mx-1 h-12 w-12 cursor-pointer rounded-lg text-xl  ",
                        {
                            "bg-background-700": cursorFn === CursorFn.Line,
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Line,
                        }
                    )}>
                    <MdOutlineHorizontalRule className="m-auto" color="white" />
                    <span className="absolute bottom-1.5 left-1.5 text-xs font-thin text-gray-500">
                        5
                    </span>
                </button>

                <button
                    data-testid="text-cursor"
                    onClick={() => setCursorFn(CursorFn.Text)}
                    className={clsx(
                        "relative mx-1 h-12 w-12 cursor-pointer rounded-lg text-xl  ",
                        {
                            "bg-background-700": cursorFn === CursorFn.Text,
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Text,
                        }
                    )}>
                    <RiText className="m-auto" color="white" />
                    <span className="absolute bottom-1.5 left-1.5 text-xs font-thin text-gray-500">
                        6
                    </span>
                </button>
                <button
                    data-testid="erase-cursor"
                    onClick={() => setCursorFn(CursorFn.Erase)}
                    className={clsx(
                        "relative mx-1 h-12 w-12 cursor-pointer rounded-lg text-xl lg:rounded-r-none ",
                        {
                            "bg-background-700": cursorFn === CursorFn.Erase,
                        },
                        {
                            "hover:bg-primary-400": cursorFn !== CursorFn.Erase,
                        }
                    )}>
                    <CiEraser className="m-auto" color="white" />
                    <span className="absolute bottom-1.5 left-1.5 text-xs font-thin text-gray-500">
                        7
                    </span>
                </button>
            </div>
        </div>
    );
}
