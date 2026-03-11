import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import api, { getErrorMessage } from '../api';

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  useEffect(() => {
    loadPayments();
  }, [pagination.current]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments', {
        params: { page: pagination.current, page_size: pagination.pageSize }
      });
      setPayments(res.data.items || []);
      setPagination({ ...pagination, total: res.data.total || 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id) => {
    try {
      await api.post(`/payments/${id}/retry`);
      message.success('重试成功');
      loadPayments();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({ ...pagination, current: newPagination.current });
  };

  const getStatusTag = (status) => {
    const config = {
      pending: { color: 'orange', text: '待处理' },
      success: { color: 'green', text: '成功' },
      failed: { color: 'red', text: '失败' },
    };
    const c = config[status] || { color: 'default', text: status };
    return <Tag color={c.color}>{c.text}</Tag>;
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '员工', dataIndex: 'employee_name', key: 'employee_name', render: (_, r) => r.employee?.name || '-' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v) => `¥${v?.toFixed(2) || 0}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => getStatusTag(s) },
    { title: '错误信息', dataIndex: 'error_message', key: 'error_message', render: (t) => t || '-' },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: (t) => t ? new Date(t).toLocaleString() : '-' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        record.status === 'failed' && (
          <Button type="link" icon={<ReloadOutlined />} onClick={() => handleRetry(record.id)}>
            重试
          </Button>
        )
      ),
    },
  ];

  return (
    <div>
      <h1>发薪记录<Button icon={<ReloadOutlined />} onClick={() => loadPayments()} style={{ marginLeft: 16 }}>刷新</Button></h1>
      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default Payment;
