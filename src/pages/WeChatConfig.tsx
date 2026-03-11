import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import api from '../api';

const WeChatConfig = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await api.get('/wechat/config');
      form.setFieldsValue(res.data);
    } catch (error) {
      // Config not found, ignore
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post('/wechat/config', values);
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>微信支付配置<Button icon={<ReloadOutlined />} onClick={() => loadConfig()} style={{ marginLeft: 16 }}>刷新</Button></h1>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600 }}
        >
          <Form.Item name="mchid" label="商户号 (MchID)" rules={[{ required: true }]}>
            <Input placeholder="微信支付商户号" />
          </Form.Item>
          <Form.Item name="appid" label="应用ID (AppID)" rules={[{ required: true }]}>
            <Input placeholder="微信公众平台应用ID" />
          </Form.Item>
          <Form.Item name="api_key" label="API密钥 (API Key)" rules={[{ required: true }]}>
            <Input.Password placeholder="微信支付API密钥" />
          </Form.Item>
          <Form.Item name="serial_no" label="证书序列号" rules={[{ required: true }]}>
            <Input placeholder="微信支付证书序列号" />
          </Form.Item>
          <Form.Item name="private_key" label="商户私钥" rules={[{ required: true }]}>
            <Input.TextArea rows={6} placeholder="微信支付商户私钥" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default WeChatConfig;
