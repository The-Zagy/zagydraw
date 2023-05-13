import React, { ReactNode, useMemo } from "react";
import rough from "roughjs";
import { MdDeleteOutline } from "react-icons/md";
import { useStore } from "store/index";
import { FontTypeOptions, ZagyCanvasRectElement } from "types/general";
import InputWithIcon from "./form/input";
import { CommonConfigOptions, getElementsCommonConfig } from "utils";

const gen = rough.generator();

const Rad: React.FC<{
    children: ReactNode;
    value: string | number;
    name: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
}> = (props) => {
    return (
        <div className="hover:bg-primary-400 w-1/5 h-fit overflow-hidden border border-primary-400 rounded-lg">
            <input
                id={props.value.toString()}
                name={props.name}
                type="radio"
                value={props.value}
                className="peer hidden"
                onChange={props.onChange}
            />
            <label
                htmlFor={props.value.toString()}
                className=" w-full h-full peer-checked:text-background-600  ">
                {props.children}
            </label>
        </div>
    );
};

export default function ToolbarLeft() {
    const { setElements, setSelectedElements } = useStore.getState();
    const selectedElements = useStore((state) => state.selectedElements);
    console.log(
        "🪵 [ToolbarLeft.tsx:58] ~ token ~ \x1b[0;32mselectedElements\x1b[0m = ",
        selectedElements
    );

    if (selectedElements.length == 0) {
        return null;
    }

    // const commonConf = useMemo(
    //     () => getElementsCommonConfig(selectedElements),
    //     [selectedElements]
    // );
    const commonConf = getElementsCommonConfig(selectedElements);

    const handleDeleteOnClick: React.MouseEventHandler<
        HTMLButtonElement
    > = () => {
        // remove any elements that exist on selected elements array
        // create hash of ids for easy check while filtring the elements
        const ids = new Set<string>();
        for (const itm of selectedElements) {
            ids.add(itm.id);
        }
        setSelectedElements(() => []);
        setElements((prev) => [...prev.filter((val) => !ids.has(val.id))]);
    };
    const handleFillStyle: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log(e.target.value);
    };
    const handleStrokeLineDash: React.ChangeEventHandler<HTMLInputElement> = (
        e
    ) => {
        console.log(e.target.value);
    };
    const handleStrokeWidth: React.ChangeEventHandler<HTMLInputElement> = (
        e
    ) => {
        console.log(e.target.value);
    };
    const handleFontSize: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log(e.target.value);
    };
    const handleFontFamily: React.ChangeEventHandler<HTMLInputElement> = (
        e
    ) => {
        console.log(e.target.value);
    };
    const handleTextAlign: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log(e.target.value);
    };
    const handleOpacityChange: React.ChangeEventHandler<HTMLInputElement> = (
        e
    ) => {
        console.log(e.target.value);
    };

    return (
        <>
            <div className="scrollbar-thin scrollbar-thumb-zinc-600 fixed left-2 top-24 h-3/5 w-1/5 overflow-auto  whitespace-nowrap  rounded-md bg-primary-600 sm:m-0 sm:w-auto sm:max-w-none">
                <div className="flex flex-col gap-3 p-3 text-text-800 mx-auto w-fit">
                    {commonConf.stroke !== undefined ? (
                        <InputWithIcon
                            labelName={"Stroke"}
                            inputProps={{
                                type: "text",
                                defaultValue:
                                    commonConf.stroke !== null
                                        ? commonConf.stroke
                                        : undefined,
                            }}
                        />
                    ) : null}

                    {commonConf.fill !== undefined ? (
                        <InputWithIcon
                            labelName={"Fill"}
                            inputProps={{
                                type: "text",
                                defaultValue:
                                    commonConf.fill !== null
                                        ? (commonConf.stroke as string)
                                        : undefined,
                            }}
                        />
                    ) : null}

                    {commonConf.fontSize !== undefined ? (
                        <fieldset className="flex flex-col">
                            <legend>Font Size</legend>
                            <div className="flex gap-2 w-full">
                                <Rad
                                    name="font-size"
                                    value={16}
                                    onChange={handleFontSize}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <g clipPath="url(#a)">
                                            <path
                                                d="M14.167 6.667a3.333 3.333 0 0 0-3.334-3.334H9.167a3.333 3.333 0 0 0 0 6.667h1.666a3.333 3.333 0 0 1 0 6.667H9.167a3.333 3.333 0 0 1-3.334-3.334"
                                                stroke="currentColor"
                                                strokeWidth="1.25"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="a">
                                                <path
                                                    fill="#fff"
                                                    d="M0 0h20v20H0z"></path>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </Rad>
                                <Rad
                                    name="font-size"
                                    value={24}
                                    onChange={handleFontSize}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <g clipPath="url(#a)">
                                            <path
                                                d="M5 16.667V3.333L10 15l5-11.667v13.334"
                                                stroke="currentColor"
                                                strokeWidth="1.25"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="a">
                                                <path
                                                    fill="#fff"
                                                    d="M0 0h20v20H0z"></path>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </Rad>
                                <Rad
                                    name="font-size"
                                    value={32}
                                    onChange={handleFontSize}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <g clipPath="url(#a)">
                                            <path
                                                d="M5.833 3.333v13.334h8.334"
                                                stroke="currentColor"
                                                strokeWidth="1.25"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="a">
                                                <path
                                                    fill="#fff"
                                                    d="M0 0h20v20H0z"></path>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </Rad>
                                <Rad
                                    name="font-size"
                                    value={48}
                                    onChange={handleFontSize}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <path
                                            d="m1.667 3.333 6.666 13.334M8.333 3.333 1.667 16.667M11.667 3.333v13.334h6.666"
                                            stroke="currentColor"
                                            strokeWidth="1.25"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"></path>
                                    </svg>
                                </Rad>
                            </div>
                        </fieldset>
                    ) : null}

                    {commonConf.font !== undefined ? (
                        <fieldset className="flex flex-col">
                            <legend>Font family</legend>
                            <div className="flex gap-2 w-full">
                                <Rad
                                    onChange={handleFontFamily}
                                    name="font-family"
                                    value={FontTypeOptions.hand}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <g strokeWidth="1.25">
                                            <path
                                                clipRule="evenodd"
                                                d="m7.643 15.69 7.774-7.773a2.357 2.357 0 1 0-3.334-3.334L4.31 12.357a3.333 3.333 0 0 0-.977 2.357v1.953h1.953c.884 0 1.732-.352 2.357-.977Z"></path>
                                            <path d="m11.25 5.417 3.333 3.333"></path>
                                        </g>
                                    </svg>
                                </Rad>
                                <Rad
                                    onChange={handleFontFamily}
                                    name="font-family"
                                    value={FontTypeOptions.code}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <g
                                            clipPath="url(#a)"
                                            stroke="currentColor"
                                            strokeWidth="1.25"
                                            strokeLinecap="round"
                                            strokeLinejoin="round">
                                            <path d="M5.833 6.667 2.5 10l3.333 3.333M14.167 6.667 17.5 10l-3.333 3.333M11.667 3.333 8.333 16.667"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="a">
                                                <path
                                                    fill="#fff"
                                                    d="M0 0h20v20H0z"></path>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </Rad>
                                <Rad
                                    onChange={handleFontFamily}
                                    name="font-family"
                                    value={FontTypeOptions.minecraft}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <g
                                            stroke="currentColor"
                                            strokeWidth="1.25"
                                            strokeLinecap="round"
                                            strokeLinejoin="round">
                                            <path d="M5.833 16.667v-10a3.333 3.333 0 0 1 3.334-3.334h1.666a3.333 3.333 0 0 1 3.334 3.334v10M5.833 10.833h8.334"></path>
                                        </g>
                                    </svg>
                                </Rad>
                            </div>
                        </fieldset>
                    ) : null}

                    {commonConf.fillStyle !== undefined ? (
                        <fieldset className="flex flex-col">
                            <legend>Fill Style</legend>
                            <div className="flex gap-2 w-full">
                                <Rad
                                    name="fill-style"
                                    value="solid"
                                    onChange={handleFillStyle}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <g clipPath="url(#a)">
                                            <path
                                                d="M4.91 2.625h10.18a2.284 2.284 0 0 1 2.285 2.284v10.182a2.284 2.284 0 0 1-2.284 2.284H4.909a2.284 2.284 0 0 1-2.284-2.284V4.909a2.284 2.284 0 0 1 2.284-2.284Z"
                                                stroke="currentColor"
                                                strokeWidth="1.25"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="a">
                                                <path
                                                    fill="#fff"
                                                    d="M0 0h20v20H0z"></path>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </Rad>
                                <Rad
                                    onChange={handleFillStyle}
                                    value="zigzag"
                                    name="fill-style">
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="white"
                                        strokeLinecap="round"
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
                                </Rad>
                                <Rad
                                    onChange={handleFillStyle}
                                    value="dots"
                                    name="fill-style">
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="white"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <g clipPath="url(#a)">
                                            <path
                                                d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
                                                stroke="white"
                                                strokeWidth="1.25"></path>
                                            <mask
                                                id="FillCrossHatchIcon"
                                                maskUnits="userSpaceOnUse"
                                                x="-1"
                                                y="-1"
                                                width="22"
                                                height="22"
                                                style={{ maskType: "alpha" }}>
                                                <path
                                                    d="M2.426 15.044 15.044 2.426M7.383 20 20 7.383M0 12.617 12.617 0m-7.98 17.941L17.256 5.324m-2.211 12.25L2.426 4.956M20 12.617 7.383 0m5.234 20L0 7.383m17.941 7.98L5.324 2.745"
                                                    stroke="currentColor"
                                                    strokeWidth="1.25"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"></path>
                                            </mask>
                                            <g mask="url(#FillCrossHatchIcon)">
                                                <path
                                                    d="M14.121 2H5.88A3.879 3.879 0 0 0 2 5.879v8.242A3.879 3.879 0 0 0 5.879 18h8.242A3.879 3.879 0 0 0 18 14.121V5.88A3.879 3.879 0 0 0 14.121 2Z"
                                                    fill="currentColor"></path>
                                            </g>
                                        </g>
                                        <defs>
                                            <clipPath id="a">
                                                <path
                                                    fill="#fff"
                                                    d="M0 0h20v20H0z"></path>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </Rad>
                            </div>
                        </fieldset>
                    ) : null}

                    {/* todo add option text align */}
                    <fieldset className="flex flex-col gap-2">
                        <legend>Text Align</legend>
                        <div className="flex gap-2 w-full">
                            <Rad
                                value="left"
                                name="text-align"
                                onChange={handleTextAlign}>
                                <svg
                                    aria-hidden="true"
                                    focusable="false"
                                    role="img"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <g
                                        stroke="currentColor"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2">
                                        <path
                                            stroke="none"
                                            d="M0 0h24v24H0z"
                                            fill="none"></path>
                                        <line
                                            x1="4"
                                            y1="8"
                                            x2="20"
                                            y2="8"></line>
                                        <line
                                            x1="4"
                                            y1="12"
                                            x2="12"
                                            y2="12"></line>
                                        <line
                                            x1="4"
                                            y1="16"
                                            x2="16"
                                            y2="16"></line>
                                    </g>
                                </svg>
                            </Rad>
                            <Rad
                                onChange={handleTextAlign}
                                value="center"
                                name="text-align">
                                <svg
                                    aria-hidden="true"
                                    focusable="false"
                                    role="img"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <g
                                        stroke="currentColor"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <path
                                            stroke="none"
                                            d="M0 0h24v24H0z"
                                            fill="none"></path>
                                        <line
                                            x1="4"
                                            y1="8"
                                            x2="20"
                                            y2="8"></line>
                                        <line
                                            x1="8"
                                            y1="12"
                                            x2="16"
                                            y2="12"></line>
                                        <line
                                            x1="6"
                                            y1="16"
                                            x2="18"
                                            y2="16"></line>
                                    </g>
                                </svg>
                            </Rad>
                            <Rad
                                value="right"
                                name="text-align"
                                onChange={handleTextAlign}>
                                <svg
                                    aria-hidden="true"
                                    focusable="false"
                                    role="img"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <g
                                        stroke="currentColor"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <path
                                            stroke="none"
                                            d="M0 0h24v24H0z"
                                            fill="none"></path>
                                        <line
                                            x1="4"
                                            y1="8"
                                            x2="20"
                                            y2="8"></line>
                                        <line
                                            x1="10"
                                            y1="12"
                                            x2="20"
                                            y2="12"></line>
                                        <line
                                            x1="8"
                                            y1="16"
                                            x2="20"
                                            y2="16"></line>
                                    </g>
                                </svg>
                            </Rad>
                        </div>
                    </fieldset>

                    {commonConf.strokeWidth !== undefined ? (
                        <fieldset className="flex flex-col gap-2">
                            <legend>Stroke Width</legend>
                            <div className="flex gap-2 w-full">
                                <Rad
                                    value={1}
                                    name="stroke-width"
                                    onChange={handleStrokeWidth}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="white"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <path
                                            d="M4.167 10h11.666"
                                            stroke="white"
                                            strokeWidth="1.25"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"></path>
                                    </svg>
                                </Rad>
                                <Rad
                                    value={3}
                                    name="stroke-width"
                                    onChange={handleStrokeWidth}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="white"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <path
                                            d="M4.167 10h11.666"
                                            stroke="white"
                                            strokeWidth="1.25"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"></path>
                                    </svg>
                                </Rad>
                                <Rad
                                    value={6}
                                    name="stroke-width"
                                    onChange={handleStrokeWidth}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="white"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <path
                                            d="M5 10h10"
                                            stroke="white"
                                            strokeWidth="3.75"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"></path>
                                    </svg>
                                </Rad>
                            </div>
                        </fieldset>
                    ) : null}

                    {commonConf.strokeLineDash !== undefined ? (
                        <fieldset className="flex flex-col">
                            <legend>Stroke style</legend>
                            <div className="flex gap-2">
                                <Rad
                                    value={1}
                                    name="stroke-style"
                                    onChange={handleStrokeLineDash}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 20 20"
                                        className=""
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <path
                                            d="M4.167 10h11.666"
                                            stroke="currentColor"
                                            strokeWidth="1.25"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"></path>
                                    </svg>
                                </Rad>
                                <Rad
                                    onChange={handleStrokeLineDash}
                                    name="stroke-style"
                                    value={3}>
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 24 24"
                                        className=""
                                        fill="none"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <g strokeWidth="2">
                                            <path
                                                stroke="none"
                                                d="M0 0h24v24H0z"
                                                fill="none"></path>
                                            <path d="M5 12h2"></path>
                                            <path d="M17 12h2"></path>
                                            <path d="M11 12h2"></path>
                                        </g>
                                    </svg>
                                </Rad>
                            </div>
                        </fieldset>
                    ) : null}
                    {commonConf.opacity !== undefined ? (
                        <label className="flex flex-col gap-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Opacity
                            <input
                                id="opacity"
                                type="range"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                min={0}
                                max={1}
                                step={0.1}
                                onChange={handleOpacityChange}
                            />
                        </label>
                    ) : null}
                    <button
                        onClick={handleDeleteOnClick}
                        className="h-12 w-12 cursor-pointer sm:w-14 hover:bg-primary-400 rounded-xl">
                        <MdDeleteOutline className="m-auto text-xl text-text-700" />
                    </button>
                </div>
            </div>
        </>
    );
}
