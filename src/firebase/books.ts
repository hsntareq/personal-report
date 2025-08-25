import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	query,
	updateDoc,
	where,
} from 'firebase/firestore';
import { db } from './config';

export interface Book {
	id?: string;
	section: string;
	bookName: string;
	page: number;
	downloadUrl: string;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
}

// Add a new book
export const addBook = async (userId: string, book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
	try {
		const now = new Date().toISOString();
		const docRef = await addDoc(collection(db, 'organizationBooks'), {
			...book,
			userId,
			createdAt: now,
			updatedAt: now,
		});
		return docRef.id;
	} catch (error) {
		console.error('Error adding book:', error);
		throw error;
	}
};

// Get all books for a user
export const getBooks = async (userId: string): Promise<Book[]> => {
	try {
		const q = query(collection(db, 'organizationBooks'), where('userId', '==', userId));
		const querySnapshot = await getDocs(q);
		const books: Book[] = [];
		querySnapshot.forEach((doc) => {
			books.push({
				id: doc.id,
				...doc.data(),
			} as Book);
		});
		return books.sort((a, b) => a.section.localeCompare(b.section));
	} catch (error) {
		console.error('Error getting books:', error);
		throw error;
	}
};

// Update a book
export const updateBook = async (bookId: string, updates: Partial<Omit<Book, 'id' | 'createdAt'>>) => {
	try {
		const bookRef = doc(db, 'organizationBooks', bookId);
		await updateDoc(bookRef, {
			...updates,
			updatedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error updating book:', error);
		throw error;
	}
};

// Delete a book
export const deleteBook = async (bookId: string) => {
	try {
		await deleteDoc(doc(db, 'organizationBooks', bookId));
	} catch (error) {
		console.error('Error deleting book:', error);
		throw error;
	}
};
