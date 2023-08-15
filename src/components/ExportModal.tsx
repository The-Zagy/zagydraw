import { useStore } from "store/index";
import React, { useEffect, useRef, useState } from "react";
import { commandManager } from "actions/commandManager";
import { ActionExportScene, ExportOpeions, ExportTypes } from "actions/export";
import { RxImage } from "react-icons/rx";
import { BsDownload } from "react-icons/bs";
import { FiCopy } from "react-icons/fi";
import { Modal } from "./Modal";
import { Switch } from "./form/switch";

export function ExportModal() {
    const { selectedElements } = useStore.getState();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [exportOptions, setExportOptions] = useState<ExportOpeions>({
        background: true,
        onlySelected: selectedElements.length > 0,
    });

    useEffect(() => {
        if (canvas.current) ActionExportScene.showPreview(canvas.current, exportOptions);
    }, [exportOptions]);

    return (
        <Modal
            buttonAttrs={{
                className:
                    "bg-primary-600 invisible fixed bottom-4 right-20 h-fit w-fit rounded-lg  p-2 md:visible",
            }}
            buttonChildren={<RxImage size={35} className="m-auto text-white" />}
            dialogAttrs={{}}
            runBeforeOpen={() => {
                if (canvas.current) ActionExportScene.showPreview(canvas.current, exportOptions);
            }}
            dialogRef={dialogRef}>
            <div className="flex  h-full w-full flex-wrap  justify-between gap-5 overflow-y-auto">
                {/* preview */}
                <div className="previewExport  relative  h-full w-full rounded-xl border-2 border-gray-600  lg:w-3/6">
                    <canvas
                        ref={canvas}
                        className="absolute left-0 top-0 h-full w-full touch-none object-contain"
                    />
                </div>

                {/* settings */}
                <div className="exportSettings  flex h-2/3 w-full flex-col gap-7 md:h-full lg:w-2/5">
                    <h1 className="mb-4 line-clamp-3 py-3 text-4xl text-white">Export Image</h1>
                    <div className="flex w-full justify-between ">
                        <label className="flex text-white">only selected</label>
                        <Switch
                            defaultChecked={exportOptions.onlySelected}
                            onChange={() => {
                                setExportOptions((prev) => ({
                                    ...prev,
                                    onlySelected: !prev.onlySelected,
                                }));
                            }}
                        />
                    </div>
                    <div className="flex w-full justify-between">
                        <label htmlFor="exportBg" className=" text-white">
                            Background
                        </label>
                        <Switch
                            id="exportBg"
                            defaultChecked={exportOptions.background}
                            onChange={() => {
                                setExportOptions((prev) => ({
                                    ...prev,
                                    background: !prev.background,
                                }));
                            }}
                        />
                    </div>
                    <div className="m-auto flex w-full flex-wrap justify-center gap-5">
                        {/* PNG */}
                        <button
                            onClick={() =>
                                commandManager.executeCommand(
                                    new ActionExportScene(ExportTypes.PNG)
                                )
                            }
                            className="bg-background-800 m-auto flex w-fit justify-between gap-4 rounded-lg p-4 text-white">
                            <BsDownload size={20} className="m-auto text-white" />
                            <span>PNG</span>
                        </button>
                        {/* SVG */}
                        <button
                            onClick={() =>
                                commandManager.executeCommand(
                                    new ActionExportScene(ExportTypes.SVG)
                                )
                            }
                            className="bg-background-800 m-auto flex w-fit justify-between gap-4 rounded-lg p-4 text-white">
                            <BsDownload size={20} className="m-auto text-white" />
                            <span>SVG</span>
                        </button>
                        {/* Clipboard */}
                        <button
                            onClick={() =>
                                commandManager.executeCommand(
                                    new ActionExportScene(ExportTypes.COPY)
                                )
                            }
                            className="bg-background-800 m-auto flex w-fit justify-between gap-4 rounded-lg p-4 text-white">
                            <FiCopy size={20} className="m-auto text-white" />
                            <span>Copy to Clipboard</span>
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
