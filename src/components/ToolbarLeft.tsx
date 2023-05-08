import rough from "roughjs";
import clsx from "clsx";
import { HiOutlineMinus } from "react-icons/hi";
import { MdDeleteOutline } from "react-icons/md";
import { useStore } from "store/index";
import { CanvasRectElement } from "types/general";
import InputWithIcon from "./form/input";
import { generateRectElement } from "utils/canvas/generateElement";

const gen = rough.generator();

const ToolbarLine = () => {
    return <div className=""></div>;
};

const ToolbarRect: React.FC<{ rect: CanvasRectElement }> = (props) => {
    console.log(props.rect.options.seed);
    const { setElements, setSelectedElements } = useStore.getState();
    return (
        <div className="flex flex-col gap-3 p-3 text-white">
            <InputWithIcon
                labelName={"Stroke"}
                inputProps={{
                    type: "text",
                    defaultValue: props.rect.options.stroke,
                    onKeyDown(e) {
                        if (e.key === "Enter") {
                            const rect = generateRectElement(
                                gen,
                                [props.rect.x, props.rect.y],
                                [props.rect.endX, props.rect.endY],
                                props.rect.curPos,
                                {
                                    ...props.rect.options,
                                    stroke: (e.target as HTMLInputElement).value
                                }
                            );
                            // if i didn't change the selected state will conflict with new id returned from new generate
                            setSelectedElements(() => [rect]);
                            setElements((prev) => [
                                ...prev.filter(
                                    (val) => val.id !== props.rect.id
                                ),
                                rect
                            ]);
                        }
                    }
                }}
            />
            <InputWithIcon
                labelName={"Fill"}
                inputProps={{
                    type: "text",
                    defaultValue: props.rect.options.fill,
                    onKeyDown(e) {
                        if (e.key === "Enter") {
                            const rect = generateRectElement(
                                gen,
                                [props.rect.x, props.rect.y],
                                [props.rect.endX, props.rect.endY],
                                props.rect.curPos,
                                {
                                    ...props.rect.options,
                                    fill: (e.target as HTMLInputElement).value
                                }
                            );
                            // if i didn't change the selected state will conflict with new id returned from new generate
                            setSelectedElements(() => [rect]);
                            setElements((prev) => [
                                ...prev.filter(
                                    (val) => val.id !== props.rect.id
                                ),
                                rect
                            ]);
                        }
                    }
                }}
            />
            <label>
                fill style
                <select
                    className="text-black"
                    defaultValue={props.rect.options.fillStyle}
                    onChange={(e) => {
                        const rect = generateRectElement(
                            gen,
                            [props.rect.x, props.rect.y],
                            [props.rect.endX, props.rect.endY],
                            props.rect.curPos,
                            {
                                ...props.rect.options,
                                fillStyle: e.target.value
                            }
                        );
                        // if i didn't change the selected state will conflict with new id returned from new generate
                        setSelectedElements(() => [rect]);
                        setElements((prev) => [
                            ...prev.filter((val) => val.id !== props.rect.id),
                            rect
                        ]);
                    }}
                >
                    <option value="solid">Solid</option>
                    <option value="zigzag">Zigzag</option>
                    <option value="dots">dots</option>
                    <option value="hachure">hachure</option>
                </select>
            </label>
            <label>
                Stroke Width
                <select
                    className="text-black"
                    defaultValue={props.rect.options.fillStyle}
                    onChange={(e) => {
                        const rect = generateRectElement(
                            gen,
                            [props.rect.x, props.rect.y],
                            [props.rect.endX, props.rect.endY],
                            props.rect.curPos,
                            {
                                ...props.rect.options,
                                strokeWidth: +e.target.value
                            }
                        );
                        // if i didn't change the selected state will conflict with new id returned from new generate
                        setSelectedElements(() => [rect]);
                        setElements((prev) => [
                            ...prev.filter((val) => val.id !== props.rect.id),
                            rect
                        ]);
                    }}
                >
                    <option value={1}>1</option>
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                </select>
                {/* <input
                    className={clsx(
                        "h-12 w-16 cursor-pointer rounded-l-lg sm:w-14"
                    )}
                    type="radio"
                    value={1}
                    name="stroke-width"
                />
                <HiOutlineMinus className="" /> */}
            </label>
            {/* <label>
                Stroke Width
                <input
                    className={clsx(
                        "h-12 w-16 cursor-pointer rounded-l-lg sm:w-14"
                    )}
                    type="radio"
                    value={2}
                    name="stroke-width"
                />
                <HiOutlineMinus className="" />
            </label>
            <label>
                Stroke Width
                <input
                    className={clsx(
                        "h-12 w-16 cursor-pointer rounded-l-lg sm:w-14"
                    )}
                    type="radio"
                    value={3}
                    name="stroke-width"
                />
                <HiOutlineMinus className="" />
            </label> */}
            <label>
                Stroke style
                <select
                    className="text-black"
                    defaultValue={props.rect.options.fillStyle}
                    onChange={(e) => {
                        const rect = generateRectElement(
                            gen,
                            [props.rect.x, props.rect.y],
                            [props.rect.endX, props.rect.endY],
                            props.rect.curPos,
                            {
                                ...props.rect.options,
                                strokeLineDash:
                                    +e.target.value === 1 ? [] : [5, 10]
                            }
                        );
                        // if i didn't change the selected state will conflict with new id returned from new generate
                        setSelectedElements(() => [rect]);
                        setElements((prev) => [
                            ...prev.filter((val) => val.id !== props.rect.id),
                            rect
                        ]);
                    }}
                >
                    <option value={1}>1</option>
                    <option value={3}>3</option>
                </select>
            </label>
            <button
                className="h-10 w-12 cursor-pointer sm:w-14 hover:bg-zinc-700"
                onClick={() => {
                    setSelectedElements(() => []);
                    setElements((prev) => [
                        ...prev.filter((val) => val.id !== props.rect.id)
                    ]);
                }}
            >
                <MdDeleteOutline className="m-auto text-lg" color="white" />
            </button>

            <label className="flex flex-col gap-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Opacity
                <input
                    id="opacity"
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={props.rect.opacity}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    onChange={(e) => {
                        const rect = generateRectElement(
                            gen,
                            [props.rect.x, props.rect.y],
                            [props.rect.endX, props.rect.endY],
                            props.rect.curPos,
                            {
                                ...props.rect.options
                            },
                            +e.target.value
                        );
                        // if i didn't change the selected state will conflict with new id returned from new generate
                        setSelectedElements(() => [rect]);
                        setElements((prev) => [
                            ...prev.filter((val) => val.id !== props.rect.id),
                            rect
                        ]);
                    }}
                />
            </label>
        </div>
    );
};

export default function ToolbarLeft() {
    const selectedElements = useStore((state) => state.selectedElements);
    console.log(
        "🪵 [ToolbarLeft.tsx:58] ~ token ~ \x1b[0;32mselectedElements\x1b[0m = ",
        selectedElements
    );

    if (selectedElements.length == 0) {
        return null;
    }

    return (
        <>
            <div className="scrollbar-thin scrollbar-thumb-zinc-600 fixed left-2 top-10 h-3/5 w-1/5 overflow-auto  whitespace-nowrap  rounded-md bg-zinc-800 sm:m-0 sm:w-auto sm:max-w-none">
                <div className="mx-auto w-fit">
                    {/* TODO fix as */}
                    {selectedElements[0].shape === "rectangle" && (
                        <ToolbarRect
                            rect={selectedElements[0] as CanvasRectElement}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
