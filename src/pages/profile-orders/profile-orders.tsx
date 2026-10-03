import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { RequestMessage } from '@components/request-message/request-message';
import { selectHistory, selectIngredientsState } from '@services/selectors';
import { fetchHistory } from '@services/slices/history';
import { useDispatch, useSelector } from '@services/store';
const refreshInterval = 5000;
export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(selectHistory);
  const ingredients = useSelector(selectIngredientsState);
  const handleRefresh = (): void => {
    void dispatch(fetchHistory());
  };
  useEffect(() => {
    void dispatch(fetchHistory());
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void dispatch(fetchHistory());
    }, refreshInterval);
    return (): void => window.clearInterval(timer);
  }, [dispatch]);
  if ((isLoading && !orders.length) || ingredients.isLoading) return <Preloader />;
  if (ingredients.error) return <RequestMessage message={ingredients.error} />;
  return (
    <>
      {error && <RequestMessage message={error} onRetry={handleRefresh} />}
      <ProfileOrdersUI orders={orders} />
    </>
  );
};
