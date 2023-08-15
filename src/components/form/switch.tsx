import React from "react";

export type FormSwitchProps = React.HTMLAttributes<HTMLInputElement>;

export function Switch(props: FormSwitchProps) {
    return (
        <>
            <label className="relative mr-5 inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" {...props} />
                <div className="peer-checked:bg-background-600 dark:peer-focus:ring-background-800 peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-purple-300 dark:border-gray-600 dark:bg-gray-700"></div>
            </label>
        </>
    );
}
