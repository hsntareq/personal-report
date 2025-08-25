import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../scss/components/Navigation.module.scss';

const Navigation: React.FC = () => {
	const location = useLocation();

	const isActive = (path: string) => location.pathname === path;

	return (
		<nav className={styles.nav}>
			<div className={styles.navContainer}>
				<Link to="/" className={styles.logo}>
					🎯 ব্যক্তিগত রিপোর্ট
				</Link>
				<div className={styles.navLinks}>
					<Link
						to="/personal-report/"
						className={isActive('/personal-report/') ? `${styles.navLink} ${styles.active}` : styles.navLink}
					>
						ড্যাশবোর্ড
					</Link>
					<Link
						to="/personal-report/books"
						className={isActive('/personal-report/books') ? `${styles.navLink} ${styles.active}` : styles.navLink}
					>
						বই সংগ্রহ
					</Link>
				</div>
			</div>
		</nav>
	);
};

export default Navigation;
