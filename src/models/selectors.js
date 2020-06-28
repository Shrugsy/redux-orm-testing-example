// selectors.js

import { orm } from "./orm";
import { createSelector } from "redux-orm";

export const postsSelector = createSelector(orm.Post);
