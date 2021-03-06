import { checkIntegrity } from '/imports/api/integrity/IntegrityChecker';

// Invoke checkIntegrity on startup, print out message if integrity issues were found.
const integrity = checkIntegrity();
if (integrity.count > 0) {
  console.log(checkIntegrity().message);
}
