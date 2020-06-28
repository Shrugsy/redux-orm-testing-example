// actions.js

import * as types from "./types";

export const createPost = msg => ({
  type: types.CREATE_POST,
  payload: msg
});

export const deletePost = id => ({
  type: types.DELETE_POST,
  payload: id
});
