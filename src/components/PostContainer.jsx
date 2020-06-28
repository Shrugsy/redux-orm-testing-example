import React from "react";
import { useSelector, useDispatch } from "react-redux";
import PostSubmissionInput from "./PostSubmissionInput";
import Posts from "./Posts";

import { postsSelector } from "../models/selectors";
import { deletePost } from "../models/actions";

// This component expects to have access to the store
function PostContainer() {
  const dispatch = useDispatch();
  const posts = useSelector(state => postsSelector(state));
  return (
    <>
      <div style={{ width: "300px", margin: "0 auto" }}>
        <PostSubmissionInput />
        <Posts
          posts={posts}
          onDeletePost={post => dispatch(deletePost(post))}
        />
      </div>
    </>
  );
}

export default PostContainer;
