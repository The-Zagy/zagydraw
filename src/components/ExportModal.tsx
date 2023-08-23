import { Image } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { BsDownload } from "react-icons/bs";
import { FiCopy } from "react-icons/fi";
// import { Switch } from "./form/switch";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ActionExportScene, ExportOpeions, ExportTypes } from "@/actions/export";
import { commandManager } from "@/actions/commandManager";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import useKeyboardShortcut from "@/hooks/useShortcut";

export function ExportModal() {
    /**
     * reference to the preview canvas
     */
    const canvas = useRef<HTMLCanvasElement>(null);
    const [exportOptions, setExportOptions] = useState<ExportOpeions>({
        background: true,
        onlySelected: false,
    });
    /**
     * control is the modal open or not, only want to control the modal with shortcut
     */
    const [isOpen, setIsOpen] = useState(false);
    useKeyboardShortcut(
        {
            onShortcut: () => setIsOpen(true),
            orderMatters: true,
        },
        "ControlLeft",
        "ShiftLeft",
        "e"
    );

    useEffect(() => {
        if (canvas.current) ActionExportScene.showPreview(canvas.current, exportOptions);
    }, [exportOptions]);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                // hack to get canvas ref after content load
                setTimeout(() => {
                    if (open && canvas.current) {
                        ActionExportScene.showPreview(canvas.current, exportOptions);
                    }
                }, 0);
            }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="fixed bottom-4 right-20">
                    <Image size={35} />
                </Button>
            </DialogTrigger>
            <DialogContent className="flex h-full w-full cursor-auto flex-wrap justify-between gap-5 overflow-y-auto  md:h-4/6 md:w-2/4   ">
                {/* preview */}
                <div className="previewExport  bg-checkerboard relative  h-full w-full rounded-xl border-2 border-gray-600  lg:w-3/6">
                    <canvas
                        ref={canvas}
                        className="absolute left-0 top-0 h-full w-full touch-none object-contain"
                    />
                </div>

                {/* settings */}
                <div className="exportSettings  flex h-2/3 w-full flex-col gap-7 md:h-full lg:w-2/5">
                    <h1 className="mb-4 line-clamp-3 py-3 text-4xl">Export Canvas</h1>
                    <div className="flex w-full justify-between ">
                        <Label htmlFor="exportSelected" className="text-xl ">
                            Only selected
                        </Label>
                        <Switch
                            id="exportSelected"
                            defaultChecked={exportOptions.onlySelected}
                            onCheckedChange={(checked) => {
                                setExportOptions((prev) => ({
                                    ...prev,
                                    onlySelected: checked,
                                }));
                            }}
                        />
                    </div>
                    <div className="flex w-full justify-between">
                        <Label htmlFor="exportBg" className=" text-xl ">
                            Background
                        </Label>
                        <Switch
                            id="exportBg"
                            defaultChecked={exportOptions.background}
                            onCheckedChange={(checked) => {
                                setExportOptions((prev) => ({
                                    ...prev,
                                    background: checked,
                                }));
                            }}
                        />
                    </div>
                    <div className="m-auto flex w-full flex-wrap justify-center gap-5">
                        {/* PNG */}
                        <Button
                            onClick={() =>
                                commandManager.executeCommand(
                                    new ActionExportScene(ExportTypes.PNG)
                                )
                            }
                            className="bg-background-800 m-auto flex w-fit justify-between gap-4 rounded-lg p-4 text-white">
                            <BsDownload size={20} className="text-white" />
                            <span>PNG</span>
                        </Button>
                        {/* TODO SVG */}
                        {/* <button
                            onClick={() =>
                                commandManager.executeCommand(
                                    new ActionExportScene(ExportTypes.SVG)
                                )
                            }
                            className="bg-background-800 m-auto flex w-fit justify-between gap-4 rounded-lg p-4 text-white">
                            <BsDownload size={20} className="m-auto text-white" />
                            <span>SVG</span>
                        </button> */}
                        {/* Clipboard */}
                        <Button
                            onClick={() =>
                                commandManager.executeCommand(
                                    new ActionExportScene(ExportTypes.COPY)
                                )
                            }
                            className="bg-background-800 m-auto flex w-fit justify-between gap-4 rounded-lg p-4 text-white">
                            <FiCopy size={20} className="text-white" />
                            <span>Copy to Clipboard</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
