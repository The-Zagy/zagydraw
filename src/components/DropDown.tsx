import { Trash2, Github, Keyboard, Menu, Save, File, AlertTriangle } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import { commandManager } from "@/actions/commandManager";
import { ActionClearCanvas } from "@/actions/resetCanvas";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ActionExportScene, DestOpts } from "@/actions/ExportScene";

function ResetCanvasAlert() {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Reset The Canvas</span>
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will delete all content from the canvas
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => commandManager.executeCommand(new ActionClearCanvas())}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function SaveToDialog() {
    return (
        <Dialog>
            {/*FIX: open dialog/alert dialog inside dropdown or context menu
  @url https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
  */}
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Save className="mr-2 h-4 w-4" />
                    Save To
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="h-full w-full cursor-auto md:h-4/6 md:w-3/4   ">
                <DialogHeader>
                    <DialogTitle>Save To</DialogTitle>
                </DialogHeader>
                <div className="flex h-full w-full flex-wrap justify-center gap-5 overflow-y-auto">
                    <div className="flex h-full w-2/5 flex-col items-center gap-5 border p-5">
                        <div className="h-16 w-fit">
                            <Save className="rounded-full border-2 p-2 " size={75} />
                        </div>
                        <h2 className="text-4xl font-bold">Save To Disk</h2>
                        <span className="h-20">
                            Export the scene data to a file from which you can import later.
                        </span>
                        <Button
                            variant={"default"}
                            onClick={() =>
                                commandManager.executeCommand(
                                    new ActionExportScene(DestOpts["JSON"], false),
                                )
                            }>
                            Save to file
                        </Button>
                    </div>

                    <div className="flex h-full w-2/5 flex-col items-center gap-5 border p-5">
                        <div className="h-16 w-fit">
                            <span className="rounded-full border-2 p-2 text-4xl ">Z+</span>
                        </div>
                        <h2 className="text-4xl font-bold">Save To Z+</h2>
                        <span className="h-20">Save On The Cloud</span>
                        <Button disabled={true} variant={"default"}>
                            UNDER CONSTRUCTION
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function OpenSceneDialog() {
    return (
        <Dialog>
            {/*FIX: open dialog/alert dialog inside dropdown or context menu
  @url https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
  */}
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <File className="mr-2 h-4 w-4" />
                    Open
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="h-full w-full cursor-auto md:h-4/6 md:w-3/4">
                <DialogHeader>
                    <DialogTitle>Load From File</DialogTitle>
                </DialogHeader>
                <div className="flex h-full w-full flex-wrap justify-center gap-5 overflow-y-auto">
                    <div className="flex w-full flex-col gap-3 bg-yellow-100 md:flex-row">
                        <p className="flex h-fit w-fit items-center justify-center rounded-full border-2 bg-yellow-400 text-4xl text-black">
                            <AlertTriangle />
                        </p>
                        <p className="shrink text-gray-500">
                            Loading from a file will{" "}
                            <span className="font-bold">replace your existing content.</span>
                            You can back up your drawing first using one of the options below.
                        </p>
                        <Button variant="default" className="w-content bg-yellow-400 text-black">
                            Load From File
                        </Button>
                    </div>

                    {/* EXPORT OPTIONS  */}
                    <div className="flex w-2/5 flex-col items-center gap-5 border p-5">
                        <h2 className="text-4xl font-bold">Save To Disk</h2>
                        <span className="h-20">
                            Export the scene data to a file from which you can import later.
                        </span>
                        <Button
                            variant={"default"}
                            onClick={() =>
                                commandManager.executeCommand(
                                    new ActionExportScene(DestOpts["JSON"], false),
                                )
                            }>
                            Save to file
                        </Button>
                    </div>

                    <div className="flex  w-2/5 flex-col items-center gap-5 border p-5">
                        <h2 className="text-4xl font-bold">Save To Z+</h2>
                        <span className="h-20">Save On The Cloud</span>
                        <Button disabled={true} variant={"default"}>
                            UNDER CONSTRUCTION
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function DropDown() {
    return (
        <div className="fixed left-2 top-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon">
                        <Menu />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuGroup>
                        {/*
                         * check @url https://github.com/radix-ui/primitives/issues/1836
                         * to solve open modal in menu
                         */}
                        {/* <DropdownMenuItem>
                            <Image className="mr-2 h-4 w-4" />
                            <span>Export Image</span>
                        </DropdownMenuItem> */}
                        <OpenSceneDialog />
                        <SaveToDialog />
                        <ResetCanvasAlert />
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <Keyboard className="mr-2 h-4 w-4" />
                            <span>Keyboard shortcuts</span>
                            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <a
                            className="flex w-full"
                            target="_blank"
                            href="https://github.com/The-Zagy/zagydraw"
                            rel="noreferrer">
                            <Github className="mr-2 h-4 w-4" />
                            <span>GitHub</span>
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <ModeToggle />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
