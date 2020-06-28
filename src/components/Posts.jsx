import React from "react";
import { arrayOf, shape, number, string, func } from "prop-types";
import PostItem from "./PostItem";

Posts.propTypes = {
  posts: arrayOf(
    shape({
      id: number.isRequired,
      content: string.isRequired
    })
  ).isRequired,
  onDeletePost: func.isRequired
};

function Posts({ posts, onDeletePost }) {
  return (
    <div data-testid={"posts-div"} style={{ width: "90%", margin: "0 auto" }}>
      {posts
        ? posts.length > 0 &&
          posts.map(post => (
            <PostItem key={post.id} post={post} onDeletePost={onDeletePost} />
          ))
        : null}
    </div>
  );
}

export default Posts;
