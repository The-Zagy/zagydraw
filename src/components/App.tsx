import { IconContext } from "react-icons";

import ToolbarLeft from "./ToolbarElementConfig";
import ToolbarUpper from "./ToolbarUpper";
import ZagyDraw from "./ZagyDraw";
import Undo from "./Undo";
import ToolbarLower from "./ToolbarLower";
import { ExportModal } from "./ExportModal";
import { DropDown } from "./DropDown";
import { useIsMobile } from "@/hooks";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
    useIsMobile();

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="box-border">
                <IconContext.Provider value={{}}>
                    <ToolbarUpper />
                    <ToolbarLeft />
                    <ToolbarLower />
                    <ExportModal />
                </IconContext.Provider>
                <Undo />
                <DropDown />
                <ZagyDraw />
            </div>
        </ThemeProvider>
    );
}
