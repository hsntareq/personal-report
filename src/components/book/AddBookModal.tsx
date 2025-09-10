import React from 'react';
import '../../scss/components/Modal.scss';
import '../../scss/components/ProfileTargets.scss';

interface Book {
	section: string;
	bookName: string;
	page: number;
	downloadUrl: string;
	description?: string;
}

interface AddBookModalProps {
	show: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	newBook: Book;
	setNewBook: (book: Book | ((prev: Book) => Book)) => void;
	saving: boolean;
	editBookId: string | null;
}

const AddBookModal: React.FC<AddBookModalProps> = ({
	show,
	onClose,
	onSubmit,
	newBook,
	setNewBook,
	saving,
	editBookId,
}) => {
	if (!show) return null;

	return (
		<div className="modal__overlay">
			<div className="modal__content">
				<button className="modal__close-btn" onClick={onClose}>&times;</button>
				<h3 style={{ marginBottom: 18 }}>{editBookId ? 'বই সম্পাদনা' : 'নতুন বই যোগ করুন'}</h3>
				<form onSubmit={onSubmit}>
					<div className="input-row">
						<input
							type="text"
							placeholder="বিভাগ (যেমন: ইসলামী সাহিত্য, গবেষণা)"
							value={newBook.section}
							onChange={e => setNewBook({ ...newBook, section: e.target.value })}
							className="input"
							required
						/>
						<input
							type="text"
							placeholder="বইয়ের নাম"
							value={newBook.bookName}
							onChange={e => setNewBook({ ...newBook, bookName: e.target.value })}
							className="input"
							required
						/>
					</div>
					<div className="input-row">
						<input
							type="number"
							placeholder="পৃষ্ঠা সংখ্যা"
							value={newBook.page || ''}
							onChange={e => setNewBook({ ...newBook, page: parseInt(e.target.value) || 0 })}
							className="input"
							min="1"
							required
						/>
						<input
							type="url"
							placeholder="ডাউনলোড URL (যেমন: https://example.com/book.pdf)"
							value={newBook.downloadUrl}
							onChange={e => setNewBook({ ...newBook, downloadUrl: e.target.value })}
							className="input"
							required
						/>
					</div>
					<div style={{ marginBottom: 16 }}>
						<textarea
							placeholder="বইয়ের সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)"
							value={newBook.description || ''}
							onChange={e => setNewBook({ ...newBook, description: e.target.value })}
							className="input"
							rows={3}
							style={{ resize: 'vertical' }}
						/>
					</div>
					<button
						type="submit"
						disabled={saving}
						className="action-button"
						style={{ marginTop: 12 }}
					>
						{saving ? 'সংরক্ষণ হচ্ছে...' : (editBookId ? 'বই আপডেট করুন' : 'বই যোগ করুন')}
					</button>
				</form>
			</div>
		</div>
	);
};

export default AddBookModal;
