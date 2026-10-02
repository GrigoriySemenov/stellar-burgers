import { RegisterUI } from '@ui-pages';
import { useState, useEffect } from 'react';

import { selectUserState } from '@services/selectors';
import { registerUser, clearUserError } from '@services/slices/user';
import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';
export const Register = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { error, isLoading } = useSelector(selectUserState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (!isLoading) void dispatch(registerUser({ email, password, name: userName }));
  };
  return (
    <RegisterUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
      userName={userName}
      setUserName={setUserName}
    />
  );
};
