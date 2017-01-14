import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import BaseCollection from '/imports/api/base/BaseCollection';
// import { radgradCollections } from '/imports/api/integritychecker/IntegrityChecker';

/** @module MentorQuestions */

/**
 * Represents a mentor answer.
 * @extends module:Base~BaseCollection
 */
class MentorQuestionsCollection extends BaseCollection {
  /**
   * Creates the Mentor Question collection.
   */
  constructor() {
    super('MentorQuestions', new SimpleSchema({
      questionID: { type: String },
      text: { type: String },
    }));
  }

  /**
   * Defines the question for a given question ID.
   * @param text the question text.
   * @return {any} the ID of the question.
   */
  define({ questionID, text }) {
    return this._collection.insert({ questionID, text });
  }

  getMentorQuestion() {
    return this._collection.find({});
  }

  /**
   * Returns an empty array (no integrity checking done on this collection.)
   * @returns {Array} An empty array.
   */
  checkIntegrity() { // eslint-disable-line class-methods-use-this
    return [];
  }
}

export const MentorQuestions = new MentorQuestionsCollection();
// radgradCollections.push(MentorQuestions);

