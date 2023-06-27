import { commandManager } from "actions/commandManager";
import useKeyboardShortcut from "hooks/useShortcut";
import { MdUndo } from "react-icons/md";
export default function Undo() {
    useKeyboardShortcut(
        {
            onShortcut: () => commandManager.undoCommand(),
            orderMatters: true,
        },
        "ControlLeft",
        "z"
    );
    return (
        <button
            data-testid="undo-button"
            className="bg-primary-600 fixed bottom-4 left-4 h-fit w-fit  rounded-lg p-2"
            onClick={() => {
                commandManager.undoCommand();
                return;
            }}>
            <MdUndo size={35} className="m-auto text-white" />
        </button>
    );
}
