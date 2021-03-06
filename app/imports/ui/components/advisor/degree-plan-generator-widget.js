import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/erasaur:meteor-lodash';

import { sessionKeys } from '../../../startup/client/session-state';
import { AcademicYearInstances } from '../../../api/year/AcademicYearInstanceCollection';
import { CareerGoals } from '../../../api/career/CareerGoalCollection';
import { CourseInstances } from '../../../api/course/CourseInstanceCollection';
import { DesiredDegrees } from '../../../api/degree/DesiredDegreeCollection';
import { Interests } from '../../../api/interest/InterestCollection';
import { Semesters } from '../../../api/semester/SemesterCollection';
import * as planUtils from '../../../api/degree-program/plan-generator';
import * as semUtils from '../../../api/semester/SemesterUtilities';
import * as courseUtils from '../../../api/course/CourseUtilities';
import * as opportunityUtils from '../../../api/opportunity/OpportunityUtilities';
import { Users } from '../../../api/user/UserCollection.js';

Template.Degree_Plan_Generator_Widget.onCreated(function degreePlanGeneratorOnCreated() {
  if (this.data.dictionary) {
    this.state = this.data.dictionary;
  } else {
    this.state = new ReactiveDict();
  }
});

Template.Degree_Plan_Generator_Widget.helpers({
  careerGoals() {
    const ret = [];
    if (Template.instance().state.get(sessionKeys.CURRENT_STUDENT_ID)) {
      const user = Users.findDoc(Template.instance().state.get(sessionKeys.CURRENT_STUDENT_ID));
      _.map(user.careerGoalIDs, (id) => {
        ret.push(CareerGoals.findDoc(id));
      });
    }
    return ret;
  },
  currentSemesterName() {
    const currentSemesterID = Semesters.getCurrentSemester();
    return Semesters.toString(currentSemesterID, false);
  },
  desiredDegree() {
    if (Template.instance().state.get(sessionKeys.CURRENT_STUDENT_ID)) {
      const user = Users.findDoc(Template.instance().state.get(sessionKeys.CURRENT_STUDENT_ID));
      if (user.desiredDegreeID) {
        const degree = DesiredDegrees.findDoc({ _id: user.desiredDegreeID });
        return degree.shortName;
      }
    }
    return '';
  },
  futureSemesters() {
    const currentSemester = Semesters.getCurrentSemesterDoc();
    return _.filter(Semesters.find({ sortBy: { $gte: currentSemester.sortBy } }, { sort: { sortBy: 1 } }).fetch(),
        function notSummer(s) {
          return s.term !== Semesters.SUMMER;
        });
  },
  interests() {
    const ret = [];
    if (Template.instance().state.get(sessionKeys.CURRENT_STUDENT_ID)) {
      const user = Users.findDoc(Template.instance().state.get(sessionKeys.CURRENT_STUDENT_ID));
      _.map(user.interestIDs, (id) => {
        ret.push(Interests.findDoc(id));
      });
    }
    return ret;
  },
  selectedSemester(semester) {
    return Template.instance().state.get('selectedSemester') === semester;
  },
  semesterName(semester) {
    return Semesters.toString(semester._id, false);
  },
  semesterSlug(semester) {
    return Semesters.getSlug(semester._id);
  },
  startSemester() {
    const startSemester = Template.instance().state.get('selectedSemester');
    if (startSemester) {
      return Semesters.toString(startSemester._id, false);
    }
    return '';
  },
  userFullName() {
    if (Template.instance().state.get(sessionKeys.CURRENT_STUDENT_ID)) {
      const user = Users.findDoc(Template.instance().state.get(sessionKeys.CURRENT_STUDENT_ID));
      return Users.getFullName(user._id);
    }
    return 'Select a student';
  },
});

Template.Degree_Plan_Generator_Widget.events({
  'click .jsSemester': function clickJsInterests(event, instance) {
    event.preventDefault();
    const choice = event.target.parentElement.getElementsByTagName('input')[0].value;
    const id = Semesters.getID(choice);
    instance.state.set('selectedSemester', Semesters.findDoc(id));
  },
  'click .jsGeneratePlan': function clickGeneratePlan(event, instance) {
    event.preventDefault();
    const studentID = instance.state.get(sessionKeys.CURRENT_STUDENT_ID);
    const student = Users.findDoc(studentID);
    const currentSemester = Semesters.getCurrentSemesterDoc();
    let startSemester = instance.state.get('selectedSemester');
    if (!startSemester) {
      startSemester = currentSemester;
    }
    if (currentSemester.sortBy === startSemester.sortBy) {
      startSemester = semUtils.nextFallSpringSemester(startSemester);
    }
    // TODO: CAM do we really want to blow away the student's plan. What if they've made changes?
    courseUtils.clearPlannedCourseInstances(studentID);
    opportunityUtils.clearPlannedOpportunityInstances(studentID);
    const cis = CourseInstances.find({ studentID }).fetch();
    const ays = AcademicYearInstances.find({ studentID }).fetch();
    if (cis.length === 0) {
      _.map(ays, (year) => {
        AcademicYearInstances.removeIt(year._id);
      });
    } else {
      // TODO: CAM figure out which AYs to remove.
    }
    if (student.desiredDegreeID) {
      const degree = DesiredDegrees.findDoc({ _id: student.desiredDegreeID });
      if (degree.shortName.startsWith('B.S.')) {
        planUtils.generateBSDegreePlan(student, startSemester);
      }
      if (degree.shortName.startsWith('B.A.')) {
        planUtils.generateBADegreePlan(student, startSemester);
      }
    }
    // planUtils.generateDegreePlan(template, startSemester, student);
    // FlowRouter.go(studentDegreePlannerPageRouteName);
  },
});

Template.Degree_Plan_Generator_Widget.onRendered(function degreePlanGeneratorOnRendered() {
  this.$('.dropdown').dropdown({
    // action: 'select',
  });
});
