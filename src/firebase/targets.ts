import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from './config';
// Update a target person by document ID
export const updateTargetPerson = async (
  id: string,
  data: Partial<TargetPerson> & { groupType: 'member' | 'activist' | 'supporter' }
) => {
  const ref = doc(db, 'targets', id);
  await updateDoc(ref, data);
};

// Delete a target person by document ID
export const deleteTargetPerson = async (id: string) => {
  const ref = doc(db, 'targets', id);
  await deleteDoc(ref);
};

export interface TargetPerson {
  name: string;
  address: string;
  phone: string;
  books: string[];
  targetDate: string; // ISO date string
}

export interface TargetGroup {
  type: 'member' | 'activist' | 'supporter';
  persons: TargetPerson[];
}

export const addTargetPerson = async (
  userId: string,
  groupType: 'member' | 'activist' | 'supporter',
  person: TargetPerson
) => {
  await addDoc(collection(db, 'targets'), {
    userId,
    groupType,
    ...person,
    createdAt: Timestamp.now(),
  });
};

export const getTargetPersons = async (userId: string) => {
  const q = query(collection(db, 'targets'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
