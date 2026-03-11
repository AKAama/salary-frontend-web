import React from 'react';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ProjectOutlined,
  DollarOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SettingOutlined,
  WechatOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const LayoutPage = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/departments', icon: <TeamOutlined />, label: '部门管理' },
    { key: '/employees', icon: <UserOutlined />, label: '员工管理' },
    { key: '/projects', icon: <ProjectOutlined />, label: '项目管理' },
    { key: '/salary', icon: <DollarOutlined />, label: '薪资管理' },
    { key: '/payroll', icon: <FileTextOutlined />, label: '工资单' },
    { key: '/payments', icon: <WechatOutlined />, label: '发薪记录' },
    { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'tenant',
      icon: <SettingOutlined />,
      label: '公司信息',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'wechat',
      icon: <WechatOutlined />,
      label: '微信配置',
      onClick: () => navigate('/wechat'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" breakpoint="lg" collapsedWidth="0">
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 18,
          fontWeight: 'bold'
        }}>
          薪资管理系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: token.colorBgContainer,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user.username || '用户'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: token.colorBgContainer, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
