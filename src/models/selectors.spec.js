// selectors.spec.js

import { postsSelector } from "./selectors";
import orm from "./orm";
import models from "./index";

const postData = [
  { id: 0, content: "post1" },
  { id: 1, content: "post2" },
  { id: 2, content: "post3" }
];
const extraPostData = [
  { id: 3, content: "post4" },
  { id: 4, content: "post5" }
];
const extraPostData2 = [
  { id: 5, content: "post6" },
  { id: 6, content: "post7" }
];

describe("Selectors", () => {
  let ormState;
  let session;
  beforeEach(() => {
    ormState = orm.getEmptyState();
    session = orm.mutableSession(ormState);
    postData.forEach(post => {
      session = models.testUtils.applyActionAndGetNextSession(
        models.actions.createPost(post.content),
        "Post",
        session
      );
    });
  });

  it("should select all posts with postsSelector", () => {
    const posts = postsSelector({ orm: session.state });
    expect(posts).toEqual(postData);
  });

  it("should select all posts after adding more posts", () => {
    extraPostData.forEach(
      post =>
        (session = models.testUtils.applyActionAndGetNextSession(
          models.actions.createPost(post.content),
          "Post",
          session
        ))
    );
    const newPosts = postsSelector({ orm: session.state });
    expect(newPosts).toEqual([...postData, ...extraPostData]);

    extraPostData2.forEach(
      post =>
        (session = models.testUtils.applyActionAndGetNextSession(
          models.actions.createPost(post.content),
          "Post",
          session
        ))
    );
    const newPosts1 = postsSelector({ orm: session.state });
    expect(newPosts1).toEqual([
      ...postData,
      ...extraPostData,
      ...extraPostData2
    ]);
  });

  it("should select the remaining posts after deleting posts", () => {
    session = models.testUtils.applyActionAndGetNextSession(
      models.actions.deletePost(postData[0].id),
      "Post",
      session
    );
    const posts = postsSelector({ orm: session.state });
    const postDataWithoutFirst = [...postData].splice(1);
    expect(posts).toEqual(postDataWithoutFirst);
  });
});
