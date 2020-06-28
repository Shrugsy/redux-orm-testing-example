import React from "react";
import { render } from "../test-utils";
import models from "../models";
import { createReducer } from "redux-orm";
import { createStore, combineReducers } from "redux";
import PostContainer from "./PostContainer";
import { fireEvent, screen, within } from "@testing-library/react";

const postData = [
  { id: 0, content: "post1" },
  { id: 1, content: "post2ff" },
  { id: 2, content: "post3sdfasdfsf" },
];
const extraPostData = [
  { id: 3, content: "post4" },
  { id: 4, content: "post5" },
];

describe("PostContainer", () => {
  let ormState, rootReducer, session, view, store;

  beforeEach(() => {
    ormState = models.orm.getEmptyState();
    session = models.orm.mutableSession(ormState); // START A MUTABLE SESSION

    rootReducer = combineReducers({
      orm: createReducer(models.orm),
    });
    const initialState = {
      orm: session.state,
    };
    store = createStore(rootReducer, initialState);
    postData.forEach((post) => {
      store.dispatch(models.actions.createPost(post.content));
    });

    view = render(<PostContainer />, { store });
  });

  it("renders posts from the store", () => {
    postData.forEach((post) => {
      expect(view.getByText(post.content)).toBeInTheDocument();
    });
  });

  it("renders new posts when store adds posts", () => {
    extraPostData.forEach((post) => {
      store.dispatch(models.actions.createPost(post.content));
    });

    store = createStore(rootReducer, { orm: session.state });

    postData.forEach((post) => {
      expect(view.getByText(post.content)).toBeInTheDocument();
    });
    extraPostData.forEach((post) => {
      expect(view.getByText(post.content)).toBeInTheDocument();
    });
  });

  it("renders less posts when store deletes posts", () => {
    const delete_index = 0;
    store.dispatch(models.actions.deletePost(postData[delete_index].id));

    postData.forEach((post, idx) => {
      if (idx === delete_index) {
        expect(view.queryByText(post.content)).toBeNull();
      } else {
        expect(view.getByText(post.content)).toBeInTheDocument();
      }
    });
  });

  it("renders less posts when delete button is clicked", () => {
    const delete_index = 1;
    const xSpan = view.getAllByTestId("postItem-delete")[1];
    expect(view.getAllByTestId("postItem").length).toBe(postData.length);

    xSpan.click();
    expect(view.getAllByTestId("postItem").length).toBe(postData.length - 1);

    postData.forEach((post, idx) => {
      if (idx === delete_index) {
        expect(view.queryByText(post.content)).toBeNull();
      } else {
        expect(view.getByText(post.content)).toBeInTheDocument();
      }
    });
  });

  it("adds a new item when PostSubmissionInput is submitted with content", () => {
    const newPostText = "new post content";
    const inputEl = view.getByTestId("postSubmission-input");
    fireEvent.change(inputEl, { target: { value: newPostText } });

    const formEl = view.getByTestId("postSubmission-form");
    fireEvent.submit(formEl);

    const allPostItems = view.getAllByTestId("postItem");
    expect(allPostItems.length).toBe(postData.length + 1);

    const lastPostItem = allPostItems.slice(-1)[0];
    const qry = within(lastPostItem).queryByText(newPostText);
    expect(qry).not.toBeNull();
  });

  it("does not add a new item when PostSubmissionInput is submitted without content", () => {
    expect(view.getAllByTestId("postItem").length).toBe(postData.length);
    const inputEl = view.getByTestId("postSubmission-input");
    fireEvent.change(inputEl, { target: { value: "" } });

    const formEl = view.getByTestId("postSubmission-form");
    fireEvent.submit(formEl);
    expect(view.getAllByTestId("postItem").length).toBe(postData.length);
  });
});