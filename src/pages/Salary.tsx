import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { salaryAPI, employeeAPI, getErrorMessage } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;

const Salary = () => {
  const [templates, setTemplates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [salaryModalVisible, setSalaryModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [form] = Form.useForm();
  const [salaryForm] = Form.useForm();

  useEffect(() => {
    loadTemplates();
    loadEmployees();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await salaryAPI.listTemplates();
      setTemplates(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await employeeAPI.list({ page: 1, page_size: 100 });
      setEmployees(res.data.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadSalaryRecords = async (employeeId) => {
    try {
      const res = await salaryAPI.getSalaryRecords(employeeId);
      setSalaryRecords(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const values = await form.validateFields();
      await salaryAPI.createTemplate(values);
      message.success('创建成功');
      setTemplateModalVisible(false);
      form.resetFields();
      loadTemplates();
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await salaryAPI.deleteTemplate(id);
      message.success('删除成功');
      loadTemplates();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSelectEmployee = async (employeeId) => {
    setSelectedEmployee(employeeId);
    await loadSalaryRecords(employeeId);
    setSalaryModalVisible(true);
  };

  const handleSetSalary = async () => {
    try {
      const values = await salaryForm.validateFields();
      await salaryAPI.createSalaryRecord({
        employee_id: selectedEmployee,
        salary_item_id: values.salary_item_id,
        amount: parseFloat(values.amount),
        effective_date: values.effective_date.format('YYYY-MM-DD'),
      });
      message.success('设置成功');
      salaryForm.resetFields();
      loadSalaryRecords(selectedEmployee);
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await salaryAPI.deleteSalaryRecord(id);
      message.success('删除成功');
      loadSalaryRecords(selectedEmployee);
    } catch (error) {
      message.error('删除失败');
    }
  };

  const templateColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '模板名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '默认', dataIndex: 'is_default', key: 'is_default', render: (v) => v ? '是' : '否' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteTemplate(record.id)}>
          删除
        </Button>
      ),
    },
  ];

  const recordColumns = [
    { title: '薪资项目', dataIndex: 'salary_item_name', key: 'salary_item_name' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v) => `¥${v}` },
    { title: '生效日期', dataIndex: 'effective_date', key: 'effective_date' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteRecord(record.id)}>
          删除
        </Button>
      ),
    },
  ];

  const items = [
    {
      key: 'templates',
      label: '薪资模板',
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setTemplateModalVisible(true)}>
              新增模板
            </Button>
          </div>
          <Table columns={templateColumns} dataSource={templates} rowKey="id" />
        </>
      ),
    },
    {
      key: 'records',
      label: '员工薪资',
      children: (
        <>
          <Select
            style={{ width: 300, marginBottom: 16 }}
            placeholder="选择员工"
            onChange={handleSelectEmployee}
            allowClear
          >
            {employees.map(e => <Option key={e.id} value={e.id}>{e.name} - {e.phone}</Option>)}
          </Select>
          <Table columns={recordColumns} dataSource={salaryRecords} rowKey="id" />
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>薪资管理<Button icon={<ReloadOutlined />} onClick={() => loadTemplates()} style={{ marginLeft: 16 }}>刷新</Button></h1>
      <Tabs items={items} />

      <Modal
        title="新增薪资模板"
        open={templateModalVisible}
        onOk={handleCreateTemplate}
        onCancel={() => setTemplateModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="模板名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="is_default" valuePropName="checked">
            <input type="checkbox" /> 设为默认模板
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="设置员工薪资"
        open={salaryModalVisible}
        onOk={handleSetSalary}
        onCancel={() => setSalaryModalVisible(false)}
      >
        <Form form={salaryForm} layout="vertical">
          <Form.Item name="salary_item_id" label="薪资项目" rules={[{ required: true }]}>
            <Select placeholder="选择薪资项目">
              {templates.flatMap(t => (t.items || []).map(i => (
                <Option key={i.id} value={i.id}>{i.name} ({i.item_type})</Option>
              )))}
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
            <Input type="number" prefix="¥" />
          </Form.Item>
          <Form.Item name="effective_date" label="生效日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Salary;
