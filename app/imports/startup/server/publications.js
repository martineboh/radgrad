import { AcademicYearInstances } from '../../api/year/AcademicYearInstanceCollection.js';
import { AdminChoices } from '../../api/admin/AdminChoiceCollection';
import { CareerGoals } from '../../api/career/CareerGoalCollection';
import { CourseInstances } from '../../api/course/CourseInstanceCollection.js';
import { Courses } from '../../api/course/CourseCollection.js';
import { FeedbackInstances } from '../../api/feedback/FeedbackInstanceCollection.js';
import { Feedbacks } from '../../api/feedback/FeedbackCollection.js';
import { Interests } from '../../api/interest/InterestCollection.js';
import { InterestTypes } from '../../api/interest/InterestTypeCollection.js';
import { Opportunities } from '../../api/opportunity/OpportunityCollection.js';
import { OpportunityInstances } from '../../api/opportunity/OpportunityInstanceCollection.js';
import { OpportunityTypes } from '../../api/opportunity/OpportunityTypeCollection.js';
import { Semesters } from '../../api/semester/SemesterCollection.js';
import { Users } from '../../api/user/UserCollection.js';
import { ValidUserAccounts } from '../../api/user/ValidUserAccountCollection';
import { VerificationRequests } from '../../api/verification/VerificationRequestCollection.js';

AcademicYearInstances.publish();
AdminChoices.publish();
CareerGoals.publish();
CourseInstances.publish();
Courses.publish();
FeedbackInstances.publish();
Feedbacks.publish();
Interests.publish();
InterestTypes.publish();
Opportunities.publish();
OpportunityInstances.publish();
OpportunityTypes.publish();
Semesters.publish();
Users.publish();
ValidUserAccounts.publish();
VerificationRequests.publish();
