import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import BaseCollection from '/imports/api/base/BaseCollection';
import { Users } from '/imports/api/user/UserCollection';
import { Roles } from 'meteor/alanning:roles';
import { ROLE } from '/imports/api/role/Role';
import { radgradCollections } from '/imports/api/integrity/RadGradCollections';

/** @module MentorAnswers */
/**
 * Represents a mentor answer.
 * @extends module:Base~BaseCollection
 */
class MentorProfileCollection extends BaseCollection {
  /**
   * Creates the Mentor Answer collection.
   */
  constructor() {
    super('MentorProfile', new SimpleSchema({
      mentorID: { type: SimpleSchema.RegEx.Id },
      company: { type: String },
      career: { type: String },
      location: { type: String },
      linkedin: { type: String },
      motivation: { type: String },
    }));
  }

  /**
   * Defines the profile associated with a Mentor.
   * @param mentor The mentor (slug or ID).
   * @param company The company the mentor is a member of.
   * @param career The mentor's title.
   * @param location The mentor's location
   * @param linkedin The mentor's LinkedIn user ID.
   * @param motivation The reason why the user mentors.
   * @return { String } The docID of the MentorProfile.
   * @throws { Meteor.Error } If mentor is not in ROLE.MENTOR.
   */
  define({ mentor, company, career, location, linkedin, motivation }) {
    const mentorID = Users.getID(mentor);
    if (!Roles.userIsInRole(mentorID, ROLE.MENTOR)) {
      throw new Meteor.Error('Attempt to define a profile for a user who is not a mentor');
    }
    return this._collection.insert({ mentorID, company, career, location, linkedin, motivation });
  }

  getMentorProfile(mentorID) {
    return this._collection.find({ mentorID });
  }

  /**
   * Returns an array of strings, each one representing an integrity problem with this collection.
   * Returns an empty array if no problems were found.
   * Checks mentorID.
   * @returns {Array} A (possibly empty) array of strings indicating integrity issues.
   */
  checkIntegrity() {
    const problems = [];
    this.find().forEach(doc => {
      if (!Users.isDefined(doc.mentorID)) {
        problems.push(`Bad mentorID: ${doc.mentorID}`);
      }
    });
    return problems;
  }

  /**
   * Returns an object representing the MentorProfile docID in a format acceptable to define().
   * @param docID The docID of a MentorProfile
   * @returns { Object } An object representing the definition of docID.
   */
  dumpOne(docID) {
    const doc = this.findDoc(docID);
    const mentor = Users.findSlugByID(doc.mentorID);
    const company = doc.company;
    const career = doc.career;
    const location = doc.location;
    const linkedin = doc.linkedin;
    const motivation = doc.motivation;
    return { mentor, company, career, location, linkedin, motivation };
  }
}

export const MentorProfiles = new MentorProfileCollection();
radgradCollections.push(MentorProfiles);

