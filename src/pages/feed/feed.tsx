import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import { RequestMessage } from '@components/request-message/request-message';
import { selectFeed, selectIngredientsState } from '@services/selectors';
import { fetchFeed } from '@services/slices/feed';
import { useDispatch, useSelector } from '@services/store';
const refreshInterval = 5000;
export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(selectFeed);
  const ingredients = useSelector(selectIngredientsState);
  const handleRefresh = (): void => {
    void dispatch(fetchFeed());
  };
  useEffect(() => {
    void dispatch(fetchFeed());
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void dispatch(fetchFeed());
    }, refreshInterval);
    return (): void => window.clearInterval(timer);
  }, [dispatch]);
  if ((isLoading && !orders.length) || ingredients.isLoading) return <Preloader />;
  if (ingredients.error) return <RequestMessage message={ingredients.error} />;
  return (
    <>
      {error && <RequestMessage message={error} onRetry={handleRefresh} />}
      <FeedUI orders={orders} handleGetFeeds={handleRefresh} />
    </>
  );
};
