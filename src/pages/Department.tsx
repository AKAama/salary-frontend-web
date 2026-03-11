import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { departmentAPI } from '../api';

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentAPI.list();
      setDepartments(res.data || []);
    } catch (error) {
      message.error('加载部门失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDept(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingDept(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await departmentAPI.delete(id);
      message.success('删除成功');
      loadDepartments();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingDept) {
        await departmentAPI.update(editingDept.id, values);
        message.success('更新成功');
      } else {
        await departmentAPI.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadDepartments();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '部门名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (text) => text ? new Date(text).toLocaleString() : '-' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此部门?" onConfirm={() => handleDelete(record.id)}>
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
            新增部门
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => loadDepartments()}>
            刷新
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={departments}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={editingDept ? '编辑部门' : '新增部门'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Department;
