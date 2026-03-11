import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Button, Modal, Form, Input, message, Space } from 'antd';
import { EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { tenantAPI } from '../api';

const Tenant = () => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTenant();
  }, []);

  const loadTenant = async () => {
    setLoading(true);
    try {
      const res = await tenantAPI.getMyTenant();
      setTenant(res.data);
      form.setFieldsValue(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    form.setFieldsValue(tenant);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await tenantAPI.update(tenant.id, values);
      message.success('更新成功');
      setModalVisible(false);
      loadTenant();
    } catch (error) {
      message.error('更新失败');
    }
  };

  if (!tenant) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <Card
        title="公司信息"
        extra={<Space><Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>编辑</Button><Button icon={<ReloadOutlined />} onClick={() => loadTenant()}>刷新</Button></Space>}
      >
        <Descriptions column={2}>
          <Descriptions.Item label="公司名称">{tenant.name}</Descriptions.Item>
          <Descriptions.Item label="行业">{tenant.industry}</Descriptions.Item>
          <Descriptions.Item label="联系人">{tenant.contact_name}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{tenant.contact_phone}</Descriptions.Item>
          <Descriptions.Item label="营业执照">{tenant.business_license || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="编辑公司信息"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="公司名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="industry" label="行业">
            <Input />
          </Form.Item>
          <Form.Item name="contact_name" label="联系人">
            <Input />
          </Form.Item>
          <Form.Item name="contact_phone" label="联系电话">
            <Input />
          </Form.Item>
          <Form.Item name="business_license" label="营业执照">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tenant;
