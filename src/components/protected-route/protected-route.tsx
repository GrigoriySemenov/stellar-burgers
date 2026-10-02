import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { selectUserState } from '@services/selectors';
import { useSelector } from '@services/store';

import type { ReactElement } from 'react';
import type { Location } from 'react-router-dom';
export type RouteState = {
  background?: Location;
  from?: Location;
};
export const ProtectedRoute = ({
  children,
  onlyUnAuth = false,
}: {
  children: ReactElement;
  onlyUnAuth?: boolean;
}): ReactElement => {
  const { user, isAuthChecked } = useSelector(selectUserState);
  const location = useLocation();
  const state = location.state as RouteState | null;
  if (!isAuthChecked) return <Preloader />;
  if (onlyUnAuth && user) return <Navigate to={state?.from ?? '/'} replace />;
  if (!onlyUnAuth && !user)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};
