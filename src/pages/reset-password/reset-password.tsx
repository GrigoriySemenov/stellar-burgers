import { ResetPasswordUI } from '@ui-pages';
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { selectPassword } from '@services/selectors';
import { resetPassword, clearPasswordError } from '@services/slices/password';
import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';
export const ResetPassword = (): React.JSX.Element => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const { error, isLoading } = useSelector(selectPassword);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(clearPasswordError());
  }, [dispatch]);
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (!isLoading)
      void dispatch(resetPassword({ password, token })).then((action) => {
        if (resetPassword.fulfilled.match(action))
          void navigate('/login', { replace: true });
      });
  };
  if (!sessionStorage.getItem('resetPassword'))
    return <Navigate to="/forgot-password" replace />;
  return (
    <ResetPasswordUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
