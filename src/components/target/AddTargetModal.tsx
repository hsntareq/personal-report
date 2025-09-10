import React from 'react';
import '../../scss/components/Modal.scss';
import '../../scss/components/ProfileTargets.scss';

// Local type for a person in UI
interface TargetPerson {
	id?: string; // Firestore doc id
	name: string;
	address: string;
	phone: string;
	books: string[];
	targetDate: string; // ISO date string
}

interface TargetGroup {
	type: 'member' | 'activist' | 'supporter';
	persons: TargetPerson[];
}

type GroupType = 'member' | 'activist' | 'supporter';

interface AddTargetModalProps {
	show: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	selectedGroup: GroupType;
	setSelectedGroup: (group: GroupType) => void;
	groups: TargetGroup[];
	memberBangla: (type: string) => string;
	newPerson: TargetPerson;
	setNewPerson: (person: TargetPerson | ((prev: TargetPerson) => TargetPerson)) => void;
	bookInput: string;
	setBookInput: (input: string) => void;
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
		<div className="modal__overlay">
			<div className="modal__content">
				<button className="modal__close-btn" onClick={onClose}>&times;</button>
				<h3 style={{ marginBottom: 18 }}>{editPersonId ? 'টার্গেট সম্পাদনা' : 'নতুন টার্গেট যোগ করুন'}</h3>
				<form onSubmit={onSubmit}>
					<div className="input-row">
						<select
							value={selectedGroup}
							onChange={e => setSelectedGroup(e.target.value as GroupType)}
							className="input"
							required
						>
							{groups.map(group => (
								<option key={group.type} value={group.type}>
									{memberBangla(group.type)} ({group.persons.length})
								</option>
							))}
						</select>
					</div>
					<div className="input-row">
						<input
							type="text"
							placeholder="নাম"
							value={newPerson.name}
							onChange={e => setNewPerson({ ...newPerson, name: e.target.value })}
							className="input"
							required
						/>
						<input
							type="text"
							placeholder="ঠিকানা"
							value={newPerson.address}
							onChange={e => setNewPerson({ ...newPerson, address: e.target.value })}
							className="input"
							required
						/>
					</div>
					<div className="input-row">
						<input
							type="tel"
							placeholder="ফোন নম্বর"
							value={newPerson.phone}
							onChange={e => setNewPerson({ ...newPerson, phone: e.target.value })}
							className="input"
							required
						/>
						<input
							type="date"
							placeholder="টার্গেটের তারিখ"
							value={newPerson.targetDate}
							onChange={e => setNewPerson({ ...newPerson, targetDate: e.target.value })}
							className="input"
							required
						/>
					</div>
					<div style={{ marginBottom: 16 }}>
						<div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
							<input
								type="text"
								placeholder="বই যোগ করুন"
								value={bookInput}
								onChange={e => setBookInput(e.target.value)}
								className="input"
								style={{ flex: 1 }}
								onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddBook())}
							/>
							<button type="button" onClick={handleAddBook} className="action-button">
								যোগ করুন
							</button>
						</div>
						{newPerson.books.length > 0 && (
							<div style={{ marginTop: 8 }}>
								<strong>যোগ করা বই:</strong>
								<ol style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
									{newPerson.books.map((book, idx) => (
										<li key={idx} style={{ marginBottom: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<span>{book}</span>
											<button
												type="button"
												onClick={() => setNewPerson({ ...newPerson, books: newPerson.books.filter((_, i) => i !== idx) })}
												style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 14 }}
											>
												✕
											</button>
										</li>
									))}
								</ol>
							</div>
						)}
					</div>
					<button
						type="submit"
						disabled={saving}
						className="action-button"
						style={{ marginTop: 12 }}
					>
						{saving ? 'সংরক্ষণ হচ্ছে...' : (editPersonId ? 'টার্গেট আপডেট করুন' : 'টার্গেট যোগ করুন')}
					</button>
				</form>
			</div>
		</div>
	);
};

export default AddTargetModal;
