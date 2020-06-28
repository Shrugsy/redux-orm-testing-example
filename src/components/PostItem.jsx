import React from "react";
import { shape, number, string, func } from "prop-types";

PostItem.propTypes = {
  post: shape({
    id: number.isRequired,
    content: string.isRequired
  }).isRequired,
  onDeletePost: func.isRequired
};

function PostItem({ post, onDeletePost }) {
  return (
    <>
      <div data-testid={"postItem"} style={{ display: "flex", padding: "5px" }}>
        <span data-testid={"postItem-id"} style={{ paddingRight: "0.5em" }}>
          {post.id}.
        </span>
        <span data-testid={"postItem-content"}>{post.content}</span>
        <span
          data-testid={"postItem-delete"}
          onClick={() => onDeletePost(post.id)}
          style={{ color: "red", cursor: "pointer", marginLeft: "auto" }}
        >
          x
        </span>
      </div>
    </>
  );
}

export default PostItem;
