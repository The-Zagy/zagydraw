import { useEffect, useState } from "react";

type MultiPhaseEventConstituent<TLocalState, K extends keyof HTMLElementEventMap> = {
    event: K;
    callback: MultiPhaseEventConstituentCallback<TLocalState, K>;
    options?: AddEventListenerOptions | boolean;
};
type MultiPhaseEventConstituentCallback<TLocalState, K extends keyof HTMLElementEventMap> = (
    event: HTMLElementEventMap[K],
    localState: TLocalState,

    setLocalState: React.Dispatch<React.SetStateAction<TLocalState>>
) => void;
class MultiphaseEvent<
    TLocalState extends Record<string, unknown>,
    TEventTypes extends readonly (keyof HTMLElementEventMap)[]
> {
    name: string;
    private events: [
        ...{ [I in keyof TEventTypes]: MultiPhaseEventConstituent<TLocalState, TEventTypes[I]> }
    ];
    private callbacks: [
        ...{
            [I in keyof TEventTypes]: (
                event: HTMLElementEventMap[TEventTypes[I]]
            ) => MultiPhaseEventConstituentCallback<TLocalState, TEventTypes[I]>;
        }
    ];

    private localState: TLocalState;

    element: HTMLElement;
    constructor(
        name: string,
        localState: TLocalState,
        setLocalState: React.Dispatch<React.SetStateAction<TLocalState>>,
        events: [
            ...{
                [I in keyof TEventTypes]: MultiPhaseEventConstituent<TLocalState, TEventTypes[I]>;
            }
        ],
        element: HTMLElement
    ) {
        this.name = name;
        this.localState = localState;

        this.events = events;
        this.element = element;
        this.callbacks = [] as typeof this.callbacks;
        for (const event of events) {
            const { callback } = event;
            const myFunc = (e: Parameters<typeof callback>["0"]) => {
                return event.callback(e, this.localState, setLocalState);
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.callbacks = [...this.callbacks, myFunc] as any;
            element.addEventListener(event.event, myFunc, event.options);
        }
    }
    destory() {
        let i = 0;
        for (const event of this.events)
            this.element.removeEventListener(event.event, this.callbacks[i++], event.options);
    }
}

const useMultiPhaseEvent = <
    TLocalState extends Record<string, unknown>,
    TEventTypes extends readonly (keyof HTMLElementEventMap)[]
>(
    name: string,
    sharedState: TLocalState,
    events: [
        ...{
            [I in keyof TEventTypes]: MultiPhaseEventConstituent<TLocalState, TEventTypes[I]>;
        }
    ],
    element: HTMLElement | null
) => {
    const [localState, setLocalState] = useState<TLocalState>(sharedState);
    useEffect(() => {
        if (!element) return;
        const event = new MultiphaseEvent(
            name,
            localState,

            setLocalState,
            events,
            element
        );
        return () => {
            event.destory();
        };
    }, [element, events, localState, name, setLocalState]);
};

export default useMultiPhaseEvent;
