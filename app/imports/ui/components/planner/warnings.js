import { Template } from 'meteor/templating';
import { FeedbackInstances } from '../../../api/feedback/FeedbackInstanceCollection.js';
import { Feedbacks } from '../../../api/feedback/FeedbackCollection.js';
import { FeedbackType } from '../../../api/feedback/FeedbackType.js';
import { getUserIdFromRoute } from '../shared/get-user-id-from-route';

Template.Warnings.helpers({
  warningArgs(warning) {
    return {
      warning,
    };
  },
  warnings() {
    const userID = getUserIdFromRoute();
    const feedback = FeedbackInstances.find({ userID }).fetch();
    const ret = [];
    feedback.forEach((f) => {
      const feed = Feedbacks.find({ _id: f.feedbackID }).fetch();
      if (feed[0].feedbackType === FeedbackType.WARNING) {
        ret.push(f);
      }
    });
    return ret;
  },
});

Template.Warnings.events({
  // add your events here
});

Template.Warnings.onCreated(function warningsOnCreated() {
  this.subscribe(FeedbackInstances.getPublicationName());
  this.subscribe(Feedbacks.getPublicationName());
});

Template.Warnings.onRendered(function warningsOnRendered() {
  // add your statement here
});

Template.Warnings.onDestroyed(function warningsOnDestroyed() {
  // add your statement here
});

