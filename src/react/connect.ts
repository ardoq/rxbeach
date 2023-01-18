import { ObservableInput, from } from 'rxjs';
import React, { ComponentType, useEffect, useState } from 'react';

export const NOT_YET_EMITTED = Symbol('Returned from rxbeach/react:useStream');
// eslint-disable-next-line no-redeclare
export type NOT_YET_EMITTED = typeof NOT_YET_EMITTED;

type UseStream = {
  <T>(source$: ObservableInput<T>, defaultValue: T): T;
  <T>(source$: ObservableInput<T>, defaultValue?: T): T | NOT_YET_EMITTED;
};

/**
 * React hook to subscribe to a stream
 *
 * Each emit from the stream will make the component re-render with the new
 * value. Initially, `NOT_YET_EMITTED` is returned, because an `Observable`
 * has no guarantee for when the first emit will happen. This initial
 * value may be overridden with the `defaultValue` argument.
 *
 * @param source$ Stream that provides the needed values
 * @param defaultValue Default value returned on init until stream emits new value
 */
export const useStream: UseStream = <T>(
  source$: ObservableInput<T>,
  defaultValue?: T
): T | NOT_YET_EMITTED => {
  const [value, setValue] = useState<T | NOT_YET_EMITTED>(
    defaultValue ?? NOT_YET_EMITTED
  );

  useEffect(() => {
    const subscription = from(source$).subscribe(setValue);

    return () => subscription.unsubscribe();
  }, [source$]);

  return value;
};

/**
 * Higher order component for connecting a component to a stream
 *
 * The stream does not need to provide all the properties the component expects,
 * any missing properties will be required by the component returned from this
 * component.
 *
 * Typescript does, in certain cases, allow for extra properties to be unpacked
 * on a component. This means it may be possible to send props which would be
 * provided by the stream. In these cases the values from the stream will
 * override any values passed as props.
 *
 * @param Component Component that will recieve props from the stream
 * @param stream$ Stream that will provide props to the component
 * @returns A component that renders the original component with props retrieved
 *  from the stream
 * @see {@link useStream}
 */
export const connect =
  <Props extends object, Observed extends Partial<Props>>(
    Component: ComponentType<Props>,
    stream$: ObservableInput<Observed>
  ) =>
  (props: Omit<Props, keyof Observed>) => {
    const value = useStream(stream$);

    if (value === NOT_YET_EMITTED) return null;

    // Typescript doesn't recognize this as Observed & Props for some reason
    // Question on StackOverflow: https://stackoverflow.com/q/60758084/1104307
    const newProps = { ...props, ...value } as Props & Observed;

    return React.createElement(Component, newProps);
  };

let instanceCount = 0;
const nextInstanceName = () => `view-${instanceCount++}`;

/**
 * Higher order component for connecting a component to a stream
 *
 * This is the same as {@link connect }, but takes a factory for the stream. A
 * new stream will be retrieved from the factory for every new mount of the
 * component.
 *
 * @param Component Component that will receive props from the stream
 * @param createInstanceStream Function to create the stream for each instance
 *  of the component
 * @returns A component that renders the original component with props retrieved
 *  from the stream
 * @see {@link connect}
 */
export const connectInstance =
  <Props extends object, Observed extends Partial<Props>>(
    Component: ComponentType<Props>,
    createInstanceStream: (instance: string) => ObservableInput<Observed>
  ) =>
  (props: Omit<Props, keyof Observed>) => {
    const [stream$] = useState(() => createInstanceStream(nextInstanceName()));
    const value = useStream(stream$);

    if (value === NOT_YET_EMITTED) return null;

    // Typescript doesn't recognize this as Observed & Props for some reason
    // Question on StackOverflow: https://stackoverflow.com/q/60758084/1104307
    const newProps = { ...props, ...value } as Props & Observed;

    return React.createElement(Component, newProps);
  };
