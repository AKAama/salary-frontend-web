import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { employeeAPI, departmentAPI, getErrorMessage } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [form] = Form.useForm();

  useEffect(() => {
    loadDepartments();
    loadEmployees();
  }, [pagination.current]);

  const loadDepartments = async () => {
    try {
      const res = await departmentAPI.list();
      setDepartments(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.list({ page: pagination.current, page_size: pagination.pageSize });
      setEmployees(res.data.items || []);
      setPagination({ ...pagination, total: res.data.total || 0 });
    } catch (error) {
      message.error('加载员工失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingEmp(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingEmp(record);
    form.setFieldsValue({
      ...record,
      entry_date: record.entry_date ? dayjs(record.entry_date) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await employeeAPI.delete(id);
      message.success('删除成功');
      loadEmployees();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        entry_date: values.entry_date ? values.entry_date.format('YYYY-MM-DD') : null,
      };
      if (editingEmp) {
        await employeeAPI.update(editingEmp.id, data);
        message.success('更新成功');
      } else {
        await employeeAPI.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadEmployees();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({ ...pagination, current: newPagination.current });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '职位', dataIndex: 'position', key: 'position' },
    { title: '入职日期', dataIndex: 'entry_date', key: 'entry_date', render: (text) => text || '-' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status) => status ? '在职' : '离职' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此员工?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增员工
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => loadEmployees()}>
            刷新
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        onChange={handleTableChange}
      />
      <Modal
        title={editingEmp ? '编辑员工' : '新增员工'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="id_card" label="身份证号">
            <Input />
          </Form.Item>
          <Form.Item name="department_id" label="部门">
            <Select placeholder="选择部门" allowClear>
              {departments.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="position" label="职位">
            <Input />
          </Form.Item>
          <Form.Item name="entry_date" label="入职日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Employee;
