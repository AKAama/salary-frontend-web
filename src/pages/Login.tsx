import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI, getErrorMessage } from '../api';

const { Option } = Select;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinishLogin = async (values) => {
    setLoading(true);
    try {
      const res = await authAPI.login(values);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onFinishRegister = async (values) => {
    setLoading(true);
    try {
      const { username, password, email, phone, tenantName, industry } = values;
      const tenantData = {
        name: tenantName,
        industry: industry || '其他',
        contact_name: username,
        contact_phone: phone,
      };
      const userData = {
        username,
        password,
        email,
        phone,
      };
      const res = await authAPI.register(tenantData, userData);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      message.success('注册成功');
      navigate('/');
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card title="薪资管理系统" style={{ width: 400 }}>
        <Tabs items={[
          {
            key: 'login',
            label: '登录',
            children: (
              <Form onFinish={onFinishLogin} layout="vertical">
                <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                  <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block size="large">
                    登录
                  </Button>
                </Form.Item>
              </Form>
            )
          },
          {
            key: 'register',
            label: '注册',
            children: (
              <Form onFinish={onFinishRegister} layout="vertical">
                <Form.Item name="tenantName" rules={[{ required: true, message: '请输入公司名称' }]}>
                  <Input prefix={<BankOutlined />} placeholder="公司名称" />
                </Form.Item>
                <Form.Item name="industry" initialValue="其他">
                  <Select placeholder="选择行业">
                    <Option value="互联网">互联网</Option>
                    <Option value="金融">金融</Option>
                    <Option value="教育">教育</Option>
                    <Option value="零售">零售</Option>
                    <Option value="制造">制造</Option>
                    <Option value="其他">其他</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                  <Input prefix={<UserOutlined />} placeholder="用户名" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                </Form.Item>
                <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
                  <Input prefix={<PhoneOutlined />} placeholder="手机号" />
                </Form.Item>
                <Form.Item name="email" rules={[{ type: 'email', message: '请输入正确的邮箱' }]}>
                  <Input prefix={<MailOutlined />} placeholder="邮箱（可选）" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    注册
                  </Button>
                </Form.Item>
              </Form>
            )
          }
        ]} />
      </Card>
    </div>
  );
};

export default Login;
