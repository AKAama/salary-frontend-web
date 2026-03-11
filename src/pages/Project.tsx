import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Popconfirm, Tag, Space, Drawer, InputNumber, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons';
import { projectAPI, employeeAPI, getErrorMessage } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectEmployees, setProjectEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [form] = Form.useForm();
  const [employeeForm] = Form.useForm();
  const [adjustmentModalVisible, setAdjustmentModalVisible] = useState(false);
  const [adjustmentForm] = Form.useForm();
  const [selectedProjectEmployee, setSelectedProjectEmployee] = useState(null);
  const [quickPayModalVisible, setQuickPayModalVisible] = useState(false);
  const [quickPayForm] = Form.useForm();

  useEffect(() => {
    loadProjects();
  }, [pagination.current]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.list({
        page: pagination.current,
        page_size: pagination.pageSize
      });
      setProjects(res.data.items || []);
      setPagination({ ...pagination, total: res.data.total || 0 });
    } catch (error) {
      message.error('加载项目失败');
    } finally {
      setLoading(false);
    }
  };

  const loadAllEmployees = async () => {
    try {
      const res = await employeeAPI.list({ page: 1, page_size: 100 });
      setAllEmployees(res.data.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = () => {
    setEditingProject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProject(record);
    form.setFieldsValue({
      ...record,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await projectAPI.delete(id);
      message.success('删除成功');
      loadProjects();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      };
      if (editingProject) {
        await projectAPI.update(editingProject.id, data);
        message.success('更新成功');
      } else {
        await projectAPI.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadProjects();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleManageEmployees = async (project) => {
    setSelectedProject(project);
    try {
      const res = await projectAPI.listEmployees(project.id);
      setProjectEmployees(res.data.items || []);
      await loadAllEmployees();
      setEmployeeModalVisible(true);
    } catch (error) {
      message.error('加载员工失败');
    }
  };

  const handleAddEmployee = async () => {
    try {
      const values = await employeeForm.validateFields();
      // 根据是否有 employee_id 判断是正式员工还是临时工
      const data = values.employee_id
        ? { employee_id: values.employee_id, hourly_rate: values.hourly_rate || 0, daily_rate: values.daily_rate || 0, salary_type: values.salary_type || 'hourly' }
        : { name: values.name, phone: values.phone, salary_type: values.salary_type || 'hourly', hourly_rate: values.hourly_rate || 0, daily_rate: values.daily_rate || 0, remarks: values.remarks };

      await projectAPI.addEmployee(selectedProject.id, data);
      message.success('添加成功');
      employeeForm.resetFields();
      const res = await projectAPI.listEmployees(selectedProject.id);
      setProjectEmployees(res.data.items || []);
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleRemoveEmployee = async (projectEmployeeId) => {
    try {
      await projectAPI.removeEmployee(selectedProject.id, projectEmployeeId);
      message.success('移除成功');
      const res = await projectAPI.listEmployees(selectedProject.id);
      setProjectEmployees(res.data.items || []);
    } catch (error) {
      message.error('移除失败');
    }
  };

  const handleOpenAdjustment = (record) => {
    setSelectedProjectEmployee(record);
    setAdjustmentModalVisible(true);
  };

  const handleAddAdjustment = async () => {
    try {
      const values = await adjustmentForm.validateFields();
      await projectAPI.addAdjustment(selectedProject.id, selectedProjectEmployee.id, values);
      message.success('添加成功');
      setAdjustmentModalVisible(false);
      adjustmentForm.resetFields();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleOpenQuickPay = (record) => {
    setSelectedProjectEmployee(record);
    quickPayForm.setFieldsValue({ work_hours: 8, work_days: 1 });
    setQuickPayModalVisible(true);
  };

  const handleQuickPay = async () => {
    try {
      const values = await quickPayForm.validateFields();
      const res = await projectAPI.quickPay(
        selectedProject.id,
        selectedProjectEmployee.id,
        values.work_hours,
        values.work_days
      );
      message.success(`发薪成功！金额: ¥${res.data.amount}`);
      setQuickPayModalVisible(false);
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({ ...pagination, current: newPagination.current });
  };

  const getStatusTag = (status) => {
    const config = {
      draft: { color: 'default', text: '草稿' },
      running: { color: 'processing', text: '进行中' },
      completed: { color: 'success', text: '已完成' },
      cancelled: { color: 'error', text: '已取消' },
    };
    const c = config[status] || { color: 'default', text: status };
    return <Tag color={c.color}>{c.text}</Tag>;
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    { title: '客户名称', dataIndex: 'client_name', key: 'client_name', render: (t) => t || '-' },
    { title: '开始日期', dataIndex: 'start_date', key: 'start_date', render: (t) => t || '-' },
    { title: '结束日期', dataIndex: 'end_date', key: 'end_date', render: (t) => t || '-' },
    { title: '员工数', dataIndex: 'employee_count', key: 'employee_count' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => getStatusTag(s) },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<TeamOutlined />} onClick={() => handleManageEmployees(record)}>
            员工
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此项目?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const employeeColumns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    {
      title: '薪资类型', dataIndex: 'salary_type', key: 'salary_type',
      render: (t) => t === 'daily' ? '日薪' : '时薪'
    },
    {
      title: '薪资', dataIndex: 'hourly_rate', key: 'rate',
      render: (_, r) => r.salary_type === 'daily'
        ? `¥${r.daily_rate}/天`
        : `¥${r.hourly_rate}/时`
    },
    { title: '备注', dataIndex: 'remarks', key: 'remarks', render: (t) => t || '-' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleOpenAdjustment(record)}>
            调薪
          </Button>
          <Button type="link" size="small" icon={<DollarOutlined />} onClick={() => handleOpenQuickPay(record)}>
            发薪
          </Button>
          <Button type="link" danger size="small" onClick={() => handleRemoveEmployee(record.id)}>
            移除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增项目
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => loadProjects()}>
            刷新
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={projects}
        rowKey="id"
        loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingProject ? '编辑项目' : '新增项目'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="如：顺丰速运" />
          </Form.Item>
          <Form.Item name="client_name" label="客户名称">
            <Input placeholder="如：顺丰速运有限公司" />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <TextArea rows={3} placeholder="项目描述" />
          </Form.Item>
          <Form.Item name="start_date" label="开始日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="end_date" label="结束日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="draft">
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="running">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`项目员工 - ${selectedProject?.name}`}
        open={employeeModalVisible}
        onClose={() => setEmployeeModalVisible(false)}
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <Divider>添加员工</Divider>
          <Form form={employeeForm} layout="vertical">
            <Space wrap>
              <Form.Item name="employee_id" label="正式员工" style={{ width: 150 }}>
                <Select placeholder="选择正式员工" allowClear showSearch optionFilterProp="children">
                  {allEmployees
                    .filter(e => !projectEmployees.find(pe => pe.employee_id === e.id))
                    .map(e => (
                      <Option key={e.id} value={e.id}>{e.name}</Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item label="或添加临时工" style={{ marginBottom: 0 }}>
                <Space>
                  <Form.Item name="name" style={{ marginBottom: 0 }}>
                    <Input placeholder="临时工姓名" style={{ width: 100 }} />
                  </Form.Item>
                  <Form.Item name="phone" style={{ marginBottom: 0 }}>
                    <Input placeholder="手机号" style={{ width: 120 }} />
                  </Form.Item>
                </Space>
              </Form.Item>
            </Space>
            <Space style={{ marginTop: 8 }}>
              <Form.Item name="salary_type" label="薪资类型" initialValue="hourly">
                <Select style={{ width: 80 }}>
                  <Option value="hourly">时薪</Option>
                  <Option value="daily">日薪</Option>
                </Select>
              </Form.Item>
              <Form.Item name="hourly_rate" label="时薪" initialValue={0}>
                <InputNumber min={0} placeholder="时薪" style={{ width: 80 }} />
              </Form.Item>
              <Form.Item name="daily_rate" label="日薪" initialValue={0}>
                <InputNumber min={0} placeholder="日薪" style={{ width: 80 }} />
              </Form.Item>
              <Form.Item name="remarks" label="备注">
                <Input placeholder="备注" style={{ width: 120 }} />
              </Form.Item>
              <Button type="primary" onClick={handleAddEmployee}>添加</Button>
            </Space>
          </Form>
        </div>

        <Table
          dataSource={projectEmployees}
          rowKey="id"
          size="small"
          pagination={false}
          columns={employeeColumns}
        />
      </Drawer>

      {/* 调薪 Modal */}
      <Modal
        title="调薪"
        open={adjustmentModalVisible}
        onOk={handleAddAdjustment}
        onCancel={() => setAdjustmentModalVisible(false)}
      >
        <Form form={adjustmentForm} layout="vertical">
          <Form.Item name="adjustment_type" label="类型" rules={[{ required: true }]}>
            <Select>
              <Option value="bonus">加钱</Option>
              <Option value="deduction">扣钱</Option>
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="原因/备注">
            <Input placeholder="如：加班费、迟到扣款等" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 一键发薪 Modal */}
      <Modal
        title="一键发薪"
        open={quickPayModalVisible}
        onOk={handleQuickPay}
        onCancel={() => setQuickPayModalVisible(false)}
      >
        <Form form={quickPayForm} layout="vertical">
          <p>员工: {selectedProjectEmployee?.name}</p>
          <p>薪资类型: {selectedProjectEmployee?.salary_type === 'daily' ? '日薪' : '时薪'}</p>
          <p>
            当前费率: ¥{selectedProjectEmployee?.salary_type === 'daily'
              ? selectedProjectEmployee?.daily_rate
              : selectedProjectEmployee?.hourly_rate}
            /{selectedProjectEmployee?.salary_type === 'daily' ? '天' : '小时'}
          </p>
          {selectedProjectEmployee?.salary_type === 'daily' ? (
            <Form.Item name="work_days" label="工作天数" rules={[{ required: true }]}>
              <InputNumber min={0} precision={1} style={{ width: '100%' }} />
            </Form.Item>
          ) : (
            <Form.Item name="work_hours" label="工作时数" rules={[{ required: true }]}>
              <InputNumber min={0} precision={1} style={{ width: '100%' }} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Project;
