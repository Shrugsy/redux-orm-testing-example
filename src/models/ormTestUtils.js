// testUtils.js
import orm from "./orm";

/**
 * 
 * @param {object} action - redux action to be applied to model reducer
 * @param {string} modelName - name of the Model
 * @param {object} session - current orm session
 * @returns {any} - returns whatever the Model reducer returns for that action
 */
export function applyActionToModelReducer(action, modelName, session) {
  return session[modelName].reducer(action, session[modelName], session);
}

/**
 * 
 * @param {object} action - redux action to be applied to model reducer
 * @param {string} modelName - name of the Model
 * @param {object} session - current orm session
 * @returns {any} - returns a new session with the previous update applied
 */
export function applyActionAndGetNextSession(action, modelName, session) {
  session[modelName].reducer(action, session[modelName], session);
  return orm.session(session.state);
}
