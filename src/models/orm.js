// orm.js

import { ORM } from "redux-orm";
import * as models from "./models";

// Create an ORM instance and hook up the models
export const orm = new ORM({ stateSelector: state => state.orm });

const spreadableModels = Object.values(models);
orm.register(...spreadableModels);

export default orm;
