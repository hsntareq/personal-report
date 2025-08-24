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

const initialGroups: TargetGroup[] = [
	{ type: 'member', persons: [] },
	{ type: 'activist', persons: [] },
	{ type: 'supporter', persons: [] },
];

const TABS = ['Report', 'Target', 'Books', 'Activity'] as const;
type TabType = typeof TABS[number];
import React, { useEffect, useState } from 'react';
import { addTargetPerson, deleteTargetPerson, getTargetPersons, updateTargetPerson } from '../firebase/targets';
import { useAuth } from '../hooks/useAuth';
import tabStyles from './ProfileTabs.module.css';
import styles from './ProfileTargets.module.css';
import AddTargetModal from './target/AddTargetModal';
// Firestore document type for a person
type FirestoreTargetPerson = {
	id?: string;
	groupType: 'member' | 'activist' | 'supporter';
	name: string;
	address: string;
	phone: string;
	books: string[];
	targetDate: string;
};// 01334923165

const ProfileTargets: React.FC = () => {
	// ...existing state and variable declarations...

	// Delete handler for a person by id
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const handleTargetDelete = async (personId: string | undefined) => {
		if (!personId) {
			alert('Invalid person ID');
			console.error('Attempted to delete with invalid personId:', personId);
			return;
		}
		if (!window.confirm('Are you sure you want to delete this person?')) return;
		setDeletingId(personId);
		setSaving(true);
		try {
			await deleteTargetPerson(personId);
			if (!currentUser) return;
			const data = await getTargetPersons(currentUser.uid);
			const grouped: Record<GroupType, TargetPerson[]> = { member: [], activist: [], supporter: [] };
			function isGroupType(val: unknown): val is GroupType { return val === 'member' || val === 'activist' || val === 'supporter'; }
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
				{ type: 'member', persons: grouped.member },
				{ type: 'activist', persons: grouped.activist },
				{ type: 'supporter', persons: grouped.supporter },
			]);
		} catch (err) {
			console.error('Failed to delete target:', err);
			alert('Failed to delete target.');
		} finally {
			setSaving(false);
			setDeletingId(null);
		}
	};
	// Accordion expand/collapse state for each person (keyed by group+index)
	const [expandedPersons, setExpandedPersons] = useState<{ [key: string]: boolean }>({});
	const [activeTab, setActiveTab] = useState<TabType>('Target');
	const [groups, setGroups] = useState<TargetGroup[]>(initialGroups);
	const [newPerson, setNewPerson] = useState<TargetPerson>({ name: '', address: '', phone: '', books: [], targetDate: '' });
	type GroupType = 'member' | 'activist' | 'supporter';
	const [selectedGroup, setSelectedGroup] = useState<GroupType>('member');
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
					member: [],
					activist: [],
					supporter: [],
				};
				function isGroupType(val: unknown): val is GroupType {
					return val === 'member' || val === 'activist' || val === 'supporter';
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
					{ type: 'supporter', persons: grouped.supporter },
					{ type: 'activist', persons: grouped.activist },
					{ type: 'member', persons: grouped.member },
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
				// Editing: update the person in Firestore by document ID
				// If groupType changed, delete old and add new in new group
				const data = await getTargetPersons(currentUser.uid);
				const oldPerson = (data as FirestoreTargetPerson[]).find((item) => item.id === editPersonId);
				console.log('[Edit] editPersonId:', editPersonId, 'oldPerson:', oldPerson, 'selectedGroup:', selectedGroup, 'personToSave:', personToSave);

				if (oldPerson) {
					if (oldPerson.groupType !== selectedGroup) {
						// Group changed: delete old, add new
						console.log('[Edit] Group changed. Deleting', editPersonId, 'and adding new:', personToSave);
						await deleteTargetPerson(editPersonId);
						await addTargetPerson(currentUser.uid, selectedGroup, personToSave as TargetPerson);
					} else {
						// Group same: update in place
						console.log('[Edit] Group same. Updating', editPersonId, 'with:', { ...personToSave, groupType: selectedGroup });
						await updateTargetPerson(editPersonId, {
							...personToSave,
							groupType: selectedGroup,
						});
					}
				} else {
					console.error('[Edit] No oldPerson found for id:', editPersonId);
				}
			} else {
				// Adding new
				console.log('[Add] Adding new person:', personToSave, 'to group:', selectedGroup);
				await addTargetPerson(currentUser.uid, selectedGroup, personToSave as TargetPerson);
			}
			// Reload from DB after add/edit
			const data = await getTargetPersons(currentUser.uid);
			const grouped: Record<GroupType, TargetPerson[]> = {
				member: [],
				activist: [],
				supporter: [],
			};
			function isGroupType(val: unknown): val is GroupType {
				return val === 'member' || val === 'activist' || val === 'supporter';
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
				{ type: 'member', persons: grouped.member },
				{ type: 'activist', persons: grouped.activist },
				{ type: 'supporter', persons: grouped.supporter },
			]);
			// Remove any expandedPersons keys that no longer exist
			setExpandedPersons(prev => {
				const validKeys = new Set([
					...grouped.member.map(p => `member-${p.id}`),
					...grouped.activist.map(p => `activist-${p.id}`),
					...grouped.supporter.map(p => `supporter-${p.id}`),
				]);
				return Object.fromEntries(Object.entries(prev).filter(([k]) => validKeys.has(k)));
			});
			setNewPerson({ name: '', address: '', phone: '', books: [], targetDate: '' });
			setBookInput('');
			setEditPersonId(null);
			setShowModal(false);
		} catch (err) {
			console.error('[handleAddPerson] Error:', err);
			alert('Failed to save target.');
		} finally {
			setSaving(false);
		}
	};

	// Edit handler: populate form with selected person's data (by id)
	const handleEditPerson = (group: GroupType, personId: string | undefined) => {
		if (!personId) return;
		const person = groups.find(g => g.type === group)?.persons.find(p => p.id === personId);
		if (person) {
			setNewPerson({ ...person });
			setBookInput('');
			setSelectedGroup(group);
			setEditPersonId(person.id || null);
			setShowModal(true);
		}
	};

	const memberBangla = (type: string) => {
		switch (type) {
			case 'member':
				return 'সদস্য';
			case 'activist':
				return 'কর্মী';
			case 'supporter':
				return 'সহযোগী';
			default:
				return type;
		}
	}

	return (
		<div className="profile-targets">
			<div className={tabStyles.tabs}>
				{TABS.map(tab => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={activeTab === tab ? `${tabStyles.tabButton} ${tabStyles.tabButtonActive}` : tabStyles.tabButton}
					>
						{tab}
					</button>
				))}
			</div>
			<div className={tabStyles.tabContent}>
				<div className={tabStyles.tabContent}>
					{activeTab === 'Target' && (
						<div className={tabStyles.card}>
							<div className={tabStyles.targetHeader}>
								<h2 className={tabStyles.targetTitle}>🎯 টার্গেট নির্ধারন</h2>
								<button className={`${styles.actionButton} ${styles.dark}`} type="button" onClick={openAddModal}>+ নতুন টার্গেট</button>
							</div>
							{loading ? <div style={{ textAlign: 'center', padding: 32 }}>লোড হচ্ছে...</div> : <>
								{/* Select Group field moved into modal below */}
								{showModal && (
									<AddTargetModal
										show={showModal}
										onClose={() => setShowModal(false)}
										onSubmit={e => {
											e.preventDefault();
											handleAddPerson();
										}}
										selectedGroup={selectedGroup}
										setSelectedGroup={setSelectedGroup}
										groups={groups}
										memberBangla={memberBangla}
										newPerson={newPerson}
										setNewPerson={setNewPerson}
										bookInput={bookInput}
										setBookInput={setBookInput}
										handleAddBook={handleAddBook}
										saving={saving}
										editPersonId={editPersonId}
									/>
								)}
								<div className={styles.targetList}>
									{groups.map((group) => {
										return (
											<div
												key={group.type} title={group.type}
												className={`${styles.groupCard} ${styles[group.type]}`}
											>
												<div className={styles.groupHeader}>
													<span className={styles.groupTitle}>
														<span className={`${styles.avatarCircle} ${styles[group.type]}`}>{group.type.charAt(0).toUpperCase()}</span>
														{memberBangla(group.type)} টার্গেট
													</span>
												</div>
												<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
													{group.persons.map((person) => {
														const personKey = `${group.type}-${person.id}`;
														const expanded = !!expandedPersons[personKey];
														const togglePerson = () => setExpandedPersons(prev => ({ ...prev, [personKey]: !prev[personKey] }));
														return (
															<li
																key={person.id}
																className={expanded ? `${styles.personRow} ${styles.expanded}` : styles.personRow}
															>
																<div
																	className={styles.personRowMain}
																	onClick={togglePerson}
																>
																	<div className={styles.personRowContent}>
																		<div>
																			<span className={styles.accordionArrow}>{expanded ? '▼' : '▶'}</span>
																			<span className={styles.personName}>{person.name}</span>
																		</div>
																		<div className={styles.personNameContainer}>
																			<button
																				type="button"
																				aria-label="Edit"
																				className={`${styles.actionButton} ${styles.square}`}
																				onClick={e => { e.stopPropagation(); handleEditPerson(group.type, person.id); }}
																			>
																				<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
																					<path d="M14.85 2.85a1.2 1.2 0 0 1 1.7 1.7l-9.2 9.2-2.1.4.4-2.1 9.2-9.2Zm2.12-2.12a3.2 3.2 0 0 0-4.53 0l-9.2 9.2a1 1 0 0 0-.26.48l-.8 4.2a1 1 0 0 0 1.18 1.18l4.2-.8a1 1 0 0 0 .48-.26l9.2-9.2a3.2 3.2 0 0 0 0-4.53Z" fill="#555" />
																				</svg>
																			</button>
																			<button
																				type="button"
																				aria-label="Delete"
																				className={`${styles.actionButton} ${styles.danger} ${styles.square}`}
																				onClick={e => {
																					e.stopPropagation();
																					handleTargetDelete(person.id);
																				}}
																				disabled={deletingId === person.id}
																			>
																				{deletingId === person.id ? (
																					<svg width="18" height="18" viewBox="0 0 50 50" style={{ display: 'block' }}>
																						<circle
																							cx="25"
																							cy="25"
																							r="20"
																							fill="none"
																							stroke="#555"
																							strokeWidth="5"
																							strokeDasharray="31.4 31.4"
																							strokeLinecap="round"
																							transform="rotate(-90 25 25)"
																						>
																							<animateTransform
																								attributeName="transform"
																								type="rotate"
																								from="0 25 25"
																								to="360 25 25"
																								dur="1s"
																								repeatCount="indefinite"
																							/>
																						</circle>
																					</svg>
																				) : (
																					<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
																						<line x1="4" y1="4" x2="14" y2="14" stroke="#555" strokeWidth="2" />
																						<line x1="14" y1="4" x2="4" y2="14" stroke="#555" strokeWidth="2" />
																					</svg>
																				)}
																			</button>
																		</div>
																	</div>
																</div>
																{expanded && (
																	<div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8, flexDirection: 'column' }}>
																		<span className={styles.targetPersonDetails} style={{ minWidth: 180, textAlign: 'left' }}><strong>ঠিকানা:</strong> {person.address}</span>
																		<span className={styles.targetPersonDetails} style={{ minWidth: 130, textAlign: 'left' }}><strong>ফোন:</strong> <a href={`tel:${person.phone}`}>{person.phone}</a></span>
																		<span className={styles.targetPersonDate} style={{ minWidth: 120, textAlign: 'left' }}>
																			<strong>টার্গেটের তারিখ:</strong> {person.targetDate ? new Date(person.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
																		</span>
																		<div className={styles.targetPersonBooks} style={{ flex: 1, textAlign: 'left', alignItems: 'flex-start', display: 'flex', flexDirection: 'column' }}>
																			<strong>বই অধ্যয়ন:</strong>
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
																	</div>
																)}
															</li>
														);
													})}
												</ul>
											</div>
										)
									})}
								</div>
							</>}
						</div>
					)}
					{activeTab === 'Report' && (
						<div className={tabStyles.card}>
							<h2 className={styles.targetTitle}>Report</h2>
							<div style={{ color: '#555', fontSize: 16, textAlign: 'center', marginTop: 40 }}>
								<span style={{ opacity: 0.7 }}>Report tab content goes here.</span>
							</div>
						</div>
					)}
					{activeTab === 'Books' && (
						<div className={tabStyles.card}>
							<h2 className={styles.targetTitle}>Books</h2>
							<div style={{ color: '#555', fontSize: 16, textAlign: 'center', marginTop: 40 }}>
								<span style={{ opacity: 0.7 }}>Books tab content goes here.</span>
							</div>
						</div>
					)}
					{activeTab === 'Activity' && (
						<div className={tabStyles.card}>
							<h2 className={styles.targetTitle}>Activity</h2>
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
