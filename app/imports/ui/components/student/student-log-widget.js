import { Template } from 'meteor/templating';
import * as RouteNames from '/imports/startup/client/router.js';
import { Users } from '../../../api/user/UserCollection.js';
import { AdvisorLogs } from '../../../api/log/AdvisorLogCollection.js';
import { getUserIdFromRoute } from '../shared/get-user-id-from-route';

Template.Student_Log_Widget.helpers({
  advisorImage(log) {
    return Users.findDoc(log.advisorID).picture;
  },
  advisorName(log) {
    return Users.findDoc(log.advisorID).firstName;
  },
  advisorUsername(log) {
    return Users.findDoc(log.advisorID).username;
  },
  displayDate(log) {
    const date = log.createdOn;
    return `${date.toDateString()}`;
  },
  logs() {
    return AdvisorLogs.find({ studentID: getUserIdFromRoute() }, { sort: { createdOn: -1 } }).fetch();
  },
  usersRouteName() {
    return RouteNames.studentExplorerUsersPageRouteName;
  },
});
