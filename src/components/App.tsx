import { IconContext } from "react-icons";

import { useIsMobile } from "hooks";
import ToolbarLeft from "./ToolbarElementConfig";
import ToolbarUpper from "./ToolbarUpper";
import ZagyDraw from "./ZagyDraw";
import Undo from "./Undo";
import ToolbarLower from "./ToolbarLower";

export default function App() {
    useIsMobile();
    return (
        <div className="box-border">
            <IconContext.Provider value={{}}>
                <ToolbarUpper />
                <ToolbarLeft />
                <ToolbarLower />
            </IconContext.Provider>
            <Undo />
            <ZagyDraw />
        </div>
    );
}
