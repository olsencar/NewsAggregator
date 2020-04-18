import React from 'react';
import { ResetPasswordForm } from '../ForgotPassword';
import ChangePasswordForm from '../ChangePassword';

const AccountPage = () => (
  <div>
    <h1>Account</h1>
    <ResetPasswordForm />
    <ChangePasswordForm />
  </div>
);

export default AccountPage;
