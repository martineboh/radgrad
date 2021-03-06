import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/erasaur:meteor-lodash';
// import { Logger } from 'meteor/jag:pince';
import { Roles } from 'meteor/alanning:roles';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
// import { moment } from 'meteor/momentjs:moment';
import { Courses } from '/imports/api/course/CourseCollection';
import { AcademicYearInstances } from '/imports/api/year/AcademicYearInstanceCollection';
import { ROLE } from '/imports/api/role/Role';
import { Semesters } from '/imports/api/semester/SemesterCollection';
import { Users } from '/imports/api/user/UserCollection';
import { Slugs } from '/imports/api/slug/SlugCollection';
import BaseCollection from '/imports/api/base/BaseCollection';
import { makeCourseICE } from '/imports/api/ice/IceProcessor';
import { radgradCollections } from '/imports/api/integrity/RadGradCollections';

/** @module CourseInstance */

/**
 * Represents the taking of a course by a specific student in a specific semester.
 * @extends module:Base~BaseCollection
 */
class CourseInstanceCollection extends BaseCollection {
  /**
   * Creates the CourseInstance collection.
   */
  constructor() {
    super('CourseInstance', new SimpleSchema({
      semesterID: { type: SimpleSchema.RegEx.Id },
      courseID: { type: SimpleSchema.RegEx.Id, optional: true },
      verified: { type: Boolean },
      fromSTAR: { type: Boolean, optional: true },
      grade: { type: String, optional: true },
      creditHrs: { type: Number },
      note: { type: String, optional: true },
      studentID: { type: SimpleSchema.RegEx.Id },
      ice: { type: Object, optional: true, blackbox: true },
    }));
    this.validGrades = ['', 'A', 'A+', 'A-',
      'B', 'B+', 'B-', 'C', 'C+', 'C-', 'D', 'D+', 'D-', 'F', 'CR', 'NC', '***', 'W'];
    this.publicationNames = [];
    this.publicationNames.push(this._collectionName);
    this.publicationNames.push(`${this._collectionName}.Public`);
    this.publicationNames.push(`${this._collectionName}.PerStudentAndSemester`);
    this.publicationNames.push(`${this._collectionName}.PublicStudent`);
    this.publicationNames.push(`${this._collectionName}.PublicSlugStudent`);
    this.publicationNames.push(`${this._collectionName}.studentID`);
    if (Meteor.server) {
      this._collection._ensureIndex({ _id: 1, studentID: 1, courseID: 1 });
    }
  }

  /**
   * Defines a new CourseInstance.
   * @example
   * // To define an instance of a CS course:
   * CourseInstances.define({ semester: 'Spring-2016',
   *                          course: 'ics311',
   *                          verified: false,
   *                          fromSTAR: false,
   *                          grade: 'B',
   *                          student: 'joesmith' });
   * // To define an instance of a non-CS course:
   * CourseInstances.define({ semester: 'Spring-2016',
   *                          course: 'other',
   *                          note: 'ENG 101',
   *                          verified: true,
   *                          creditHrs: 3,
   *                          fromSTAR: true,
   *                          grade: 'B',
   *                          student: 'joesmith' });
   * @param { Object } description Object with keys semester, course, verified, notCS, grade, studen.
   * Required fields: semester, student, course, which must all be valid slugs or instance IDs.
   * If the course slug is 'other', then the note field will be used as the course number.
   * Optional fields: note (defaults to ''), valid (defaults to false), grade (defaults to '').
   * CreditHrs defaults to the creditHrs assigned to course, or can be provided explicitly.
   * @throws {Meteor.Error} If the definition includes an undefined course or student.
   * @returns The newly created docID.
   */
  define({ semester, course, verified = false, fromSTAR = false, grade = '', note = '', student, creditHrs }) {
    // Check arguments
    const semesterID = Semesters.getID(semester);
    const semesterDoc = Semesters.findDoc(semesterID);
    const courseID = Courses.getID(course);
    const studentID = Users.getID(student);
    const user = Users.findDoc(studentID);
    // ensure the AcademicYearInstance is defined.
    if (semester.term === Semesters.SPRING || semester.term === Semesters.SUMMER) {
      AcademicYearInstances.define({ year: semesterDoc.year - 1, student: user.username });
    } else {
      AcademicYearInstances.define({ year: semesterDoc.year, student: user.username });
    }
    const ice = makeCourseICE(course, grade);
    if ((typeof verified) !== 'boolean') {
      throw new Meteor.Error(`${verified} is not a boolean.`);
    }
    if (!_.includes(this.validGrades, grade)) {
      if (grade.startsWith('I')) {
        grade = grade.substring(1);
      }
      if (!_.includes(this.validGrades, grade)) {
        throw new Meteor.Error(`${grade} is not a valid grade.`);
      }
    }
    /* eslint no-param-reassign: "off" */
    if (!creditHrs) {
      creditHrs = Courses.findDoc(courseID).creditHrs;
    }
    // Define and return the CourseInstance
    // eslint-disable-next-line max-len
    return this._collection.insert({ semesterID, courseID, verified, fromSTAR, grade, studentID, creditHrs, note, ice });
  }

  /**
   * Returns the Course associated with the CourseInstance with the given instanceID.
   * @param instanceID The id of the CourseInstance.
   * @returns {Object} The associated Course.
   * @throws {Meteor.Error} If instanceID is not a valid ID.
   */
  getCourseDoc(instanceID) {
    this.assertDefined(instanceID);
    const instance = this._collection.findOne({ _id: instanceID });
    return Courses.findDoc(instance.courseID);
  }

  /**
   * Returns the Course slug for the instance's corresponding Course.
   * @param instanceID The CourseInstanceID.
   * @return {string} The course slug.
   */
  getCourseSlug(instanceID) {
    this.assertDefined(instanceID);
    const instance = this._collection.findOne({ _id: instanceID });
    return Courses.getSlug(instance.courseID);
  }

  /**
   * Return the publication name.
   * @param index The optional index for the publication name.
   * @returns { String } The publication name, as a string.
   */
  getPublicationName(index) {
    if (index) {
      return this.publicationNames[index];
    }
    return this._collectionName;
  }

  /**
   * Returns the Semester associated with the CourseInstance with the given instanceID.
   * @param instanceID The id of the CourseInstance.
   * @returns {Object} The associated Semester.
   * @throws {Meteor.Error} If instanceID is not a valid ID.
   */
  getSemesterDoc(instanceID) {
    this.assertDefined(instanceID);
    const instance = this._collection.findOne({ _id: instanceID });
    return Semesters.findDoc(instance.semesterID);
  }

  /**
   * Returns the Student associated with the CourseInstance with the given instanceID.
   * @param instanceID The id of the CourseInstance.
   * @returns {Object} The associated Student.
   * @throws {Meteor.Error} If instanceID is not a valid ID.
   */
  getStudentDoc(instanceID) {
    this.assertDefined(instanceID);
    const instance = this._collection.findOne({ _id: instanceID });
    return Users.findDoc(instance.studentID);
  }

  /**
   * @returns { String } The course name associated with courseInstanceID.
   * @param courseInstanceID The course instance ID.
   * @throws {Meteor.Error} If courseInstanceID is not a valid ID.
   */
  findCourseName(courseInstanceID) {
    this.assertDefined(courseInstanceID);
    const courseID = this.findDoc(courseInstanceID).courseID;
    return Courses.findDoc(courseID).name;
  }

  /**
   * @returns { boolean } If the course is an ICS course associated with courseInstanceID.
   * @param courseInstanceID The course instance ID.
   * @throws {Meteor.Error} If courseInstanceID is not a valid ID.
   */
  isICS(courseInstanceID) {
    this.assertDefined(courseInstanceID);
    const instance = this.findDoc(courseInstanceID);
    const retVal = instance.note.startsWith('ICS');
    if (retVal) {
      return retVal;
    }
    return Courses.findDoc(instance.courseID).number.substring(0, 3) === 'ICS';
  }

  /**
   * Depending on the logged in user publish only their CourseInstances. If
   * the user is in the Role.ADMIN then publish all CourseInstances. If the
   * system is in mockup mode publish all CourseInstances.
   */
  publish() {
    if (Meteor.isServer) {
      const instance = this;
      Meteor.publish(this.publicationNames[0], function publish() {
        if (!!Meteor.settings.mockup || Roles.userIsInRole(this.userId, [ROLE.ADMIN, ROLE.ADVISOR])) {
          return instance._collection.find();
        }
        return instance._collection.find({ studentID: this.userId });
      });
      Meteor.publish(this.publicationNames[1], function publicPublish(courseID) {  // eslint-disable-line
        // check the courseID.
        new SimpleSchema({
          courseID: { type: String },
        }).validate({ courseID });

        return instance._collection.find({ courseID }, { fields: { studentID: 1, semesterID: 1, courseID: 1 } });
      });
      Meteor.publish(this.publicationNames[2],
          function perStudentAndSemester(studentID, semesterID) {  // eslint-disable-line
            new SimpleSchema({
              studentID: { type: String },
              semesterID: { type: String },
            }).validate({ studentID, semesterID });
            return instance._collection.find({ studentID, semesterID });
          });
      Meteor.publish(this.publicationNames[3], function publicStudentPublish() {  // eslint-disable-line
        return instance._collection.find({}, { fields: { studentID: 1, semesterID: 1, courseID: 1 } });
      });
      Meteor.publish(this.publicationNames[4], function publicSlugPublish(courseSlug) {  // eslint-disable-line
        // check the courseID.
        const slug = Slugs.find({ name: courseSlug }).fetch();
        const course = Courses.find({ slugID: slug[0]._id }).fetch();
        const courseID = course[0]._id;
        new SimpleSchema({
          courseID: { type: String },
        }).validate({ courseID });

        return instance._collection.find({ courseID }, { fields: { studentID: 1, semesterID: 1, courseID: 1 } });
      });
      Meteor.publish(this.publicationNames[5], function filterStudentID(studentID) { // eslint-disable-line
        new SimpleSchema({
          studentID: { type: String },
        }).validate({ studentID });
        return instance._collection.find({ studentID });
      });
    }
  }

  /**
   * @returns {String} A formatted string representing the course instance.
   * @param courseInstanceID The course instance ID.
   * @throws {Meteor.Error} If not a valid ID.
   */
  toString(courseInstanceID) {
    this.assertDefined(courseInstanceID);
    const courseInstanceDoc = this.findDoc(courseInstanceID);
    const courseName = this.findCourseName(courseInstanceID);
    const semester = Semesters.toString(courseInstanceDoc.semesterID);
    const grade = courseInstanceDoc.grade;
    return `[CI ${semester} ${courseName} ${grade}]`;
  }

  /* eslint-disable class-methods-use-this */
  /**
   * Updates the CourseInstance's grade. This should be used for planning purposes on the client side.
   * @param courseInstanceID The course instance ID.
   * @param grade The new grade.
   */
  clientUpdateGrade(courseInstanceID, grade) {
    // const logger = new Logger('CourseInstance.clientUpdateGrade');
    // logger.info(`${moment().format('YYYY-MM-DDTHH:mm:ss.SSS')} ${courseInstanceID}, ${grade}`);
    Meteor.call('CourseInstance.updateGrade', { courseInstanceID, grade });
    // logger.info(`${moment().format('YYYY-MM-DDTHH:mm:ss.SSS')} after Meteor.call(CourseInstance.updateGrade)`);
  }

  /**
   * Updates the CourseInstance's grade. This should be used for planning purposes.
   * @param courseInstanceID The course instance ID.
   * @param grade The new grade.
   * @throws {Meteor.Error} If courseInstanceID is not a valid ID.
   */
  updateGrade(courseInstanceID, grade) {
    // const logger = new Logger('CourseInstance.updateGrade');
    // logger.info(`${courseInstanceID}, ${grade}`);
    this.assertDefined(courseInstanceID);
    // logger.info('after assert');
    const ice = makeCourseICE(courseInstanceID, grade);
    // logger.info('after ice');
    this._collection.update({ _id: courseInstanceID }, { $set: { grade, ice, verified: false } });
    // logger.info('after _collection update');
  }

  /**
   * Updates the CourseInstance's Semester.
   * @param courseInstanceID The course instance ID.
   * @param semesterID The semester id.
   * @throws {Meteor.Error} If courseInstanceID is not a valid ID.
   */
  updateSemester(courseInstanceID, semesterID) {
    this.assertDefined(courseInstanceID);
    Semesters.assertSemester(semesterID);
    this._collection.update({ _id: courseInstanceID }, { $set: { semesterID } });
  }

  /**
   * Returns an array of strings, each one representing an integrity problem with this collection.
   * Returns an empty array if no problems were found.
   * Checks semesterID, courseID, and studentID.
   * @returns {Array} A (possibly empty) array of strings indicating integrity issues.
   */
  checkIntegrity() {
    const problems = [];
    this.find().forEach(doc => {
      if (!Semesters.isDefined(doc.semesterID)) {
        problems.push(`Bad semesterID: ${doc.semesterID}`);
      }
      if (!Courses.isDefined(doc.courseID)) {
        problems.push(`Bad courseID: ${doc.courseID}`);
      }
      if (!Users.isDefined(doc.studentID)) {
        problems.push(`Bad studentID: ${doc.studentID}`);
      }
    });
    return problems;
  }

  /**
   * Returns an object representing the CourseInstance docID in a format acceptable to define().
   * @param docID The docID of a CourseInstance.
   * @returns { Object } An object representing the definition of docID.
   */
  dumpOne(docID) {
    const doc = this.findDoc(docID);
    const semester = Semesters.findSlugByID(doc.semesterID);
    const course = Courses.findSlugByID(doc.courseID);
    const note = doc.note;
    const verified = doc.verified;
    const creditHrs = doc.creditHrs;
    const grade = doc.grade;
    const student = Users.findSlugByID(doc.studentID);
    return { semester, course, note, verified, creditHrs, grade, student };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 */
export const CourseInstances = new CourseInstanceCollection();
radgradCollections.push(CourseInstances);
