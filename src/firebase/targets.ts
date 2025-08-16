import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from './config';

export interface TargetPerson {
  name: string;
  address: string;
  phone: string;
  books: string[];
  targetDate: string; // ISO date string
}

export interface TargetGroup {
  type: 'Member' | 'Activist' | 'Supporter';
  persons: TargetPerson[];
}

export const addTargetPerson = async (
  userId: string,
  groupType: 'Member' | 'Activist' | 'Supporter',
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
