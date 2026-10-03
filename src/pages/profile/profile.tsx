import { ProfileUI } from '@ui-pages';
import { useEffect, useState } from 'react';

import { selectUserState } from '@services/selectors';
import { updateUser, clearUserError } from '@services/slices/user';
import { useDispatch, useSelector } from '@services/store';

import type { TRegisterData } from '@api';
import type { SyntheticEvent, ChangeEvent } from 'react';
export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector(selectUserState);
  const [formValue, setFormValue] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
  });
  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);
  useEffect(() => {
    setFormValue({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
  }, [user]);
  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (isLoading || !isFormChanged) return;
    const changes: Partial<TRegisterData> = {};
    if (formValue.name !== user?.name) changes.name = formValue.name;
    if (formValue.email !== user?.email) changes.email = formValue.email;
    if (formValue.password) changes.password = formValue.password;
    void dispatch(updateUser(changes));
  };
  const handleCancel = (event: SyntheticEvent): void => {
    event.preventDefault();
    dispatch(clearUserError());
    setFormValue({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
  };
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFormValue((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };
  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      isLoading={isLoading}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
      updateUserError={error ?? undefined}
    />
  );
};
