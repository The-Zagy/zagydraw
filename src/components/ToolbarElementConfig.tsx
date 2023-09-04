import React, { ReactNode, useEffect, useMemo } from "react";
import rough from "roughjs";
import { MdDeleteOutline, MdCopyAll } from "react-icons/md";
import { IconContext } from "react-icons";
import { TbLetterL, TbLetterM, TbLetterS, TbLetterX } from "react-icons/tb";
import { SiMinetest } from "react-icons/si";
import { AiOutlineDash, AiOutlineLine } from "react-icons/ai";
import { FaCode, FaMinus, FaSignature, FaSquare } from "react-icons/fa";
import clsx from "clsx";
import { CommonConfigOptions, getElementsUnionConfig, isEqualArray } from "@/utils";
import { useStore } from "@/store/index";
import {
    FillStyleOptions,
    FontSize,
    FontTypeOptions,
    GlobalElementOptions,
    StrokeWidth,
    ZagyCanvasElement,
    isHanddrawn,
    isLine,
    isRect,
    isText,
} from "@/types/general";
import {
    generateCacheLineElement,
    generateCacheRectElement,
    generateCachedHandDrawnElement,
    generateTextElement,
} from "@/utils/canvas/generateElement";
import { commandManager } from "@/actions/commandManager";
import { ActionDeleteSelected } from "@/actions";
import { ActionExportScene, DestOpts } from "@/actions/ExportScene";
import useKeyboardShortcut from "@/hooks/useShortcut";
//import { BsTextCenter, BsTextLeft, BsTextRight } from "react-icons/bs";

const gen = rough.generator();

type Props = {
    labelName: string;
    defaultValue?: string;

    onChange?: (value: string) => void;
};
const isValidColor = (color: string) => {
    const s = new Option().style;
    s.color = color;
    return s.color !== "";
};
const InputWithIcon: React.FC<Props> = (props) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const lastValue = React.useRef<string>("");
    const [isFocus, setIsFocus] = React.useState(false);
    useEffect(() => {
        if (props.defaultValue) {
            inputRef.current!.value = props.defaultValue
                .split("")
                .filter((val) => val !== "#")
                .join("");
        }
    }, [props.defaultValue]);
    return (
        <label className="dark:text-text-800 flex flex-col gap-1 bg-transparent font-medium text-gray-900">
            {props.labelName}
            <div className="flex">
                <span
                    className={clsx(
                        "inline-flex items-center rounded-l-md  border-r-0 px-3 text-gray-900  dark:bg-transparent dark:text-gray-400",
                        { "border border-blue-500 ": isFocus },
                        { "border border-gray-300 dark:border-gray-900 ": !isFocus }
                    )}>
                    #
                </span>
                <input
                    ref={inputRef}
                    onBlur={(e) => {
                        setIsFocus(false);
                        if (!isValidColor("#" + e.target.value)) {
                            inputRef.current!.value = lastValue.current;
                            return;
                        }
                    }}
                    onFocus={(e) => {
                        setIsFocus(true);
                        lastValue.current = e.target.value;
                    }}
                    onChange={(e) => {
                        if (isValidColor("#" + e.target.value) && props.onChange) {
                            props.onChange("#" + e.target.value);
                        }
                    }}
                    className="dark:text-text-600
                                block w-full min-w-0 flex-1
                                rounded-none rounded-r-lg border
                                border-gray-300 bg-transparent p-2.5
                                text-gray-900 outline-none
                                focus:border-blue-500 focus:border-l-gray-900 dark:border-gray-900 dark:bg-transparent dark:placeholder:text-gray-400 dark:focus:border-blue-500
                                dark:focus:border-l-gray-900
                                "
                />
            </div>
        </label>
    );
};
const RadioButton: React.FC<{
    children: ReactNode;
    value: string | number;
    name: string;
    isChecked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
}> = (props) => {
    const id = props.name + props.value.toString();
    return (
        <div
            className={clsx(
                "hover:bg-primary-400 h-9  w-9 overflow-hidden rounded-lg border border-gray-900",
                { "border border-blue-500": props.isChecked }
            )}>
            <input
                id={id}
                name={props.name}
                type="radio"
                value={props.value}
                className="peer hidden"
                defaultChecked={props.isChecked}
                onChange={props.onChange}
            />
            <label
                htmlFor={id}
                className="peer-checked:text-background-600 peer-checked:stroke-background-600 m-auto h-full w-full ">
                <div className="relative flex h-full w-full flex-col items-center justify-center p-2">
                    {props.children}
                </div>
            </label>
        </div>
    );
};
const {
    setElements,
    setSelectedElements,
    setFont,
    setFontSize,
    setFill,
    setFillStyle,
    setOpacity,
    setStroke,
    setStrokeLineDash,
    setStrokeWidth,
} = useStore.getState();
export default function ToolbarLeft() {
    const [font, fontSize] = useStore((state) => [state.font, state.fontSize]);
    const selectedElements = useStore((state) => state.selectedElements);
    const [isMobile, toolbarElementConfigOpen, zoom] = useStore((state) => [
        state.isMobile,
        state.isToolbarElementConfigOpen,
        state.zoomLevel,
    ]);

    const ctx = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 100;
        return canvas.getContext("2d")!;
    }, []);

    useEffect(() => {
        if (!ctx) return;
        ctx.font = `${fontSize}px ` + FontTypeOptions[font];
        ctx.textBaseline = "top";
    }, [ctx, font, fontSize]);

    useKeyboardShortcut(
        {
            onShortcut: () => commandManager.executeCommand(new ActionDeleteSelected()),
        },
        "Delete"
    );
    useKeyboardShortcut(
        {
            onShortcut: () =>
                commandManager.executeCommand(new ActionExportScene(DestOpts.CLIPBOARD, true)),
        },
        "ControlLeft",
        "c"
    );

    const commonConf = useMemo(() => {
        if (selectedElements.length === 0) return null;
        return getElementsUnionConfig(selectedElements);
    }, [selectedElements]);
    if (!commonConf) return null;
    const handleDeleteOnClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        commandManager.executeCommand(new ActionDeleteSelected());
    };

    const handleCopyOnClick: React.MouseEventHandler<HTMLButtonElement> = async () => {
        try {
            commandManager.executeCommand(new ActionExportScene(DestOpts.CLIPBOARD, true));
        } catch (e) {
            //todo
        }
    };
    const handleConfigChange = <T extends keyof CommonConfigOptions>(
        k: T,
        value: GlobalElementOptions[T]
    ) => {
        // create hash for check up
        const ids = new Set<string>();
        for (const itm of selectedElements) {
            ids.add(itm.id);
        }
        const els: ZagyCanvasElement[] = [];
        //todo maybe optimize so that if the element's own config isn't changed no need to re-generate
        selectedElements.forEach((el) => {
            if (isRect(el)) {
                els.push(
                    generateCacheRectElement(gen, [el.x, el.y], [el.endX, el.endY], zoom, {
                        ...el.options,
                        [k]: value,
                        id: el.id,
                    })
                );
            } else if (isLine(el)) {
                els.push(
                    generateCacheLineElement(gen, [el.x, el.y], [el.endX, el.endY], zoom, {
                        ...el.options,
                        id: el.id,
                        [k]: value,
                    })
                );
            } else if (isText(el)) {
                els.push(
                    generateTextElement(ctx, el.text.join("\n"), [el.x, el.y], {
                        ...el.options,
                        [k]: value,
                    })
                );
            } else if (isHanddrawn(el)) {
                els.push(
                    generateCachedHandDrawnElement(el.paths, zoom, { ...el.options, [k]: value })
                );
            }
        });
        // change global config to new options

        setSelectedElements(() => els);
        setElements((prev) => [...prev.filter((val) => !ids.has(val.id)), ...els]);
    };

    const handleStroke = (value: string) => {
        handleConfigChange("stroke", value);
        setStroke(value);
    };
    const handleFill = (value: string) => {
        handleConfigChange("fill", value);
        setFill(value);
    };
    const handleFillStyle: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        handleConfigChange("fillStyle", e.target.value as FillStyleOptions);
        setFillStyle(e.target.value as FillStyleOptions);
    };

    const handleStrokeLineDash: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        handleConfigChange("strokeLineDash", +e.target.value === 1 ? [] : [10, 10]);
        setStrokeLineDash(+e.target.value === 1 ? [] : [10, 10]);
    };

    const handleStrokeWidth: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        handleConfigChange("strokeWidth", +e.target.value as StrokeWidth);
        setStrokeWidth(+e.target.value as StrokeWidth);
    };

    const handleFontSize: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        handleConfigChange("fontSize", +e.target.value as FontSize);
        setFontSize(+e.target.value as FontSize);
    };

    const handleFontFamily: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        handleConfigChange("font", e.target.value as FontTypeOptions);
        setFont(e.target.value as FontTypeOptions);
    };

    // todo
    // const handleTextAlign: React.ChangeEventHandler<HTMLInputElement> = () => {
    //     //todo
    // };

    const handleOpacityChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        handleConfigChange("opacity", +e.target.value);
        setOpacity(+e.target.value);
    };
    const baseSize = 1.2;
    if (isMobile && !toolbarElementConfigOpen) return null;
    return (
        <>
            <IconContext.Provider
                value={{
                    size: `${baseSize}rem`,
                }}>
                <div className="scrollbar-thin scrollbar-thumb-zinc-600 bg-primary-600 fixed  inset-0 m-auto flex max-h-[70%] w-11/12  select-none flex-col gap-1 overflow-auto whitespace-nowrap rounded-md text-xs md:left-2 md:top-20 md:m-0  md:ml-1  md:max-h-[75%] md:w-fit">
                    <div className="text-text-800 flex w-fit flex-col gap-2 p-3 ">
                        {commonConf.stroke !== undefined ? (
                            <InputWithIcon
                                labelName={"Stroke"}
                                defaultValue={
                                    commonConf.stroke !== null ? commonConf.stroke : undefined
                                }
                                onChange={(value) => {
                                    handleStroke(value);
                                }}
                            />
                        ) : null}

                        {commonConf.fill !== undefined ? (
                            <InputWithIcon
                                labelName={"Fill"}
                                defaultValue={
                                    commonConf.fill !== null ? commonConf.fill : undefined
                                }
                                onChange={(value) => {
                                    handleFill(value);
                                }}
                            />
                        ) : null}

                        {commonConf.fontSize !== undefined ? (
                            <div className="flex flex-col gap-1">
                                <div>Font Size</div>
                                <div className="flex w-full gap-2">
                                    <RadioButton
                                        isChecked={commonConf.fontSize === 16}
                                        name="font-size"
                                        value={16}
                                        onChange={handleFontSize}>
                                        <TbLetterS className="m-auto" />
                                    </RadioButton>
                                    <RadioButton
                                        isChecked={commonConf.fontSize === 24}
                                        name="font-size"
                                        value={24}
                                        onChange={handleFontSize}>
                                        <TbLetterM className="m-auto" />
                                    </RadioButton>
                                    <RadioButton
                                        isChecked={commonConf.fontSize === 32}
                                        name="font-size"
                                        value={32}
                                        onChange={handleFontSize}>
                                        <TbLetterL className="m-auto" />
                                    </RadioButton>
                                    <RadioButton
                                        isChecked={commonConf.fontSize === 48}
                                        name="font-size"
                                        value={48}
                                        onChange={handleFontSize}>
                                        <div className="flex w-full items-center justify-between">
                                            <span className="-ml-2 w-1/3">
                                                <TbLetterX />
                                            </span>
                                            <span className="w-2/3">
                                                <TbLetterL />
                                            </span>
                                        </div>
                                    </RadioButton>
                                </div>
                            </div>
                        ) : null}

                        {commonConf.font !== undefined ? (
                            <div className="flex flex-col gap-1">
                                <div>Font family</div>
                                <div className="flex w-full gap-2">
                                    <RadioButton
                                        isChecked={commonConf.font == "hand"}
                                        onChange={handleFontFamily}
                                        name="font-family"
                                        value={"hand"}>
                                        <FaSignature />
                                    </RadioButton>
                                    <RadioButton
                                        isChecked={commonConf.font == "code"}
                                        onChange={handleFontFamily}
                                        name="font-family"
                                        value={"code"}>
                                        <FaCode />
                                    </RadioButton>
                                    <RadioButton
                                        isChecked={commonConf.font == "minecraft"}
                                        onChange={handleFontFamily}
                                        name="font-family"
                                        value={"minecraft"}>
                                        <SiMinetest />
                                    </RadioButton>
                                </div>
                            </div>
                        ) : null}

                        {commonConf.fillStyle !== undefined ? (
                            <div className="flex flex-col gap-1">
                                <div>Fill Style</div>
                                <div className="flex w-full gap-2">
                                    <RadioButton
                                        isChecked={commonConf.fillStyle === "solid"}
                                        name="fill-style"
                                        value="solid"
                                        onChange={handleFillStyle}>
                                        <FaSquare />
                                    </RadioButton>
                                    <RadioButton
                                        isChecked={commonConf.fillStyle === "hachure"}
                                        onChange={handleFillStyle}
                                        value="hachure"
                                        name="fill-style">
                                        <HachuredSquareIcon size={`${baseSize}rem`} />
                                    </RadioButton>
                                </div>
                            </div>
                        ) : null}

                        {/* todo add option text align */}
                        {/* <div className="flex flex-col gap-1">
                            <div>Text Align</div>
                            <div className="flex w-full gap-2">
                                <RadioButton
                                    isChecked={true}
                                    value="left"
                                    name="text-align"
                                    onChange={handleTextAlign}>
                                    <BsTextLeft />
                                </RadioButton>
                                <RadioButton
                                    isChecked={true}
                                    onChange={handleTextAlign}
                                    value="center"
                                    name="text-align">
                                    <BsTextCenter />
                                </RadioButton>
                                <RadioButton
                                    isChecked={true}
                                    value="right"
                                    name="text-align"
                                    onChange={handleTextAlign}>
                                    <BsTextRight />
                                </RadioButton>
                            </div>
                        </div> */}

                        {commonConf.strokeWidth !== undefined ? (
                            <div className="flex flex-col gap-1">
                                <div>Stroke Width</div>
                                <div className="flex w-full gap-2">
                                    <RadioButton
                                        isChecked={commonConf.strokeWidth === 1}
                                        value={1}
                                        name="stroke-width"
                                        onChange={handleStrokeWidth}>
                                        <FaMinus size={`${baseSize * 0.4}rem`} />
                                    </RadioButton>
                                    <RadioButton
                                        isChecked={commonConf.strokeWidth === 3}
                                        value={3}
                                        name="stroke-width"
                                        onChange={handleStrokeWidth}>
                                        <FaMinus size={`${baseSize * 0.6}rem`} />
                                    </RadioButton>
                                    <RadioButton
                                        isChecked={commonConf.strokeWidth === 6}
                                        value={6}
                                        name="stroke-width"
                                        onChange={handleStrokeWidth}>
                                        <FaMinus size={`${baseSize * 1.4}rem`} />
                                    </RadioButton>
                                </div>
                            </div>
                        ) : null}

                        {commonConf.strokeLineDash !== undefined ? (
                            <div className="flex flex-col gap-1">
                                <div>Stroke style</div>
                                <div className="flex gap-2">
                                    <RadioButton
                                        isChecked={isEqualArray(
                                            commonConf.strokeLineDash as number[],
                                            []
                                        )}
                                        value={1}
                                        name="stroke-style"
                                        onChange={handleStrokeLineDash}>
                                        <AiOutlineLine />
                                    </RadioButton>
                                    <RadioButton
                                        isChecked={isEqualArray(
                                            commonConf.strokeLineDash as number[],
                                            [10, 10]
                                        )}
                                        onChange={handleStrokeLineDash}
                                        name="stroke-style"
                                        value={3}>
                                        <AiOutlineDash />
                                    </RadioButton>
                                </div>
                            </div>
                        ) : null}

                        {commonConf.opacity !== undefined ? (
                            <label className="text-text-800 mb-2 flex flex-col gap-1 text-xs">
                                Opacity
                                <input
                                    id="opacity"
                                    type="range"
                                    className="h-2 w-full cursor-pointer rounded-lg bg-gray-200 dark:bg-gray-700"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    defaultValue={
                                        commonConf.opacity !== null ? commonConf.opacity : undefined
                                    }
                                    onChange={handleOpacityChange}
                                />
                            </label>
                        ) : null}
                        <div className="flex gap-2">
                            <button
                                onClick={handleDeleteOnClick}
                                className="hover:bg-primary-400 h-12 w-12 cursor-pointer rounded-xl border border-gray-900 sm:w-14">
                                <MdDeleteOutline className="text-text-700 m-auto text-xl" />
                            </button>
                            <button
                                onClick={handleCopyOnClick}
                                className="hover:bg-primary-400 h-12 w-12 cursor-pointer rounded-xl border border-gray-900 sm:w-14">
                                <MdCopyAll className="text-text-700 m-auto text-xl" />
                            </button>
                        </div>
                    </div>
                </div>
            </IconContext.Provider>
        </>
    );
}

function HachuredSquareIcon({ size = "1rem" }: { size?: string }) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            role="img"
            viewBox="0 0 20 20"
            className=""
            fill="none"
            stroke="white"
            strokeLinecap="round"
            width={size}
            height={size}
            strokeLinejoin="round">
            <path
                d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
                stroke="white"
                strokeWidth="1.25"></path>
            <mask
                id="FillHachureIcon"
                maskUnits="userSpaceOnUse"
                x="2"
                y="2"
                width="16"
                height="16"
                style={{ maskType: "alpha" }}>
                <path
                    d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.25"></path>
            </mask>
            <g mask="url(#FillHachureIcon)">
                <path
                    d="M2.258 15.156 15.156 2.258M7.324 20.222 20.222 7.325m-20.444 5.35L12.675-.222m-8.157 18.34L17.416 5.22"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"></path>
            </g>
        </svg>
    );
}
