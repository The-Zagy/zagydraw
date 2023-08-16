import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { AiOutlineMenu } from "react-icons/ai";
import { RiGithubLine } from "react-icons/ri";
import { HiOutlineTrash } from "react-icons/hi";
import { commandManager } from "actions/commandManager";
import { ActionClearCanvas } from "actions/resetCanvas";

export function DropDown() {
    return (
        <div className="fixed bottom-16 left-2 w-56  text-right md:left-2 md:top-2">
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="focus-visible:ring-opacity/75 hover:bg-opacity/30 bg-opacity/20 bg-primary-600 inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                        <AiOutlineMenu
                            className="-mr-1 ml-2 h-5 w-5 text-white hover:text-violet-100"
                            aria-hidden="true"
                        />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="ring-opacity/5 bg-primary-600 absolute left-0 mt-2 w-56 origin-top-left divide-y divide-gray-600 rounded-md shadow-lg ring-1 ring-black focus:outline-none">
                        <div className="p-1 ">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() =>
                                            commandManager.executeCommand(new ActionClearCanvas())
                                        }
                                        className={`${
                                            active ? "bg-violet-500 text-white" : "text-gray-500"
                                        } group flex w-full items-center rounded-md p-2 text-sm`}>
                                        <HiOutlineTrash
                                            className="mr-2 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                        Reset the canvas
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                        <div className="p-1 ">
                            <Menu.Item>
                                {({ active }) => (
                                    <a
                                        href="https://github.com/The-Zagy/zagydraw"
                                        target="_blank"
                                        className={`${
                                            active ? "bg-violet-500 text-white" : "text-gray-500"
                                        } group flex w-full items-center rounded-md p-2 text-sm`}
                                        rel="noreferrer">
                                        <RiGithubLine className="mr-2 h-5 w-5" aria-hidden="true" />
                                        Github
                                    </a>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
}
