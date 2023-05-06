import ToolbarLeft from "./ToolbarLeft";
import ToolbarUpper from "./ToolbarUpper";
import ZagyDraw from "./ZagyDraw";
import { IconContext } from "react-icons";

export default function App() {
    return (
        <div className="box-border">
            <IconContext.Provider value={{}}>
                <ToolbarUpper />
                <ToolbarLeft />
            </IconContext.Provider>
            <ZagyDraw />
        </div>
    );
}
