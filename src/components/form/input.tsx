import React from "react";

type Props = {
    labelName: string;
    labelProps?: React.DetailedHTMLProps<
        React.LabelHTMLAttributes<HTMLLabelElement>,
        HTMLLabelElement
    >;
    inputProps?: React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    >;
};

const InputWithIcon: React.FC<Props> = (props) => {
    return (
        <label
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-text-800 bg-transparent"
            {...props.labelProps}
        >
            {props.labelName}
            <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-transparent px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-transparent dark:text-gray-400">
                    #
                </span>
                <input
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-transparent p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-transparent dark:text-text-600 dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    {...props.inputProps}
                />
            </div>
        </label>
    );
};

export default InputWithIcon;
