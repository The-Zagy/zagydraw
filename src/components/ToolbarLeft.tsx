import { useStore } from "store/index";
import { CanvasRectElement } from "types/general";
import InputWithIcon from "./form/input";

const ToolbarLine = () => {
    return <div className=""></div>;
};

const ToolbarRect: React.FC<{ rect: CanvasRectElement }> = (props) => {
    const { setElements } = useStore.getState();
    return (
        <div className="flex flex-col gap-3 p-3 text-white">
            <InputWithIcon
                labelName={"Stroke"}
                inputProps={{
                    type: "text",
                    defaultValue: props.rect.options.stroke,
                    onKeyDown(e) {
                        if (e.key === "Enter") {
                            props.rect.options.stroke = (
                                e.target as HTMLInputElement
                            ).value;
                            setElements((prev) => [
                                ...prev.filter(
                                    (val) => val.id !== props.rect.id
                                ),
                                props.rect
                            ]);
                        }
                    }
                }}
            />
            <InputWithIcon
                labelName={"Fill"}
                inputProps={{
                    type: "text",
                    defaultValue: props.rect.options.fill,
                    onKeyDown(e) {
                        if (e.key === "Enter") {
                            props.rect.options.fill = (
                                e.target as HTMLInputElement
                            ).value;
                            setElements((prev) => [
                                ...prev.filter(
                                    (val) => val.id !== props.rect.id
                                ),
                                props.rect
                            ]);
                        }
                    }
                }}
            />
            <label>
                fill style
                <select
                    className="text-black"
                    defaultValue={props.rect.options.fillStyle}
                    onChange={(e) => {
                        // todo => not working guess i need to regenrate shape
                        props.rect.options.fillStyle = e.target.value;
                        setElements((prev) => [
                            ...prev.filter((val) => val.id !== props.rect.id),
                            props.rect
                        ]);
                    }}
                >
                    <option value="solid">Solid</option>
                    <option value="zigzag">Zigzag</option>
                    <option value="dots">dots</option>
                    <option value="hachure">hachure</option>
                </select>
            </label>
        </div>
    );
};

export default function ToolbarLeft() {
    const selectedElements = useStore((state) => state.selectedElements);
    console.log(
        "🪵 [ToolbarLeft.tsx:58] ~ token ~ \x1b[0;32mselectedElements\x1b[0m = ",
        selectedElements
    );

    if (selectedElements.length == 0) {
        return;
    }

    return (
        <>
            <div className="scrollbar-thin scrollbar-thumb-zinc-600 fixed left-2 top-10 h-3/5 w-1/5 overflow-auto  whitespace-nowrap  rounded-md bg-zinc-800 sm:m-0 sm:w-auto sm:max-w-none">
                <div className="mx-auto w-fit">
                    {/* TODO fix as */}
                    {selectedElements[0].shape === "rectangle" && (
                        <ToolbarRect
                            rect={selectedElements[0] as CanvasRectElement}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
