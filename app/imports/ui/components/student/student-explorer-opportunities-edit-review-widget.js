import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { OpportunityInstances } from '../../../api/opportunity/OpportunityInstanceCollection.js';
import { Semesters } from '../../../api/semester/SemesterCollection.js';
import { Reviews } from '../../../api/review/ReviewCollection.js';
import { Slugs } from '../../../api/slug/SlugCollection.js';
import { getUserIdFromRoute } from '../shared/get-user-id-from-route';
import * as FormUtils from '../admin/form-fields/form-field-utilities.js';

const editSchema = new SimpleSchema({
  semester: { type: String, optional: false, minCount: 1 },
  rating: { type: Number, optional: true },
  comments: { type: String, optional: false },
});

Template.Student_Explorer_Opportunities_Edit_Review_Widget.onCreated(function onCreated() {
  FormUtils.setupFormWidget(this, editSchema);
  this.subscribe(Slugs.getPublicationName());
  this.subscribe(OpportunityInstances.getPublicationName());
  this.subscribe(Semesters.getPublicationName());
});

Template.Student_Explorer_Opportunities_Edit_Review_Widget.helpers({
  semesters() {
    const semesters = [];
    const opportunity = this.opportunity;
    const oi = OpportunityInstances.find({
      studentID: getUserIdFromRoute(),
      opportunityID: opportunity._id,
    }).fetch();
    _.map(oi, (o) => {
      semesters.push(Semesters.findDoc(o.semesterID));
  });
    return semesters;
  },
});

Template.Student_Explorer_Opportunities_Edit_Review_Widget.events({
  submit(event, instance) {
    event.preventDefault();
    const updatedData = FormUtils.getSchemaDataFromEvent(editSchema, event);
    instance.context.resetValidation();
    editSchema.clean(updatedData);
    instance.context.validate(updatedData);
    if (instance.context.isValid()) {
      updatedData.student = this.review.student;
      updatedData.reviewType = this.review.reviewType;
      updatedData.reviewee = this.review.reviewee;
      updatedData.slug = this.review.slug;
      Reviews.update(this.review._id, { $set: updatedData });
      FormUtils.indicateSuccess(instance, event);
    } else {
      FormUtils.indicateError(instance);
    }
  },
});