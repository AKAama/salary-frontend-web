import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import { TeamOutlined, UserOutlined, DollarOutlined, ProjectOutlined, ReloadOutlined } from '@ant-design/icons';
import { departmentAPI, employeeAPI, payrollAPI, projectAPI } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    departmentCount: 0,
    employeeCount: 0,
    projectCount: 0,
    payrollCount: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes, payrollRes, projectRes] = await Promise.all([
        departmentAPI.list(),
        employeeAPI.list({ page: 1, page_size: 1 }),
        payrollAPI.list({ page: 1, page_size: 100 }),
        projectAPI.list({ page: 1, page_size: 1 }),
      ]);

      const payrolls = payrollRes.data?.items || payrollRes.data || [];
      const totalAmount = payrolls.reduce((sum: number, p: any) => sum + (Number(p.total_amount) || 0), 0);

      const deptCount = Array.isArray(deptRes.data) ? deptRes.data.length : (deptRes.data?.total || 0);

      setStats({
        departmentCount: deptCount,
        employeeCount: empRes.data?.total || 0,
        projectCount: projectRes.data?.total || 0,
        payrollCount: payrollRes.data?.total || 0,
        totalAmount: totalAmount,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>仪表盘</h1>
        <Button icon={<ReloadOutlined />} onClick={() => loadStats()}>
          刷新
        </Button>
      </div>
      <Row gutter={16}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="部门数量"
              value={stats.departmentCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="员工数量"
              value={stats.employeeCount}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="项目数量"
              value={stats.projectCount}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="工资单数量"
              value={stats.payrollCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="累计发放金额"
              value={stats.totalAmount}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
