interface ReducerWithoutPayload<State> {
  (previousState: State): State;
}
interface ReducerWithPayload<State, Payload> {
  (previousState: State, payload: Payload): State;
}

type Reducer<State, Payload = void> = Payload extends void
  ? ReducerWithoutPayload<State>
  : ReducerWithPayload<State, Payload>;

export default Reducer;
