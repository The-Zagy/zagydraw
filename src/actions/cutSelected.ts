import { ActionDeleteSelected } from "./deleteSelected";
import { ActionExportScene, DestOpts } from "./copySelected";
import { UndoableCommand } from "./types";

export class ActionCutSelected extends UndoableCommand {
    #deleteAction!: ActionDeleteSelected;

    public execute() {
        // the cut action can be seen as copy action then delete action
        new ActionExportScene(DestOpts.CLIPBOARD, true).execute();
        this.#deleteAction = new ActionDeleteSelected();
        this.#deleteAction.execute();
        return;
    }

    public undo() {
        // copy has no undo, so the undo functionality is all upon delete action
        this.#deleteAction.undo();
    }
}
