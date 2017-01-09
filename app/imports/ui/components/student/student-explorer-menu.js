import { Template } from 'meteor/templating';
import * as RouteNames from '/imports/startup/client/router.js';
import { Courses } from '../../../api/course/CourseCollection.js';
import { DesiredDegrees } from '../../../api/degree/DesiredDegreeCollection.js';
import { CareerGoals } from '../../../api/career/CareerGoalCollection.js';
import { Slugs } from '../../../api/slug/SlugCollection.js';


Template.Student_Explorer_Menu.helpers({
  careerGoalsRouteName() {
    return RouteNames.studentExplorerCareerGoalsPageRouteName;
  },
  coursesRouteName() {
    return RouteNames.studentExplorerCoursesPageRouteName;
  },
  degreesRouteName() {
    return RouteNames.studentExplorerDegreesPageRouteName;
  },
  interestsRouteName() {
    return RouteNames.studentExplorerInterestsPageRouteName;
  },
  opportunitiesRouteName() {
    return RouteNames.studentExplorerOpportunitiesPageRouteName;
  },
  courseName(course) {
    return course.shortName;
  },
  slugName(item) {
    return Slugs.findDoc(item.slugID).name;
  },
  itemName(item) {
    return item.name;
  },
  firstCourse() {
    let ret = '';
    const course = Courses.find({ number: 'ICS 101' }).fetch();
    if (course.length > 0) {
      ret = Slugs.findDoc(course[0].slugID).name;
    }
    return ret;
  },
  firstCareerGoal() {
    let ret = '';
    const careerGoal = CareerGoals.find({ name: 'Database Administrator' }).fetch();
    if (careerGoal.length > 0) {
      ret = Slugs.findDoc(careerGoal[0].slugID).name;
    }
    return ret;
  },
  firstDegree() {
    let ret = '';
    const degree = DesiredDegrees.find({ name: 'B.S. in Computer Science' }).fetch();
    if (degree.length > 0) {
      ret = Slugs.findDoc(degree[0].slugID).name;
    }
    return ret;
  },
  isType(type, value) {
    return type === value;
  },
});


Template.Student_Explorer_Menu.onCreated(function studentExplorerMenuOnCreated() {
  this.subscribe(Courses.getPublicationName());
  this.subscribe(CareerGoals.getPublicationName());
  this.subscribe(DesiredDegrees.getPublicationName());
});