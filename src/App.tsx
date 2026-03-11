import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Department from './pages/Department';
import Employee from './pages/Employee';
import Project from './pages/Project';
import Salary from './pages/Salary';
import Payroll from './pages/Payroll';
import Payment from './pages/Payment';
import Tenant from './pages/Tenant';
import WeChatConfig from './pages/WeChatConfig';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="departments" element={<Department />} />
            <Route path="employees" element={<Employee />} />
            <Route path="projects" element={<Project />} />
            <Route path="salary" element={<Salary />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="payments" element={<Payment />} />
            <Route path="settings" element={<Tenant />} />
            <Route path="wechat" element={<WeChatConfig />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
