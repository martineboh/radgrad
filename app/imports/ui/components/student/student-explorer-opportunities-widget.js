import { Template } from 'meteor/templating';
import { _ } from 'meteor/erasaur:meteor-lodash';
import { Users } from '../../../api/user/UserCollection.js';
import { Slugs } from '../../../api/slug/SlugCollection.js';
import { Semesters } from '../../../api/semester/SemesterCollection.js';
import { Reviews } from '../../../api/review/ReviewCollection.js';
import { getRouteUserName } from '../shared/route-user-name';
import { OpportunityInstances } from '../../../api/opportunity/OpportunityInstanceCollection';
import { getUserIdFromRoute } from '../shared/get-user-id-from-route';
import * as RouteNames from '/imports/startup/client/router.js';
import { Interests } from '../../../api/interest/InterestCollection';
import { ReactiveVar } from 'meteor/reactive-var';


Template.Student_Explorer_Opportunities_Widget.helpers({
  isLabel(label, value) {
    return label === value;
  },
  userPicture(user) {
    if (Users.findDoc(user).picture) {
      return Users.findDoc(user).picture;
    }
    return '/images/default-profile-picture.png';
  },
  fullName(user) {
    return `${Users.findDoc(user).firstName} ${Users.findDoc(user).lastName}`;
  },
  toUpper(string) {
    return string.toUpperCase();
  },
  userStatus(opportunity) {
    let ret = false;
    const oi = OpportunityInstances.find({
      studentID: getUserIdFromRoute(),
      opportunityID: opportunity._id,
    }).fetch();
    if (oi.length > 0) {
      ret = true;
    }
    return ret;
  },
  futureInstance(opportunity) {
    let ret = false;
    const oi = OpportunityInstances.find({
      studentID: getUserIdFromRoute(),
      opportunityID: opportunity._id,
    }).fetch();
    for (const opportunityInstance of oi) {
      if (Semesters.findDoc(opportunityInstance.semesterID).sortBy >= Semesters.getCurrentSemesterDoc().sortBy) {
        ret = true;
      }
    }
    return ret;
  },
  unverified(opportunity) {
    let ret = false;
    const oi = OpportunityInstances.find({
      studentID: getUserIdFromRoute(),
      opportunityID: opportunity._id,
    }).fetch();
    for (const opportunityInstance of oi) {
      if (!opportunityInstance.verified) {
        ret = true;
      }
    }
    return ret;
  },
  teaserUrl(teaser) {
    return teaser.url;
  },
  opportunitySemesters(opp) {
    const semesters = opp.semesterIDs;
    const semesterNames = [];
    const currentSemesterID = Semesters.getCurrentSemester();
    const currentSemester = Semesters.findDoc(currentSemesterID);
    _.map(semesters, function (sem) {
      if (Semesters.findDoc(sem).sortBy >= currentSemester.sortBy) {
        semesterNames.push(Semesters.toString(sem));
      }
    });
    return semesterNames;
  },
  review() {
    let review = '';
    review = Reviews.find({
      studentID: getUserIdFromRoute(),
      revieweeID: this.item._id,
    }).fetch();
    return review[0];
  },
  reviews() {
    let ret = false;
    let reviews = '';
    reviews = Reviews.find({
      revieweeID: this.item._id,
    }).fetch();
    if (reviews.length > 0) {
      ret = true;
    }
    return ret;
  },
  interestsRouteName() {
    return RouteNames.studentExplorerInterestsPageRouteName;
  },
  interestName(interestSlugName) {
    return Interests.findDoc(interestSlugName).name;
  },
  interestSlugName(interestSlugName) {
    const slugID = Interests.findDoc(interestSlugName).slugID;
    return Slugs.getNameFromID(slugID);
  },
  replaceSemString(array) {
    const semString = array.join(', ');
    return semString.replace(/Summer/g, 'Sum').replace(/Spring/g, 'Spr');
  },
  usersRouteName() {
    return RouteNames.studentExplorerUsersPageRouteName;
  },
  userUsername(user) {
    return Users.findDoc(user).username;
  },
  updatedTeaser(teaser) {
    console.log("calling from widget template");
    return teaser;
  },
});

Template.Student_Explorer_Opportunities_Widget.events({
  'click .addToPlan': function clickItemAddToPlan(event) {
    event.preventDefault();
    const opportunity = this.item;
    const semester = event.target.text;
    const oppSlug = Slugs.findDoc({ _id: opportunity.slugID });
    const semSplit = semester.split(' ');
    const semSlug = `${semSplit[0]}-${semSplit[1]}`;
    const username = getRouteUserName();
    const oi = {
      semester: semSlug,
      opportunity: oppSlug.name,
      verified: false,
      student: username,
    };
    OpportunityInstances.define(oi);
  },
});


Template.Student_Explorer_Opportunities_Widget.onRendered(function enableVideo() {
  setTimeout(function () {
    this.$('.ui.embed').embed();
  }, 300);
  const template = this;
  template.$('.chooseSemester')
      .popup({
        on: 'click',
      });
});


Template.Student_Explorer_Opportunities_Widget.onCreated(function studentExplorerOpportunitiesWidgetOnCreated() {
  this.updated = new ReactiveVar(false);
  this.subscribe(Slugs.getPublicationName());
  this.subscribe(Users.getPublicationName());
  this.subscribe(Semesters.getPublicationName());
  this.subscribe(Reviews.getPublicationName());
});
