import { useEffect } from "react";

type MultiPhaseEventConstituent<K extends keyof HTMLElementEventMap> = {
    event: K;
    callback: MultiPhaseEventConstituentCallback<K>;
    options?: AddEventListenerOptions | boolean;
};
type MultiPhaseEventConstituentCallback<K extends keyof HTMLElementEventMap> = (
    event: HTMLElementEventMap[K]
) => void;
class MultiphaseEvent<TEventTypes extends readonly (keyof HTMLElementEventMap)[]> {
    name: string;
    private events: [...{ [I in keyof TEventTypes]: MultiPhaseEventConstituent<TEventTypes[I]> }];
    private callbacks: [
        ...{
            [I in keyof TEventTypes]: (
                event: HTMLElementEventMap[TEventTypes[I]]
            ) => MultiPhaseEventConstituentCallback<TEventTypes[I]>;
        }
    ];

    element: HTMLElement;
    constructor(
        name: string,

        events: [
            ...{
                [I in keyof TEventTypes]: MultiPhaseEventConstituent<TEventTypes[I]>;
            }
        ],
        element: HTMLElement
    ) {
        this.name = name;

        this.events = events;
        this.element = element;
        this.callbacks = [] as typeof this.callbacks;
        for (const event of events) {
            const { callback } = event;
            const myFunc = (e: Parameters<typeof callback>["0"]) => {
                return event.callback(e);
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

const useMultiPhaseEvent = <TEventTypes extends readonly (keyof HTMLElementEventMap)[]>(
    name: string,

    events: [
        ...{
            [I in keyof TEventTypes]: MultiPhaseEventConstituent<TEventTypes[I]>;
        }
    ],
    element: HTMLElement | null
) => {
    useEffect(() => {
        if (!element) return;
        const event = new MultiphaseEvent(
            name,

            events,
            element
        );
        return () => {
            event.destory();
        };
    }, [element, events, name]);
};

export { useMultiPhaseEvent };
