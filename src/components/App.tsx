import ToolbarUpper from "./ToolbarUpper";
import ZagyDraw from "./ZagyDraw";
import { IconContext } from "react-icons";

export default function App() {
    return (
        <div className="box-border">
            <IconContext.Provider value={{}}>
                <ToolbarUpper />
            </IconContext.Provider>
            <ZagyDraw />
        </div>
    );
}
