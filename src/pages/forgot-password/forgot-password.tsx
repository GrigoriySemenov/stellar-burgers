import { ForgotPasswordUI } from '@ui-pages';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { selectPassword } from '@services/selectors';
import { forgotPassword, clearPasswordError } from '@services/slices/password';
import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';
export const ForgotPassword = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const { error, isLoading } = useSelector(selectPassword);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(clearPasswordError());
  }, [dispatch]);
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (!isLoading)
      void dispatch(forgotPassword(email)).then((action) => {
        if (forgotPassword.fulfilled.match(action))
          void navigate('/reset-password', { replace: true });
      });
  };
  return (
    <ForgotPasswordUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
