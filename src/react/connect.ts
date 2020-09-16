import { Observable } from 'rxjs';
import React, { ComponentType, useState, useEffect } from 'react';

export const NOT_YET_EMITTED = Symbol('Returned from rxbeach/react:useStream');
// eslint-disable-next-line no-redeclare
export type NOT_YET_EMITTED = typeof NOT_YET_EMITTED;

/**
 * React hook to subscribe to a stream
 *
 * Each emit from the stream will make the component re-render with the new
 * value. Initially, `NOT_YET_EMITTED` is returned, because an `Observable`
 * has no guarantee for when the first emit will happen.
 *
 * @param source$ Stream that provides the needed values
 */
export const useStream = <T>(source$: Observable<T>): T | NOT_YET_EMITTED => {
  const [value, setValue] = useState<T | NOT_YET_EMITTED>(NOT_YET_EMITTED);

  useEffect(() => {
    const subscription = source$.subscribe(setValue);

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
 * @param WrappedComponent Component that will recieve props from the stream
 * @param stream$ Stream that will provide props to the component
 * @see useStream
 */
export const connect = <Props, Observed extends Partial<Props>>(
  Component: ComponentType<Props>,
  stream$: Observable<Observed>
) => (props: Omit<Props, keyof Observed>) => {
  const value = useStream(stream$);

  if (value === NOT_YET_EMITTED) return null;

  // Typescript doesn't recognize this as Observed & Props for some reason
  // Question on StackOverflow: https://stackoverflow.com/q/60758084/1104307
  const newProps = { ...props, ...value } as Props & Observed;

  return React.createElement(Component, newProps);
};
