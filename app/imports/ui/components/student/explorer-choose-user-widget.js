import { Template } from 'meteor/templating';
import { Users } from '../../../api/user/UserCollection.js';
import { ROLE } from '../../../api/role/Role.js';
import * as RouteNames from '/imports/startup/client/router.js';

Template.Explorer_Choose_User_Widget.helpers({
  users(role) {
    return Users.find({ roles: [role] }, { sort: { lastName: 1 } });
  },
  label(user) {
    const name = `${user.firstName} ${user.lastName}`;
    return name.length > 11 ? `${name.substring(0, 9)}...` : name;
  },
  picture(user) {
    if (user.picture) {
      return user.picture;
    }
    return '/images/default-profile-picture.png';
  },
  usersRouteName() {
    return RouteNames.studentExplorerUsersPageRouteName;
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

Template.Explorer_Choose_User_Widget.events({
  'click .jsRetrieve': function clickJSRetrieve(event, instance) {
    const username = event.target.id;
    const user = Users.getUserFromUsername(username);
    if (user) {
      instance.userID.set(user._id);
    }
  },
});

Template.Explorer_Choose_User_Widget.onCreated(function explorerChooseUserWidgetOnCreated() {
  this.subscribe(Users.getPublicationName());
  if (this.data.userID) {
    this.userID = this.data.userID;
  }
});

Template.Explorer_Choose_User_Widget.onRendered(function explorerChooseUserWidgetOnRendered() {
  this.$('.menu .item').tab();
});

Template.Explorer_Choose_User_Widget.onDestroyed(function explorerChooseUserWidgetOnDestroyed() {
  // add your statement here
});
