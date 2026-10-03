import { AppHeader, Modal, IngredientDetails, OrderInfo } from '@components';
import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404,
} from '@pages';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';

import { fetchIngredients } from '@services/slices/ingredients';
import { checkUser } from '@services/slices/user';
import { useDispatch } from '@services/store';

import { ProtectedRoute } from '../protected-route/protected-route';

import type { RouteState } from '../protected-route/protected-route';

import '../../index.css';

import styles from './app.module.css';
const DetailPage = ({
  ingredient = false,
}: {
  ingredient?: boolean;
}): React.JSX.Element => {
  const { number } = useParams();
  return (
    <main className={styles.detailPageWrap}>
      <h1
        className={clsx(
          styles.detailHeader,
          'text',
          ingredient ? 'text_type_main-large' : 'text_type_digits-default'
        )}
      >
        {ingredient ? 'Детали ингредиента' : `#${number?.padStart(6, '0')}`}
      </h1>
      {ingredient ? <IngredientDetails /> : <OrderInfo />}
    </main>
  );
};
const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const background = (location.state as RouteState | null)?.background;
  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(checkUser());
  }, [dispatch]);
  const closeModal = (): void => {
    void navigate(-1);
  };
  const number = location.pathname.split('/').at(-1);
  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/ingredients/:id" element={<DetailPage ingredient />} />
        <Route path="/feed/:number" element={<DetailPage />} />
        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <DetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={closeModal}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/feed/:number"
            element={
              <Modal title={`#${number?.padStart(6, '0')}`} onClose={closeModal}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <Modal title={`#${number?.padStart(6, '0')}`} onClose={closeModal}>
                  <OrderInfo />
                </Modal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
};
export default App;
