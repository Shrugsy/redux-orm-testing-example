import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createPost } from "../models/actions";

PostSubmissionInput.propTypes = {};

function PostSubmissionInput() {
  const [postInput, setPostInput] = useState("");
  const dispatch = useDispatch();

  const handleInputChange = e => {
    setPostInput(e.target.value);
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    if (postInput) {
      dispatch(createPost(postInput));
      setPostInput("");
    }
  };
  return (
    <form data-testid={"postSubmission-form"} onSubmit={handleFormSubmit}>
      <input
        data-testid={"postSubmission-input"}
        placeholder={"add a post"}
        value={postInput}
        onChange={handleInputChange}
        style={{ width: "100%" }}
      />
    </form>
  );
}

export default PostSubmissionInput;
