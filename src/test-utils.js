// test-utils.js
import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import { createReducer } from "redux-orm";

import orm from "./models/orm";

const rootReducer = combineReducers({
  // Insert the auto-generated Redux-ORM reducer.  This will
  // initialize our model "tables", and hook up the reducer
  // logic we defined on each Model subclass
  orm: createReducer(orm)
});

function render(
  ui,
  {
    initialState = {},
    store = createStore(rootReducer, initialState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from "@testing-library/react";

// override render method
export { render };
