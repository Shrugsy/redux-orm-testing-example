// models.js

import { Model, attr } from "redux-orm";

export class Post extends Model {
  static get fields() {
    return {
      id: attr(),
      content: attr()
    };
  }

  static reducer(action, Post, session) {
    switch (action.type) {
      case "CREATE_POST": {
        return Post.upsert({ content: action.payload });
      }
      case "DELETE_POST": {
        let post = Post.withId(action.payload);
        post.delete();
        return Post.all();
      }
      default:
        return Post.all();
    }
  }
}
Post.modelName = "Post";
