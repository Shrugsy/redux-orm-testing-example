// models.spec.js

import orm from "./orm";
import * as types from "./types";
import { applyActionToModelReducer } from "./ormTestUtils";

const postData = [
  { id: 1, content: "something" },
  { id: 2, content: "something else" }
];

describe("models", () => {
  let ormState, session;
  beforeEach(() => {
    ormState = orm.getEmptyState();
    session = orm.mutableSession(ormState);
    postData.forEach(post => session.Post.create(post));
  });

  it("correctly handles CREATE_POST", () => {
    const msg = "This is the post message";

    const action = {
      type: types.CREATE_POST,
      payload: msg
    };

    let numPosts = session.Post.all().count();
    expect(numPosts).toBe(postData.length);

    let t = applyActionToModelReducer(action, "Post", session);
    console.log(t);

    let postsQS = session.Post.all();
    expect(postsQS.count()).toBe(postData.length + 1);
    expect(postsQS.last().content).toEqual(msg);
  });

  it("correctly handles DELETE_POST", () => {
    const action = {
      type: types.DELETE_POST,
      payload: postData[0].id
    };

    const numPosts = session.Post.all().count();
    expect(numPosts).toBe(postData.length);

    let p = applyActionToModelReducer(action, "Post", session);
    console.log(p);

    let postsQS = session.Post.all();
    expect(postsQS.count()).toBe(postData.length - 1);

    const postDataWithoutFirst = [...postData].splice(1);
    expect(postsQS.toRefArray()).toEqual(postDataWithoutFirst);
  });
});
