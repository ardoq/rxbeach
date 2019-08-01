import { createActionCreator } from "actionCreator";

export const myAction = createActionCreator<{
  data: string[];
  relevant: boolean;
}>("Action for basic");
