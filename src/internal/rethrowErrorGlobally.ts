/**
 * Throws an error in a setTimout
 *
 * The error will become an uncaught error, as it's thrown on the main loop.
 * In the browser, these errors can be caught with `window.onerror`.
 *
 * @param error The error to rethrow
 */
export const rethrowErrorGlobally = (error: any) =>
  setTimeout(() => {
    throw error;
  });
