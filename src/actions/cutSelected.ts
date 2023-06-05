import { ActionDeleteSelected } from "./deleteSelected";
import { ActionCopySelected } from "./copySelected";
import { UndoableCommand } from "./types";

export class ActionCutSelected extends UndoableCommand {
    #deleteAction!: ActionDeleteSelected;

    public execute() {
        // the cut action can be seen as copy action then delete action
        new ActionCopySelected().execute();
        this.#deleteAction = new ActionDeleteSelected();
        this.#deleteAction.execute();
        return;
    }

    public undo() {
        // copy has no undo, so the undo functionality is all upon delete action
        this.#deleteAction.undo();
    }
}
