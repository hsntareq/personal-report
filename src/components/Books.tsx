import React, { useEffect, useState } from 'react';
import { addBook, deleteBook, getBooks, updateBook, type Book } from '../firebase/books';
import { useAuth } from '../hooks/useAuth';
import tabStyles from '../scss/components/ProfileTabs.module.scss';
import styles from '../scss/components/ProfileTargets.module.scss';
import AddBookModal from './book/AddBookModal';

const Books: React.FC = () => {
	const { currentUser } = useAuth();
	const [books, setBooks] = useState<Book[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(true);
	const [editBookId, setEditBookId] = useState<string | null>(null);
	const [newBook, setNewBook] = useState<Book>({
		section: '',
		bookName: '',
		page: 0,
		downloadUrl: '',
		description: ''
	});

	// Load books from Firestore on mount
	useEffect(() => {
		const fetchBooks = async () => {
			if (!currentUser) {
				setBooks([]);
				setLoading(false);
				return;
			}
			setLoading(true);
			try {
				const data = await getBooks(currentUser.uid);
				setBooks(data);
			} catch (error) {
				console.error('Failed to fetch books:', error);
				setBooks([]);
			}
			setLoading(false);
		};
		fetchBooks();
	}, [currentUser]);

	const addNewBook = () => {
		setNewBook({
			section: '',
			bookName: '',
			page: 0,
			downloadUrl: '',
			description: ''
		});
		setEditBookId(null);
		setShowModal(true);
	};

	const handleAddBook = async () => {
		if (!newBook.section || !newBook.bookName || !newBook.page || !newBook.downloadUrl) return;
		if (!currentUser) {
			alert('লগইন করুন।');
			return;
		}

		setSaving(true);
		try {
			if (editBookId) {
				await updateBook(editBookId, newBook);
				// Update local state
				setBooks(prev => prev.map(book =>
					book.id === editBookId ? { ...newBook, id: editBookId } : book
				));
			} else {
				const bookId = await addBook(currentUser.uid, newBook);
				// Add to local state
				const newBookWithId = { ...newBook, id: bookId };
				setBooks(prev => [...prev, newBookWithId]);
			}

			setNewBook({
				section: '',
				bookName: '',
				page: 0,
				downloadUrl: '',
				description: ''
			});
			setEditBookId(null);
			setShowModal(false);
		} catch (err) {
			console.error('Failed to save book:', err);
			alert('বই সংরক্ষণে ব্যর্থ।');
		} finally {
			setSaving(false);
		}
	}; const handleEditBook = (book: Book) => {
		setNewBook(book);
		setEditBookId(book.id || null);
		setShowModal(true);
	};

	const handleDeleteBook = async (bookId: string) => {
		if (!window.confirm('এই বইটি মুছে ফেলতে চান?')) return;

		try {
			await deleteBook(bookId);
			setBooks(prev => prev.filter(book => book.id !== bookId));
		} catch (error) {
			console.error('Failed to delete book:', error);
			alert('বই মুছতে ব্যর্থ।');
		}
	}; return (
		<div className="books-page">
			<div className={tabStyles.card}>
				<div className={tabStyles.targetHeader}>
					<h2 className={styles.targetTitle}>📚 বই সংগ্রহ</h2>
					<button onClick={addNewBook} className={`${styles.actionButton} ${styles.dark}`}>+ নতুন বই</button>
				</div>

				{showModal && (
					<AddBookModal
						show={showModal}
						onClose={() => setShowModal(false)}
						onSubmit={e => {
							e.preventDefault();
							handleAddBook();
						}}
						newBook={newBook}
						setNewBook={setNewBook}
						saving={saving}
						editBookId={editBookId}
					/>
				)}

				{loading ? (
					<div style={{ textAlign: 'center', padding: 32 }}>লোড হচ্ছে...</div>
				) : (
					<div className={styles.targetList}>
						{books.length === 0 ? (
							<div style={{ color: '#555', fontSize: 16, textAlign: 'center', marginTop: 40 }}>
								<span style={{ opacity: 0.7 }}>কোন বই পাওয়া যায়নি। নতুন বই যোগ করুন।</span>
							</div>
						) : (
							<div className={styles.booksGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
								{books.map((book) => (
									<div key={book.id} className={`${styles.groupCard} ${styles.bookCard}`}>
										<div className={styles.groupHeader}>
											<span className={styles.groupTitle}>
												<span className={styles.avatarCircle} style={{ background: '#28a745' }}>📚</span>
												{book.bookName}
											</span>
										</div>
										<div style={{ padding: '0 16px 16px' }}>
											<p><strong>বিভাগ:</strong> {book.section}</p>
											<p><strong>পৃষ্ঠা:</strong> {book.page}</p>
											{book.description && <p><strong>বিবরণ:</strong> {book.description}</p>}
											<div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
												<a
													href={book.downloadUrl}
													target="_blank"
													rel="noopener noreferrer"
													className={`${styles.actionButton} ${styles.primary}`}
													style={{ textDecoration: 'none', display: 'inline-block' }}
												>
													ডাউনলোড
												</a>
												<button
													type="button"
													aria-label="Edit"
													className={`${styles.actionButton} ${styles.square}`}
													onClick={() => handleEditBook(book)}
												>
													✏️
												</button>
												<button
													type="button"
													aria-label="Delete"
													className={`${styles.actionButton} ${styles.danger} ${styles.square}`}
													onClick={() => handleDeleteBook(book.id || '')}
												>
													🗑️
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Books;
