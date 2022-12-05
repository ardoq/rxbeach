import { ObservableState } from './observableState';

export class StateStreamRegistry {
  streams: Map<string, ObservableState<any>> = new Map();

  started = false;

  /**
   * Register a stream to this stream registry
   *
   * If the registry has already been started, the registered stream will also be
   * started.
   *
   * Before the registry has started, an error will be thrown if the stream name
   * has already been used.
   *
   * @param stream The stream to register
   */
  register(stream: ObservableState<any>) {
    if (this.streams.has(stream.name)) {
      throw new Error(`Duplicate stream name: ${stream.name}`);
    }

    if (this.started) {
      stream.connect();
    }
    this.streams.set(stream.name, stream);
  }

  /**
   * Unregister a stream from the registry
   * 
   * @param name The name of the stream
   * @returns void
   */
  unregister(name: string) {
    var stream = this.streams.get(name)
    if (!stream) {
        return;
    }

    this.streams.delete(name)
    stream.unsubscribe();
};

  /**
   * Start the registered reduced state streams.
   *
   * This causes the streams to actually start reducing over the action stream.
   *
   * Streams registered after this will also be started.
   *
   * If this is called twice without `stopReducing` being called in between, an
   * error will be thrown.
   *
   * @param action$ The action stream the streams should reduce over
   * @param states States to initialize the streams with, as returned by
   *               `getStates`
   */
  startReducing() {
    if (this.started) {
      throw new Error('Registry has already been started!');
    }
    this.started = true;
    for (const [, stream] of this.streams) {
      stream.connect();
    }
  }

  /**
   * Stops all the registered reduced state streams.
   *
   * This will call `unsubscribe` on all the streams. After this, all access to
   * the `.state` properties will throw exceptions. `getStates` can not be
   * called after `stopReducing` because of this.
   */
  stopReducing() {
    this.started = false;
    for (const stream of this.streams.values()) {
      stream.unsubscribe();
    }
  }
}

export const stateStreamRegistry = new StateStreamRegistry();
