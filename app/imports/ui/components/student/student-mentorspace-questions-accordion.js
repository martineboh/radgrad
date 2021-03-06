import { Template } from 'meteor/templating';
import * as RouteNames from '/imports/startup/client/router.js';
import { MentorAnswers } from '../../../api/mentor/MentorAnswerCollection.js';
import { Users } from '../../../api/user/UserCollection.js';

Template.Student_MentorSpace_Questions_Accordion.onRendered(function studentMentorSpaceQuestionsAccordionOnRendered() {
  this.$('.ui.accordion').accordion('close', 0, { exclusive: false, collapsible: true, active: false });
});

Template.Student_MentorSpace_Questions_Accordion.helpers({
  answerCount(questionID) {
    return MentorAnswers.getAnswers(questionID).count();
  },
  isOneAnswer(questionID) {
    return MentorAnswers.getAnswers(questionID).count() === 1;
  },
  listAnswers(questionID) {
    return MentorAnswers.getAnswers(questionID);
  },
  mentorName(mentorID) {
    const firstName = Users.find({ _id: mentorID }).fetch()[0].firstName;
    const lastName = Users.find({ _id: mentorID }).fetch()[0].lastName;
    return `${firstName}  ${lastName}`;
  },
  picture(mentorID) {
    return Users.find({ _id: mentorID }).fetch()[0].picture;
  },
  usersRouteName() {
    return RouteNames.studentExplorerUsersPageRouteName;
  },
  userUsername(mentorID) {
    return Users.find({ _id: mentorID }).fetch()[0].username;
  },
});
