import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';

import Home from './../screens/home/Home';
import Login from './../screens/login/Login';
import Registration from './../screens/registration/Registration';
import Layout from '../ui/Layout';
import NotFound from '../screens/404/NotFound';
import Products from '../screens/products/Products';
import Cart from '../screens/cart/Cart';
import CreateProduct from '../screens/admin/createProduct/CreateProduct';
import AdminPage from '../screens/admin/AdminPage/AdminPage';
import Profile from '../screens/profile/Profile';
import ForgotPassword from '../screens/password/ForgotPassword';
import ResetPassword from '../screens/password/ResetPassword';
import CreateVariant from '../screens/admin/createVariant/CreateVariant';
import ProductDetails from '../screens/products/ProductDetails/ProductDetails';
import PaymentSuccess from '../screens/payment/PaymentSuccess';
import AdminPaymentHistory from '../screens/admin/AdminPaymentHistory/AdminPaymentHistory';
import StockManager from '../screens/admin/Stock/StockManager/StockManager';
import PurchasesPage from '../screens/admin/PurchasesPage/PurchasesPage';
import SupportPage from '../screens/support/SupportPage/SupportPage';
import OperatorChatPage from '../screens/support/operator/OperatorChatsPage/OperatorChatPage/OperatorChatPage';
import OperatorDesk from '../screens/support/operator/OperatorDesk/OperatorDesk';
import Company from '../screens/company/Company';
import Partners from '../screens/partners/Partners';

const Router = () => {
  const { store } = useContext(Context);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      store.checkAuth();
    }
  }, [store]);

  if (store.isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<Company />} />
          <Route path="partners" element={<Partners />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:productId" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="auth/login" element={<Login />} />
          <Route path="auth/registration" element={<Registration />} />
          <Route path="profile" element={<Profile />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="operator/chats" element={<OperatorDesk />} />
          <Route path="operator/chats/:chatId" element={<OperatorChatPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="admin/products/create" element={<CreateProduct />} />
          <Route path="/admin/purchases" element={<PurchasesPage />} />
          <Route path="admin/stock" element={<StockManager />} />
          <Route
            path="admin/products/:productId/variants/create"
            element={<CreateVariant />}
          />
          <Route path="admin/payments" element={<AdminPaymentHistory />} />

          <Route path="auth/forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
        </Route>
        <Route path="/404" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default observer(Router);
