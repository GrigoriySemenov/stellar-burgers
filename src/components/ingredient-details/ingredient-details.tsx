import { Preloader, IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { selectIngredientById, selectIngredientsState } from '@services/selectors';
import { fetchIngredients } from '@services/slices/ingredients';
import { useDispatch, useSelector } from '@services/store';

import { RequestMessage } from '../request-message/request-message';
export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const ingredientData = useSelector((state) => selectIngredientById(state, id));
  const { isLoading, error } = useSelector(selectIngredientsState);
  if (isLoading) return <Preloader />;
  if (error)
    return (
      <RequestMessage
        message={error}
        onRetry={() => {
          void dispatch(fetchIngredients());
        }}
      />
    );
  if (!ingredientData) return <RequestMessage message="Ингредиент не найден" />;
  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
