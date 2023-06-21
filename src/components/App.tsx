import { commandManager } from "actions/commandManager";
import ToolbarLeft from "./ToolbarLeft";
import ToolbarUpper from "./ToolbarUpper";
import ZagyDraw from "./ZagyDraw/ZagyDraw";
import { IconContext } from "react-icons";
import { MdUndo } from "react-icons/md";

export default function App() {
    return (
        <div className="box-border">
            <IconContext.Provider value={{}}>
                <ToolbarUpper />
                <ToolbarLeft />
                <button
                    id="undo-button"
                    className="bg-primary-600 fixed bottom-4 left-4 h-fit w-fit  rounded-lg p-2"
                    onClick={() => {
                        commandManager.undoCommand();
                        return;
                    }}>
                    <MdUndo size={35} className="m-auto text-white" />
                </button>
            </IconContext.Provider>
            <ZagyDraw />
        </div>
    );
}
