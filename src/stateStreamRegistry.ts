import { PersistentReducedStateStream } from './PersistentReducedStateStream';
import { ActionStream } from './types/helpers';

export class StateStreamRegistry {
  streams: Map<string, PersistentReducedStateStream<any>> = new Map();
  /**
   * The action stream and states the registry has been started with, if started.
   * Should be `null` before `startReducing` and after `stopReducing` has been
   * called.
   */
  started: { action$: ActionStream; states: Map<string, any> } | null = null;

  /**
   * Register a stream to this stream registry
   *
   * If a stream with the same name has already been registered, an error is
   * thrown.
   *
   * If the registry has been started, the registered stream will also be
   * started.
   *
   * @param stream The stream to register
   */
  register(stream: PersistentReducedStateStream<any>) {
    if (this.streams.has(stream.name)) {
      throw new Error(`Duplicate stream name: ${stream.name}`);
    }
    if (this.started !== null) {
      stream.startReducing(
        this.started.action$,
        this.started.states.get(stream.name)
      );
    }
    this.streams.set(stream.name, stream);
  }

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
  startReducing(action$: ActionStream, states: Map<string, any> = new Map()) {
    if (this.started !== null) {
      throw new Error('Registry has already been started!');
    }
    this.started = { action$, states };
    for (const [name, stream] of this.streams) {
      stream.startReducing(action$, states.get(name));
    }
  }

  /**
   * Stops all the registered reduced state streams.
   *
   * This will call `stopReducing` on all the streams. After this, all access to
   * the `.state` properties will throw exceptions. `getStates` can not be
   * called after `stopReducing` because of this.
   */
  stopReducing() {
    this.started = null;
    for (const stream of this.streams.values()) {
      stream.stopReducing();
    }
  }

  /**
   * Get the latest state of each stream, for input into `startReducing`
   *
   * If `stopReducing` has been called before this, an exception will be thrown.
   */
  getStates(): Map<string, any> {
    return new Map(
      Array.from(this.streams, ([name, stream]) => [name, stream.state])
    );
  }
}

export const stateStreamRegistry = new StateStreamRegistry();
