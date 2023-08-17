import { useMemo } from "react";
import { IconContext } from "react-icons";
import { BsFillPaletteFill } from "react-icons/bs";
import { MdUndo } from "react-icons/md";
import { commandManager } from "@/actions/commandManager";
import { useStore } from "@/store";
const { setIsToolbarElementConfigOpen } = useStore.getState();
const ToolbarLower = () => {
    const selectedElements = useStore((state) => state.selectedElements);
    const isToolbarElementConfigOpen = useStore((state) => state.isToolbarElementConfigOpen);
    const openToolbarELementConfigButton = useMemo(() => {
        if (selectedElements.length > 0) {
            return (
                <button
                    onClick={() => setIsToolbarElementConfigOpen(!isToolbarElementConfigOpen)}
                    className="flex h-10  w-full flex-col items-center justify-center">
                    <BsFillPaletteFill />
                </button>
            );
        }
        return null;
    }, [selectedElements.length, isToolbarElementConfigOpen]);
    return (
        <div className="bg-primary-600 fixed inset-x-0 bottom-2 mx-auto flex h-fit w-11/12 items-center justify-stretch rounded-lg p-2 md:invisible">
            <IconContext.Provider
                value={{
                    className: "fill-gray-300",
                    size: "1.5rem",
                }}>
                <button
                    className="flex  h-10 w-full flex-col items-center justify-center"
                    onClick={() => {
                        commandManager.undoCommand();
                    }}>
                    <MdUndo />
                </button>
                {openToolbarELementConfigButton}
            </IconContext.Provider>
        </div>
    );
};

export default ToolbarLower;
