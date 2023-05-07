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
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            {...props.labelProps}
        >
            {props.labelName}
            <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
                    #
                </span>
                <input
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    {...props.inputProps}
                />
            </div>
        </label>
    );
};

export default InputWithIcon;
