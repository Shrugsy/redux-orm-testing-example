import React from "react";
import { render } from "../test-utils";
import models from "../models";
import PostItem from "./PostItem";

const postData = [
  { id: 0, content: "post1" },
  { id: 1, content: "post2ff" },
  { id: 2, content: "post3sdfasdfsf" }
];

describe("PostItem", () => {
  let ormState, session, view, onDeletePost;

  beforeEach(() => {
    ormState = models.orm.getEmptyState();
    session = models.orm.mutableSession(ormState); // START A MUTABLE SESSION
    postData.forEach(post => {
      session = models.testUtils.applyActionAndGetNextSession(
        models.actions.createPost(post.content),
        "Post",
        session
      );
    });

    const posts = models.selectors.postsSelector({ orm: session.state });
    onDeletePost = jest.fn(id => {});
    view = render(<PostItem post={posts[0]} onDeletePost={onDeletePost} />);
  });

  it("renders PostItem content based on input props", () => {
    // e.g.
    // 0. post_content     x
    // 1. more_content     x

    const expectedIdString = `${postData[0].id.toString()}.`;
    expect(view.getByText(expectedIdString)).toBeInTheDocument();
    expect(view.getByText(postData[0].content)).toBeInTheDocument();

    expect(view.getByTestId("postItem")).toBeInTheDocument();
    expect(view.getByTestId("postItem-id")).toBeInTheDocument();
    expect(view.getByTestId("postItem-content")).toBeInTheDocument();
    expect(view.getByTestId("postItem-delete")).toBeInTheDocument();
  });

  it("calls the passed in onDeletePost function when the correct item is clicked", () => {
    expect(onDeletePost.mock.calls.length).toBe(0);
    const xSpan = view.getByTestId("postItem-delete");
    xSpan.click();
    expect(onDeletePost.mock.calls.length).toBe(1);
  });
  it("doesn't call the passed in onDeletePost function when other items are clicked", () => {
    expect(onDeletePost.mock.calls.length).toBe(0);
    const containerDiv = view.getByTestId("postItem");
    const idSpan = view.getByTestId("postItem-id");
    const contentSpan = view.getByTestId("postItem-content");
    const xSpan = view.getByTestId("postItem-delete");

    containerDiv.click();
    idSpan.click();
    contentSpan.click();
    expect(onDeletePost.mock.calls.length).toBe(0);
    xSpan.click();
    expect(onDeletePost.mock.calls.length).toBe(1);
  });
});
