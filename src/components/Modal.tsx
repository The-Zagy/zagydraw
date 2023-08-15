import React from "react";
import { RiCloseLine } from "react-icons/ri";

export type ModalProps = {
    // give the parent component the ability to control the dialog directly
    dialogRef: React.RefObject<HTMLDialogElement>;
    /**
     * normally need to be the body and the footer of the form
     */
    children: React.ReactNode;
    buttonChildren: React.ReactNode;
    buttonAttrs: React.HTMLAttributes<HTMLButtonElement> &
        React.ButtonHTMLAttributes<HTMLButtonElement>;
    runBeforeOpen?: () => void;
    dialogAttrs: React.HTMLAttributes<HTMLDialogElement> &
        React.DialogHTMLAttributes<HTMLDialogElement>;
};

/**
 * for now all use cases for dialog included form, and that form includes header, body, footer(utils) so this custom modal will contain the header ready with close, and the user of this modal need to provide the body and the footer
 * @param props
 * @returns
 */
export function Modal(props: ModalProps) {
    // control modal
    function openModal() {
        if (props.dialogRef.current === null) return;
        props.dialogRef.current.showModal();
    }

    function closeModal() {
        if (props.dialogRef.current === null) return;
        props.dialogRef.current.close("close");
    }

    return (
        <>
            <button
                onClick={() => {
                    if (props.runBeforeOpen) {
                        props.runBeforeOpen();
                    }
                    openModal();
                }}
                {...props.buttonAttrs}>
                {props.buttonChildren}
            </button>
            <dialog
                onClick={(e) => {
                    // close the modal when click outside the dialog content
                    // the content now is all wraped by form, that's make it easy to inspect
                    // the "nodeName" and if it's === 'dialog' no way this is inside the dialog
                    if ((e.target as HTMLDialogElement).nodeName === "DIALOG") {
                        closeModal();
                    }
                }}
                ref={props.dialogRef}
                {...props.dialogAttrs}
                className="bg-primary-600 relative h-full w-11/12 cursor-auto rounded p-10 shadow-2xl md:h-4/6 md:w-4/5">
                <button
                    type="button"
                    onClick={closeModal}
                    className="absolute right-2 top-2 text-white">
                    <RiCloseLine className="text-2xl " />
                </button>
                {props.children}
            </dialog>
        </>
    );
}
