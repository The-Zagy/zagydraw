import { MdUndo } from "react-icons/md";
import { commandManager } from "@/actions/commandManager";
import useKeyboardShortcut from "@/hooks/useShortcut";
export default function Undo() {
    useKeyboardShortcut(
        {
            onShortcut: () => commandManager.undoCommand(),
            orderMatters: true,
            continueWhilePressed: true,
        },
        "ControlLeft",
        "z"
    );
    return (
        <button
            data-testid="undo-button"
            className="bg-primary-600 invisible fixed bottom-4 right-4 h-fit w-fit rounded-lg  p-2 md:visible"
            onClick={() => {
                commandManager.undoCommand();
                return;
            }}>
            <MdUndo size={35} className="m-auto text-white" />
        </button>
    );
}
