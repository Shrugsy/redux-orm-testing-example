import { createStore, combineReducers } from "redux";
import { createReducer } from "redux-orm";

import { composeWithDevTools } from "redux-devtools-extension";
import orm from "./models/orm";
import * as types from "./models/types";

export const rootReducer = combineReducers({
  // Insert the auto-generated Redux-ORM reducer.  This will
  // initialize our model "tables", and hook up the reducer
  // logic we defined on each Model subclass
  orm: createReducer(orm)
});

const store = createStore(rootReducer, composeWithDevTools());

// Dispatch an action to create a Post instance
store.dispatch({
  type: types.CREATE_POST,
  payload: "first post"
});
store.dispatch({
  type: types.CREATE_POST,
  payload: "second post"
});

export default store;
