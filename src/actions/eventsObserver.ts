import { useEffect } from "react";

type ContainedEvent<TState, K extends keyof HTMLElementEventMap> = {
    event: K;
    callback: ContainedEventCallback<TState, K>;
};
type ContainedEventCallback<TState, K extends keyof HTMLElementEventMap> = (
    event: HTMLElementEventMap[K],
    state: TState
) => void;
class MultiphaseEvent<
    TState extends Record<string, unknown>,
    TEventTypes extends readonly (keyof HTMLElementEventMap)[]
> {
    name: string;
    private events: [...{ [I in keyof TEventTypes]: ContainedEvent<TState, TEventTypes[I]> }];
    private callbacks: [
        ...{
            [I in keyof TEventTypes]: (
                event: HTMLElementEventMap[TEventTypes[I]]
            ) => ContainedEventCallback<TState, TEventTypes[I]>;
        }
    ];

    sharedState: TState;
    element: HTMLElement;
    constructor(
        name: string,
        sharedState: TState,
        events: [...{ [I in keyof TEventTypes]: ContainedEvent<TState, TEventTypes[I]> }],
        element: HTMLElement
    ) {
        this.name = name;
        this.sharedState = sharedState;
        this.events = events;
        this.element = element;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.callbacks = [] as any;
        for (const event of events) {
            const { callback } = event;
            const myFunc = (e: Parameters<typeof callback>["0"]) => {
                return event.callback(e, sharedState);
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.callbacks = [...this.callbacks, myFunc] as any;
            element.addEventListener(event.event, myFunc);
        }
    }
    destory() {
        let i = 0;
        for (const event of this.events)
            this.element.removeEventListener(event.event, this.callbacks[i++]);
    }
}

const useMultiPhaseEvent = <
    TState extends Record<string, unknown>,
    TEventTypes extends readonly (keyof HTMLElementEventMap)[]
>(
    name: string,
    sharedState: TState,
    events: [...{ [I in keyof TEventTypes]: ContainedEvent<TState, TEventTypes[I]> }],
    element: HTMLElement | null
) => {
    useEffect(() => {
        if (!element) return;
        const event = new MultiphaseEvent(name, sharedState, events, element);
        return () => {
            event.destory();
        };
    });
};

export default useMultiPhaseEvent;
