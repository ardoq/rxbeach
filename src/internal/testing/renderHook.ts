import React from 'react';
import { ReactTestRenderer, act, create } from 'react-test-renderer';

type RenderHookOptions<TProps> = {
  initialProps?: TProps;
};
type RenderedHook<HookResult, TProps> = {
  result: {
    current: HookResult | undefined;
  };
  unmount: () => void;
  rerender: (
    props: TProps extends Record<string, never> ? void : TProps
  ) => void;
};

/**
 * Test utility for testing hooks without creating components for them.
 *
 * Example usage:
 * ```
 * test('should increment counter', () => {
 *   const { result } = renderHook(() => useCounter())
 *
 *   act(() => {
 *     result.current.increment()
 *   })
 *
 *   expect(result.current.count).toBe(1)
 * })
 * ```
 *
 * @param hookInit Callback for rendering the hook
 * @param options Options, including the initial props to pass to the `hookInit`
 * callback.
 * @returns An object with the result/output of the hook, as well as methods to
 * unmount and rerender the hook (really the component holding the hook)
 */
export const renderHook = <
  HookResult,
  TProps extends Record<string, unknown> = Record<string, never>
>(
  hookInit: (props: TProps) => HookResult,
  { initialProps }: RenderHookOptions<TProps> = {}
): RenderedHook<HookResult, TProps> => {
  const result = { current: undefined as HookResult | undefined };
  let container: ReactTestRenderer | undefined;

  const ComponentWithTheHook: React.FunctionComponent<TProps> = (p: TProps) => {
    result.current = hookInit(p);
    return React.createElement('div'); // <div/>
  };

  act(() => {
    container = create(React.createElement(ComponentWithTheHook, initialProps));
  });

  return {
    result,
    unmount: () => act(() => container?.unmount()),
    rerender: (props) =>
      act(() =>
        container?.update(
          React.createElement(ComponentWithTheHook, props as TProps)
        )
      ),
  };
};
