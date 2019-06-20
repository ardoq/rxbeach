import action$, { dispatchAction } from "action$";
import reducers from "./reducers";
import {
  reduceActionsStartWithDefault,
  onFirstSubscription
} from "lib/stream-operators";
import { shareReplay } from "rxjs/operators";
import { apiFetchMetaModels } from "./actions";

const metaModels$ = action$.pipe(
  reduceActionsStartWithDefault(reducers, []),
  onFirstSubscription(() => dispatchAction(apiFetchMetaModels())),
  shareReplay({
    refCount: true,
    bufferSize: 1
  })
);

export default metaModels$;
