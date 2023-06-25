import { IconContext } from "react-icons";

import ToolbarLeft from "./ToolbarLeft";
import ToolbarUpper from "./ToolbarUpper";
import ZagyDraw from "./ZagyDraw";
import Undo from "./undo";

export default function App() {
    return (
        <div className="box-border">
            <IconContext.Provider value={{}}>
                <ToolbarUpper />
                <ToolbarLeft />
            </IconContext.Provider>
            <Undo />
            <ZagyDraw />
        </div>
    );
}
