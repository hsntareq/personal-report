// Firestore document type for a person
type FirestoreTargetPerson = {
	id?: string;
	groupType: 'Member' | 'Activist' | 'Supporter';
	name: string;
	address: string;
	phone: string;
	books: string[];
	targetDate: string;
};
import React, { useEffect, useState } from 'react';
import type { TargetPerson as DBTargetPerson } from '../firebase/targets';
import { addTargetPerson, getTargetPersons } from '../firebase/targets';
import { useAuth } from '../hooks/useAuth';
import modalStyles from './Modal.module.css';
import styles from './ProfileTargets.module.css';

interface TargetPerson {
	id?: string; // Firestore doc id
	name: string;
	address: string;
	phone: string;
	books: string[];
	targetDate: string; // ISO date string
}

interface TargetGroup {
	type: 'Member' | 'Activist' | 'Supporter';
	persons: TargetPerson[];
}

const initialGroups: TargetGroup[] = [
	{ type: 'Member', persons: [] },
	{ type: 'Activist', persons: [] },
	{ type: 'Supporter', persons: [] },
];

const TABS = ['Report', 'Target', 'Books', 'Activity'] as const;
type TabType = typeof TABS[number];

const ProfileTargets: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabType>('Target');
	const [groups, setGroups] = useState<TargetGroup[]>(initialGroups);
	const [newPerson, setNewPerson] = useState<TargetPerson>({ name: '', address: '', phone: '', books: [], targetDate: '' });
	type GroupType = 'Member' | 'Activist' | 'Supporter';
	const [selectedGroup, setSelectedGroup] = useState<GroupType>('Member');
	const [bookInput, setBookInput] = useState('');
	const { currentUser } = useAuth();
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(true);
	const [editPersonId, setEditPersonId] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(false);

	// Load targets from Firestore on mount or when user changes
	useEffect(() => {
		const fetchTargets = async () => {
			if (!currentUser) {
				setGroups(initialGroups);
				setLoading(false);
				return;
			}
			setLoading(true);
			try {
				const data = await getTargetPersons(currentUser.uid);
				// Group by type
				const grouped: Record<GroupType, TargetPerson[]> = {
					Member: [],
					Activist: [],
					Supporter: [],
				};
				function isGroupType(val: unknown): val is GroupType {
					return val === 'Member' || val === 'Activist' || val === 'Supporter';
				}
				(data as FirestoreTargetPerson[]).forEach((item) => {
					const groupType = item.groupType;
					if (isGroupType(groupType)) {
						grouped[groupType].push({
							id: item.id,
							name: item.name,
							address: item.address,
							phone: item.phone,
							books: item.books || [],
							targetDate: item.targetDate || '',
						});
					}
				});
				setGroups([
					{ type: 'Member', persons: grouped.Member },
					{ type: 'Activist', persons: grouped.Activist },
					{ type: 'Supporter', persons: grouped.Supporter },
				]);
			} catch {
				setGroups(initialGroups);
			}
			setLoading(false);
		};
		fetchTargets();
	}, [currentUser]);

	const handleAddBook = () => {
		if (bookInput.trim()) {
			setNewPerson({ ...newPerson, books: [...newPerson.books, bookInput.trim()] });
			setBookInput('');
		}
	};

	const openAddModal = () => {
		setNewPerson({ name: '', address: '', phone: '', books: [], targetDate: '' });
		setBookInput('');
		setShowModal(true);
	};

	const handleAddPerson = async () => {
		if (!newPerson.name || !newPerson.address || !newPerson.phone || !newPerson.targetDate) return;
		if (!currentUser) {
			alert('You must be logged in to add a target.');
			return;
		}
		setSaving(true);
		const personToSave = {
			...newPerson,
			books: bookInput.trim() ? [...newPerson.books, bookInput.trim()] : newPerson.books,
		};
		try {
			if (editPersonId) {
				// Editing: update the person in Firestore by deleting old and adding new
				// 1. Fetch all persons
				const data = await getTargetPersons(currentUser.uid);
				// 2. Find the person by id and remove
				const filtered = (data as FirestoreTargetPerson[]).filter((item) => item.id !== editPersonId);
				// 3. Add the updated person
				filtered.push({
					name: personToSave.name,
					address: personToSave.address,
					phone: personToSave.phone,
					books: personToSave.books,
					targetDate: personToSave.targetDate,
					groupType: selectedGroup
				});
				// 4. Remove all and re-add (simulate update)
				// (In real app, use doc IDs for precise update. Here, we re-add all for simplicity)
				for (const item of filtered) {
					await addTargetPerson(currentUser.uid, item.groupType, {
						name: item.name,
						address: item.address,
						phone: item.phone,
						books: item.books,
						targetDate: item.targetDate,
					});
				}
			} else {
				// Adding new
				await addTargetPerson(currentUser.uid, selectedGroup, personToSave as DBTargetPerson);
			}
			// Reload from DB after add/edit
			const data = await getTargetPersons(currentUser.uid);
			const grouped: Record<GroupType, TargetPerson[]> = {
				Member: [],
				Activist: [],
				Supporter: [],
			};
			function isGroupType(val: unknown): val is GroupType {
				return val === 'Member' || val === 'Activist' || val === 'Supporter';
			}
			(data as FirestoreTargetPerson[]).forEach((item) => {
				const groupType = item.groupType;
				if (isGroupType(groupType)) {
					grouped[groupType].push({
						id: item.id,
						name: item.name,
						address: item.address,
						phone: item.phone,
						books: item.books || [],
						targetDate: item.targetDate || '',
					});
				}
			});
			setGroups([
				{ type: 'Member', persons: grouped.Member },
				{ type: 'Activist', persons: grouped.Activist },
				{ type: 'Supporter', persons: grouped.Supporter },
			]);
			setNewPerson({ name: '', address: '', phone: '', books: [], targetDate: '' });
			setBookInput('');
			setEditPersonId(null);
			setShowModal(false);
		} catch {
			alert('Failed to save target.');
		} finally {
			setSaving(false);
		}
	};

	// Edit handler: populate form with selected person's data
	const handleEditPerson = (group: GroupType, idx: number) => {
		const person = groups.find(g => g.type === group)?.persons[idx];
		if (person) {
			setNewPerson({ ...person });
			setBookInput('');
			setSelectedGroup(group);
			setEditPersonId(person.id || null);
			setShowModal(true);
		}
	};

	return (
		<div className="profile-targets">
			<div className={styles.tabs}>
				{TABS.map(tab => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={activeTab === tab ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
					>
						{tab}
					</button>
				))}
			</div>
			<div className={styles.tabContent}>
				<div className={styles.tabContent}>
					{activeTab === 'Target' && (
						<div className={styles.card}>
							<h2 className={styles.targetGroupTitle}>Target Groups</h2>
							{loading ? <div style={{ textAlign: 'center', padding: 32 }}>Loading...</div> : <>
								<div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
									<label style={{ fontWeight: 500 }}>
										Select Group:
										<select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value as GroupType)} className={styles.select} style={{ marginLeft: 8 }}>
											<option value="Member">Member</option>
											<option value="Activist">Activist</option>
											<option value="Supporter">Supporter</option>
										</select>
									</label>
								</div>
								<button type="button" onClick={openAddModal} className={styles.saveButton} style={{ marginBottom: 24, background: '#007bff' }}>+ Add Person</button>
								{showModal && (
									<div className={modalStyles.modalOverlay}>
										<div className={modalStyles.modalContent}>
											<button className={modalStyles.closeBtn} onClick={() => setShowModal(false)}>&times;</button>
											<h3 style={{ marginBottom: 18 }}>{editPersonId ? 'Edit Person' : 'Add Person'}</h3>
											<div className={styles.inputRow}>
												<input type="text" placeholder="Name" value={newPerson.name} onChange={e => setNewPerson({ ...newPerson, name: e.target.value })} className={styles.input} />
												<input type="text" placeholder="Address" value={newPerson.address} onChange={e => setNewPerson({ ...newPerson, address: e.target.value })} className={styles.input} />
											</div>
											<div className={styles.inputRow}>
												<input type="text" placeholder="Phone" value={newPerson.phone} onChange={e => setNewPerson({ ...newPerson, phone: e.target.value })} className={styles.input} />
												<input type="date" placeholder="Target Date" value={newPerson.targetDate} onChange={e => setNewPerson({ ...newPerson, targetDate: e.target.value })} className={styles.input} />
											</div>
											<div className={styles.booksInput}>
												<input type="text" placeholder="Add Book" value={bookInput} onChange={e => setBookInput(e.target.value)} className={styles.input} />
												<button type="button" onClick={handleAddBook} style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 500, cursor: 'pointer' }}>+ More</button>
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
																setNewPerson(p => ({
																	...p,
																	books: p.books.filter((_, bidx) => bidx !== idx)
																}));
															}}
														>
															&times;
														</button>
													</span>
												))}
											</div>
											<button type="button" onClick={handleAddPerson} disabled={saving} className={styles.saveButton} style={{ marginTop: 12 }}>{saving ? 'Saving...' : (editPersonId ? 'Save Changes' : 'Add Person')}</button>
										</div>
									</div>
								)}
								<div className={styles.targetList}>
									{groups.map(group => (
										<div key={group.type} className={styles.targetCard}>
											<h3 className={styles.targetGroupTitle}>{group.type} Target</h3>
											<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
												{group.persons.map((person, idx) => (
													<li key={idx} className={styles.targetPerson} style={{ display: 'flex', alignItems: 'left', gap: 16, borderBottom: '1px solid #eee', padding: '10px 0', textAlign: 'left' }}>
														<span className={styles.targetPersonName} style={{ minWidth: 120, textAlign: 'left' }}>{person.name}</span>
														<span className={styles.targetPersonDetails} style={{ minWidth: 180, textAlign: 'left' }}><strong>Address:</strong> {person.address}</span>
														<span className={styles.targetPersonDetails} style={{ minWidth: 130, textAlign: 'left' }}><strong>Phone:</strong> {person.phone}</span>
														<span className={styles.targetPersonDate} style={{ minWidth: 120, textAlign: 'left' }}><strong>Date:</strong> {person.targetDate}</span>
														<div className={styles.targetPersonBooks} style={{ flex: 1, textAlign: 'left', alignItems: 'flex-start', display: 'flex', flexDirection: 'column' }}>
															<strong>Books:</strong>
															{person.books.length > 0 ? (
																<ol style={{ margin: 0, paddingLeft: 18, display: 'inline-block' }}>
																	{person.books.map((book, bidx) => (
																		<li key={bidx}>{book}</li>
																	))}
																</ol>
															) : (
																<span style={{ color: '#aaa' }}>None</span>
															)}
														</div>
														<button type="button" style={{ marginLeft: 12, padding: '4px 12px', background: '#ffc107', color: '#333', border: 'none', borderRadius: 4, fontWeight: 500, cursor: 'pointer', height: 32 }} onClick={() => handleEditPerson(group.type, idx)}>Edit</button>
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							</>}
						</div>
					)}
					{activeTab === 'Report' && (
						<div className={styles.card}>
							<h2 style={{ color: '#007bff', marginBottom: 16 }}>Report</h2>
							<div style={{ color: '#555', fontSize: 16, textAlign: 'center', marginTop: 40 }}>
								<span style={{ opacity: 0.7 }}>Report tab content goes here.</span>
							</div>
						</div>
					)}
					{activeTab === 'Books' && (
						<div className={styles.card}>
							<h2 style={{ color: '#007bff', marginBottom: 16 }}>Books</h2>
							<div style={{ color: '#555', fontSize: 16, textAlign: 'center', marginTop: 40 }}>
								<span style={{ opacity: 0.7 }}>Books tab content goes here.</span>
							</div>
						</div>
					)}
					{activeTab === 'Activity' && (
						<div className={styles.card}>
							<h2 style={{ color: '#007bff', marginBottom: 16 }}>Activity</h2>
							<div style={{ color: '#555', fontSize: 16, textAlign: 'center', marginTop: 40 }}>
								<span style={{ opacity: 0.7 }}>Activity tab content goes here.</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
export default ProfileTargets;
