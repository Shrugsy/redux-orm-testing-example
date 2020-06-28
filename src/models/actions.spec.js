// actions.spec.js

import * as actions from "./actions";
import * as types from "./types";

const msgData = ["something", "something else"];

describe("actions", () => {
  it("createPost should dispatch an action to create a post", () => {
    msgData.forEach(msg => {
      const expectedAction = {
        type: types.CREATE_POST,
        payload: msg
      };
      expect(actions.createPost(msg)).toEqual(expectedAction);
    });
  });

  it("deletePost should dispatch an action to delete a post", () => {
    const id = 999;
    const expectedAction = {
      type: types.DELETE_POST,
      payload: id
    };
    expect(actions.deletePost(id)).toEqual(expectedAction);
  });
});
