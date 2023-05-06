const ToolbarLine = () => {
    return <div className=""></div>;
};
const ToolbarRect = () => {
    return <div className=""></div>;
};
export default function ToolbarLeft() {
    return (
        <div className="fixed left-0 top-1/4 z-50 flex h-auto w-8 flex-col items-center justify-between overflow-auto rounded-md bg-zinc-800">
            <ToolbarLine />
        </div>
    );
}
