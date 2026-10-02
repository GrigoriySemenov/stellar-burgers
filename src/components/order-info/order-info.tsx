import { Preloader, OrderInfoUI } from '@ui';
import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
  selectOrderByNumber,
  selectOrder,
  selectIngredients,
  selectIngredientsState,
} from '@services/selectors';
import { fetchOrder } from '@services/slices/order';
import { useDispatch, useSelector } from '@services/store';

import { RequestMessage } from '../request-message/request-message';

import type { TIngredient } from '@utils-types';
export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams();
  const orderNumber = Number(number);
  const dispatch = useDispatch();
  const orderData = useSelector((state) => selectOrderByNumber(state, orderNumber));
  const ingredients = useSelector(selectIngredients);
  const { error, isLoading } = useSelector(selectOrder);
  const ingredientsState = useSelector(selectIngredientsState);
  useEffect(() => {
    if (!orderData && Number.isInteger(orderNumber) && orderNumber > 0)
      void dispatch(fetchOrder(orderNumber));
  }, [dispatch, orderNumber, orderData]);
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;
    const date = new Date(orderData.createdAt);
    type TIngredientsWithCount = Record<
      string,
      TIngredient & {
        count: number;
      }
    >;
    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }
        return acc;
      },
      {}
    );
    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );
    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);
  if (ingredientsState.error) return <RequestMessage message={ingredientsState.error} />;
  if (!Number.isInteger(orderNumber) || orderNumber <= 0)
    return <RequestMessage message="Заказ не найден" />;
  if (!orderData && error && !isLoading)
    return (
      <RequestMessage
        message={error}
        onRetry={() => {
          void dispatch(fetchOrder(orderNumber));
        }}
      />
    );
  if (!orderInfo) {
    return <Preloader />;
  }
  return <OrderInfoUI orderInfo={orderInfo} />;
};
