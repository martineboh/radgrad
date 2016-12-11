import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import BaseCollection from '/imports/api/base/BaseCollection';
import { ROLE } from '/imports/api/role/Role';
import { Users } from '../user/UserCollection';

/** @module AdvisorLog */

/**
 * Represents a log of an Advisor talking to a Student.
 * @extends module:Base~BaseCollection
 */
class AdvisorLogCollection extends BaseCollection {

  /**
   * Creates the AdvisorLog collection.
   */
  constructor() {
    super('AdvisorLog', new SimpleSchema({
      studentID: { type: SimpleSchema.RegEx.Id },
      advisorID: { type: SimpleSchema.RegEx.Id },
      text: { type: String },
      createdOn: { type: Date },
    }), new SimpleSchema({
      student: { type: String },
      advisor: { type: String },
      text: { type: String },
    }));
  }

  /**
   * Defines an advisor log record.
   * @param advisor The advisor's username.
   * @param student The student's username.
   * @param text The contents of the session.
   */
  define({ advisor, student, text }) {
    const advisorID = Users.getID(advisor);
    const studentID = Users.getID(student);
    const createdOn = new Date();
    this._collection.insert({ advisorID, studentID, text, createdOn });
  }

  /**
   * Returns the Advisor associated with the log instance.
   * @param instanceID the instance ID.
   * @returns {Object}
   */
  getAdvisorDoc(instanceID) {
    this.assertDefined(instanceID);
    const instance = this._collection.find({ _id: instanceID });
    return Users.findDoc(instance.advisorID);
  }

  /**
   * Returns the Student associated with the log instance.
   * @param instanceID the instance ID.
   * @returns {Object}
   */
  getStudentDoc(instanceID) {
    this.assertDefined(instanceID);
    const instance = this._collection.find({ _id: instanceID });
    return Users.findDoc(instance.studentID);
  }

  /**
   * Depending on the logged in user publish only their AdvisorLogs. If
   * the user is in the Role.ADMIN or Role.ADVISOR then publish all AdvisorLogs. If the
   * system is in mockup mode publish all AdvisorLogs.
   */
  publish() {
    if (Meteor.isServer) {
      const instance = this;
      Meteor.publish(this._collectionName, function publish() {
        if (!!Meteor.settings.mockup || Roles.userIsInRole(this.userId, [ROLE.ADMIN, ROLE.ADVISOR])) {
          return instance._collection.find();
        }
        return instance._collection.find({ studentID: this.userId });
      });
    }
  }
}

export const AdvisorLogs = new AdvisorLogCollection();
