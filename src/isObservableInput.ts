import { ObservableInput, from } from 'rxjs';

export const isObservableInput = (
  obj: any
): obj is ObservableInput<unknown> => {
  try {
    from(obj);
    return true;
  } catch {
    return false;
  }
};
