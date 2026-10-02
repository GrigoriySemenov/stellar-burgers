import { ProfileMenuUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { selectUserState } from '@services/selectors';
import { logoutUser } from '@services/slices/user';
import { useDispatch, useSelector } from '@services/store';
export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(selectUserState);
  const handleLogout = (): void => {
    if (isLoading) return;
    void dispatch(logoutUser()).then((action) => {
      if (logoutUser.fulfilled.match(action)) void navigate('/login', { replace: true });
    });
  };
  return (
    <>
      <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />
      {error && (
        <p role="alert" className="text text_type_main-default">
          {error}
        </p>
      )}
    </>
  );
};
