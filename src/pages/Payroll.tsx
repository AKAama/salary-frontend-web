import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Tag, Popconfirm, Card, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, DollarOutlined, ReloadOutlined } from '@ant-design/icons';
import { payrollAPI, departmentAPI, getErrorMessage } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [form] = Form.useForm();

  useEffect(() => {
    loadDepartments();
    loadPayrolls();
  }, [pagination.current]);

  const loadDepartments = async () => {
    try {
      const res = await departmentAPI.list();
      setDepartments(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadPayrolls = async () => {
    setLoading(true);
    try {
      const res = await payrollAPI.list({
        page: pagination.current,
        page_size: pagination.pageSize
      });
      setPayrolls(res.data.items || []);
      setPagination({ ...pagination, total: res.data.total || 0 });
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      await payrollAPI.generate(
        values.month.format('YYYY-MM'),
        values.department_ids,
        values.remark
      );
      message.success('生成成功');
      setModalVisible(false);
      form.resetFields();
      loadPayrolls();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handlePay = async (id) => {
    try {
      const res = await payrollAPI.pay(id);
      message.success(`发薪成功: ${res.data.paid_count} 人成功, ${res.data.failed_count} 人失败`);
      loadPayrolls();
    } catch (error) {
      message.error('发薪失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await payrollAPI.delete(id);
      message.success('删除成功');
      loadPayrolls();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleViewDetail = async (record) => {
    try {
      const res = await payrollAPI.get(record.id);
      setSelectedPayroll(res.data);
      setDetailVisible(true);
    } catch (error) {
      message.error('加载详情失败');
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({ ...pagination, current: newPagination.current });
  };

  const getStatusTag = (status) => {
    const config = {
      generated: { color: 'blue', text: '已生成' },
      paid: { color: 'green', text: '已发放' },
    };
    const c = config[status] || { color: 'default', text: status };
    return <Tag color={c.color}>{c.text}</Tag>;
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '月份', dataIndex: 'month', key: 'month' },
    { title: '员工数', dataIndex: 'total_count', key: 'total_count' },
    { title: '总金额', dataIndex: 'total_amount', key: 'total_amount', render: (v) => `¥${v?.toFixed(2) || 0}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => getStatusTag(s) },
    { title: '备注', dataIndex: 'remark', key: 'remark', render: (t) => t || '-' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (t) => t ? new Date(t).toLocaleString() : '-' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="link" onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {record.status === 'generated' && (
            <Button type="link" icon={<DollarOutlined />} onClick={() => handlePay(record.id)}>
              发薪
            </Button>
          )}
          {record.status !== 'paid' && (
            <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          生成工资单
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={payrolls}
        rowKey="id"
        loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        onChange={handleTableChange}
      />

      <Modal
        title="生成工资单"
        open={modalVisible}
        onOk={handleGenerate}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="month" label="月份" rules={[{ required: true, message: '请选择月份' }]}>
            <DatePicker.MonthPicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="department_ids" label="部门（可选）">
            <Select mode="multiple" placeholder="选择部门" allowClear>
              {departments.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`工资单详情 - ${selectedPayroll?.month}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedPayroll && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card>员工数: {selectedPayroll.total_count}</Card>
              </Col>
              <Col span={8}>
                <Card>总金额: ¥{selectedPayroll.total_amount?.toFixed(2)}</Card>
              </Col>
              <Col span={8}>
                <Card>状态: {getStatusTag(selectedPayroll.status)}</Card>
              </Col>
            </Row>
            <p>备注: {selectedPayroll.remark || '-'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payroll;
