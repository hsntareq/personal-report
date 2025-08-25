import React from 'react';
import modalStyles from '../../scss/components/Modal.module.scss';
import styles from '../../scss/components/ProfileTargets.module.scss';

type GroupType = 'member' | 'activist' | 'supporter';

interface TargetPerson {
	name: string;
	address: string;
	phone: string;
	books: string[];
	targetDate: string;
}

interface AddTargetModalProps {
	show: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	selectedGroup: GroupType;
	setSelectedGroup: (group: GroupType) => void;
	groups: { type: GroupType }[];
	memberBangla: (type: string) => string;
	newPerson: TargetPerson;
	setNewPerson: (p: TargetPerson | ((prev: TargetPerson) => TargetPerson)) => void;
	bookInput: string;
	setBookInput: (s: string) => void;
	handleAddBook: () => void;
	saving: boolean;
	editPersonId: string | null;
}

const AddTargetModal: React.FC<AddTargetModalProps> = ({
	show,
	onClose,
	onSubmit,
	selectedGroup,
	setSelectedGroup,
	groups,
	memberBangla,
	newPerson,
	setNewPerson,
	bookInput,
	setBookInput,
	handleAddBook,
	saving,
	editPersonId,
}) => {
	if (!show) return null;
	return (
		<div className={modalStyles.modalOverlay}>
			<div className={modalStyles.modalContent}>
				<button className={modalStyles.closeBtn} onClick={onClose}>&times;</button>
				<h3 style={{ marginBottom: 18 }}>{editPersonId ? 'Edit Person' : 'Add Person'}</h3>
				<form onSubmit={onSubmit}>
					<div style={{ marginBottom: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
						<label style={{ fontWeight: 500 }}>
							সাংগঠনিক মান:
							<select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value as GroupType)} className={styles.select} style={{ marginLeft: 8 }}>
								{groups.map(group => (
									<option key={group.type} value={group.type}>{memberBangla(group.type)}</option>
								))}
							</select>
						</label>
					</div>
					<div className={styles.inputRow}>
						<input type="text" placeholder="নাম" value={newPerson.name} onChange={e => setNewPerson({ ...newPerson, name: e.target.value })} className={styles.input} />
						<input type="text" placeholder="ঠিকানা" value={newPerson.address} onChange={e => setNewPerson({ ...newPerson, address: e.target.value })} className={styles.input} />
					</div>
					<div className={styles.inputRow}>
						<input type="text" placeholder="মোবাইল" value={newPerson.phone} onChange={e => setNewPerson({ ...newPerson, phone: e.target.value })} className={styles.input} />
						<input type="date" placeholder="টার্গেট তারিখ" value={newPerson.targetDate} onChange={e => setNewPerson({ ...newPerson, targetDate: e.target.value })} className={styles.input} />
					</div>
					<div className={styles.booksInput}>
						<input type="text" placeholder="বই যোগ করুন" value={bookInput} onChange={e => setBookInput(e.target.value)} className={styles.input} />
						<button type="button" className={styles.actionButton} onClick={handleAddBook}>+ আরও</button>
					</div>
					<div className={styles.booksList}>
						{newPerson.books.map((book, idx) => (
							<span key={idx} className={styles.bookItem} style={{ display: 'inline-flex', alignItems: 'center', marginRight: 6 }}>
								{book}
								<button
									type="button"
									aria-label="Remove book"
									style={{
										marginLeft: 4,
										background: 'none',
										border: 'none',
										color: '#d00',
										fontWeight: 'bold',
										fontSize: 16,
										cursor: 'pointer',
										lineHeight: 1,
									}}
									onClick={() => {
										setNewPerson((p: TargetPerson) => ({
											...p,
											books: p.books.filter((_, bidx: number) => bidx !== idx)
										}));
									}}
								>
									&times;
								</button>
							</span>
						))}
					</div>
					<button type="submit" disabled={saving} className={styles.actionButton} style={{ marginTop: 12 }}>{saving ? 'সংরক্ষণ হচ্ছে...' : (editPersonId ? 'টার্গেট আপডেট করুন' : 'টার্গেট যোগ করুন')}</button>
				</form>
			</div>
		</div>
	);
};

export default AddTargetModal;
