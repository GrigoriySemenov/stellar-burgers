import { LoginUI } from '@ui-pages';
import { useState, useEffect } from 'react';

import { selectUserState } from '@services/selectors';
import { loginUser, clearUserError } from '@services/slices/user';
import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';
export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { error, isLoading } = useSelector(selectUserState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (!isLoading) void dispatch(loginUser({ email, password }));
  };
  return (
    <LoginUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
