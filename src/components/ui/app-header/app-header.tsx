import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link, NavLink, useLocation } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';
export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => {
  const { pathname } = useLocation();
  const isConstructor = pathname === '/' || pathname.startsWith('/ingredients/');
  return (
    <header className={styles.header}>
      <nav className={clsx(styles.menu, 'p-4')}>
        <div className={styles.menu_part_left}>
          <Link
            to="/"
            className={clsx(styles.link, { [styles.link_active]: isConstructor })}
          >
            <BurgerIcon type={isConstructor ? 'primary' : 'secondary'} />
            <p className="text text_type_main-default ml-2 mr-10">Конструктор</p>
          </Link>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              clsx(styles.link, { [styles.link_active]: isActive })
            }
          >
            {({ isActive }) => (
              <>
                <ListIcon type={isActive ? 'primary' : 'secondary'} />
                <p className="text text_type_main-default ml-2">Лента заказов</p>
              </>
            )}
          </NavLink>
        </div>
        <Link to="/" className={styles.logo} aria-label="Stellar Burgers">
          <Logo />
        </Link>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            clsx(styles.link, styles.link_position_last, {
              [styles.link_active]: isActive,
            })
          }
        >
          {({ isActive }) => (
            <>
              <ProfileIcon type={isActive ? 'primary' : 'secondary'} />
              <p className="text text_type_main-default ml-2">
                {userName ?? 'Личный кабинет'}
              </p>
            </>
          )}
        </NavLink>
      </nav>
    </header>
  );
};
