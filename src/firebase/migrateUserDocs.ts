import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './config';

// Script to migrate user documents to use Auth UID as document ID
// Usage: Run this script once in a Node.js environment with Firebase Admin SDK or in a secure admin route

async function migrateUserDocs() {
  const usersCol = collection(db, 'users');
  const snapshot = await getDocs(usersCol);

  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    const correctUid = data.uid;
    if (userDoc.id !== correctUid) {
      // Copy data to correct UID doc
      await setDoc(doc(db, 'users', correctUid), data);
      // Delete old doc
      await deleteDoc(doc(db, 'users', userDoc.id));
      console.log(`Migrated user ${userDoc.id} to ${correctUid}`);
    }
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  migrateUserDocs().then(() => {
    console.log('Migration complete.');
    process.exit(0);
  }).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
