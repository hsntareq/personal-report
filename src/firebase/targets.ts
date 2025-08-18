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
	// Check if the document exists before deleting
	const snapshot = await import('firebase/firestore').then(m => m.getDoc(ref));
	if (!snapshot.exists()) {
		console.warn(`Target with id ${id} does not exist in Firestore.`);
		return;
	}
	await deleteDoc(ref);
	console.log(`Deleted target with id ${id}`);
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
	const colRef = collection(db, 'targets');
	const docRef = await addDoc(colRef, {
		userId,
		groupType,
		...person,
		createdAt: Timestamp.now(),
	});
	// Add the generated id to the document itself
	await updateDoc(docRef, { id: docRef.id });
	return docRef.id;
};

export const getTargetPersons = async (userId: string) => {
	const q = query(collection(db, 'targets'), where('userId', '==', userId));
	const snapshot = await getDocs(q);
	return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
