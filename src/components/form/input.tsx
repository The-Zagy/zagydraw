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
            className="dark:text-text-800 mb-2 block bg-transparent text-sm font-medium text-gray-900"
            {...props.labelProps}>
            {props.labelName}
            <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-transparent px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-transparent dark:text-gray-400">
                    #
                </span>
                <input
                    className="dark:text-text-600 block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-transparent p-2.5 text-sm text-gray-900 focus:border-blue-500  focus:ring-blue-500 dark:border-gray-600 dark:bg-transparent dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    {...props.inputProps}
                />
            </div>
        </label>
    );
};

export default InputWithIcon;
