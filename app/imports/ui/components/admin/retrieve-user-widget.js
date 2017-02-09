import { Template } from 'meteor/templating';
import { CourseInstances } from '../../../api/course/CourseInstanceCollection';
import { OpportunityInstances } from '../../../api/opportunity/OpportunityInstanceCollection';
import { Users } from '../../../api/user/UserCollection.js';
import { Reviews } from '../../../api/review/ReviewCollection.js';
import { ROLE } from '../../../api/role/Role.js';
import { updateAllStudentLevelsMethod } from '../../../api/level/LevelProcessorMethods';

Template.Retrieve_User_Widget.helpers({
  users(role) {
    return Users.find({ roles: [role] }, { sort: { lastName: 1 } });
  },
  url(user) {
    return `/${user.roles[0].toLowerCase()}/${user.username}/home`;
  },
  label(user) {
    return `${user.lastName}, ${user.firstName} (${user.username})`;
  },
  studentRole() {
    return ROLE.STUDENT;
  },
  mentorRole() {
    return ROLE.MENTOR;
  },
  advisorRole() {
    return ROLE.ADVISOR;
  },
  adminRole() {
    return ROLE.ADMIN;
  },
  facultyRole() {
    return ROLE.FACULTY;
  },
  alumniRole() {
    return ROLE.ALUMNI;
  },
});

Template.Retrieve_User_Widget.events({
  'click .ui.button': function clickUpdateLevels(event) {
    event.preventDefault();
    updateAllStudentLevelsMethod.call();
  },
});

Template.Retrieve_User_Widget.onCreated(function advisorLogViewerOnCreated() {
  this.subscribe(CourseInstances.getPublicationName());
  this.subscribe(OpportunityInstances.getPublicationName());
  this.subscribe(Reviews.getPublicationName());
  this.subscribe(Users.getPublicationName());
});

Template.Retrieve_User_Widget.onRendered(function advisorLogViewerOnRendered() {
  this.$('.menu .item').tab();
});

Template.Retrieve_User_Widget.onDestroyed(function advisorLogViewerOnDestroyed() {
  // add your statement here
});

