import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../scss/components/Navigation.scss';

const Navigation: React.FC = () => {
	const location = useLocation();

	const isActive = (path: string) => location.pathname === path;

	return (
		<nav className="navigation">
			<div className="navigation__container">
				<Link to="/" className="navigation__logo">
					🎯 ব্যক্তিগত রিপোর্ট
				</Link>
				<div className="navigation__links">
					<Link
						to="/personal-report/"
						className={isActive('/personal-report/') ? "navigation__link navigation__link--active" : "navigation__link"}
					>
						ড্যাশবোর্ড
					</Link>
					<Link
						to="/personal-report/books"
						className={isActive('/personal-report/books') ? "navigation__link navigation__link--active" : "navigation__link"}
					>
						বই সংগ্রহ
					</Link>
				</div>
			</div>
		</nav>
	);
};

export default Navigation;
