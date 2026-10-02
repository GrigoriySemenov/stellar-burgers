import { ConstructorPageUI } from '@ui-pages';

import { RequestMessage } from '@components/request-message/request-message';
import { selectIngredientsState } from '@services/selectors';
import { fetchIngredients } from '@services/slices/ingredients';
import { useDispatch, useSelector } from '@services/store';
export const ConstructorPage = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector(selectIngredientsState);
  if (error)
    return (
      <RequestMessage
        message={error}
        onRetry={() => {
          void dispatch(fetchIngredients());
        }}
      />
    );
  if (!isLoading && !items.length)
    return (
      <RequestMessage
        message="Ингредиенты пока недоступны"
        onRetry={() => {
          void dispatch(fetchIngredients());
        }}
      />
    );
  return <ConstructorPageUI isIngredientsLoading={isLoading || !items.length} />;
};
