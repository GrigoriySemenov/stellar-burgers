import { BurgerConstructorUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { selectConstructor, selectUser, selectOrder } from '@services/selectors';
import { createOrder, clearCreatedOrder } from '@services/slices/order';
import { useDispatch, useSelector } from '@services/store';
export const BurgerConstructor = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const constructorItems = useSelector(selectConstructor);
  const user = useSelector(selectUser);
  const { isCreating, createdOrder, createError } = useSelector(selectOrder);
  const onOrderClick = (): void => {
    if (isCreating) return;
    if (!user) {
      void navigate('/login', { state: { from: location } });
      return;
    }
    if (!constructorItems.bun) return;
    void dispatch(
      createOrder([
        constructorItems.bun._id,
        ...constructorItems.ingredients.map((item) => item._id),
        constructorItems.bun._id,
      ])
    );
  };
  const closeOrderModal = (): void => {
    if (!isCreating) dispatch(clearCreatedOrder());
  };
  const price =
    (constructorItems.bun?.price ?? 0) * 2 +
    constructorItems.ingredients.reduce((sum, item) => sum + item.price, 0);
  return (
    <BurgerConstructorUI
      price={price}
      constructorItems={constructorItems}
      orderRequest={isCreating}
      orderModalData={createdOrder}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
      errorText={createError ?? undefined}
    />
  );
};
