import React from "react";
import { within } from "@testing-library/react";
import { render } from "../test-utils";

import Posts from "./Posts";
import models from "../models";

const postData = [
  { id: 1, content: "post1" },
  { id: 2, content: "post2ff" },
  { id: 3, content: "post3sdfasdfsf" }
];
const extraPostData = [
  { id: 4, content: "post4" },
  { id: 5, content: "post5" }
];
const extraPostData2 = [
  { id: 6, content: "post6" },
  { id: 7, content: "post7" }
];

describe("Posts", () => {
  let ormState, session, view, onDeletePost;

  beforeEach(() => {
    ormState = models.orm.getEmptyState();
    session = models.orm.mutableSession(ormState); // START A MUTABLE SESSION
    postData.forEach(post => session.Post.create(post)); // CREATE FIRST 3 POSTS

    const posts = models.selectors.postsSelector({ orm: session.state });
    onDeletePost = jest.fn(id => {});

    view = render(<Posts posts={posts} onDeletePost={onDeletePost} />);
  });

  it("renders PostItem children based on input props", () => {
    const postItems = view.getAllByTestId("postItem");
    expect(postItems.length).toBe(postData.length);
    postData.forEach(post => {
      expect(view.getByText(post.content)).toBeInTheDocument();
    });
  });

  it("calls the onDeletePost function with the corresponding post id when button clicked", () => {
    const deleteButtons = view.getAllByTestId("postItem-delete");

    expect(onDeletePost.mock.calls.length).toBe(0);
    postData.forEach((post, idx) => {
      deleteButtons[idx].click();
      expect(onDeletePost.mock.calls.length).toBe(idx + 1);
      expect(onDeletePost.mock.calls[idx][0]).toBe(post.id);
    });
  });

  it("renders new PostItem children when corresponding input props change", () => {
    // add some data
    extraPostData.forEach(post => {
      session = models.testUtils.applyActionAndGetNextSession(
        models.actions.createPost(post.content),
        "Post",
        session
      );
    });
    const posts1 = models.selectors.postsSelector({ orm: session.state });
    view.rerender(<Posts posts={posts1} onDeletePost={onDeletePost} />);
    let postItems = view.getAllByTestId("postItem");
    // check the number of posts match expected amount
    expect(postItems.length).toBe(postData.length + extraPostData.length);

    // add some more data
    extraPostData2.forEach(post => {
      session = models.testUtils.applyActionAndGetNextSession(
        models.actions.createPost(post.content),
        "Post",
        session
      );
    });

    const posts2 = models.selectors.postsSelector({ orm: session.state });
    view.rerender(<Posts posts={posts2} onDeletePost={onDeletePost} />);
    postItems = view.getAllByTestId("postItem");
    expect(postItems.length).toBe(
      postData.length + extraPostData.length + extraPostData2.length
    );
  });

  it("only renders an empty div if no posts are provided to props", () => {
    view.rerender(<Posts />);
    const postItems = view.queryAllByTestId("postItem");
    expect(postItems.length).toBe(0);
    const postsDiv = view.getByTestId("posts-div");
    const allElements = within(postsDiv).getAllByText(/.*/g);
    expect(allElements.length).toBe(1);
  });
});
