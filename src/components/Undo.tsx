import { MdUndo } from "react-icons/md";
import { commandManager } from "@/actions/commandManager";
import useKeyboardShortcut from "@/hooks/useShortcut";
import { Button } from "@/components/ui/button";

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
        <Button
            data-testid="undo-button"
            variant={"outline"}
            size={"icon"}
            className=" invisible fixed bottom-4 right-4 h-fit  md:visible"
            onClick={() => {
                commandManager.undoCommand();
                return;
            }}>
            <MdUndo size={35} />
        </Button>
    );
}
