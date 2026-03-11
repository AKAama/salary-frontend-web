import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (tenantData, userData) => api.post('/auth/register', {
    tenant_data: tenantData,
    user_data: userData
  }),
  getMe: () => api.get('/auth/me'),
};

// Department API
export const departmentAPI = {
  list: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  get: (id) => api.get(`/departments/${id}`),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Employee API
export const employeeAPI = {
  list: (params) => api.get('/employees', { params }),
  create: (data) => api.post('/employees', data),
  get: (id) => api.get(`/employees/${id}`),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Salary API
export const salaryAPI = {
  listTemplates: () => api.get('/salary/templates'),
  createTemplate: (data) => api.post('/salary/templates', data),
  getTemplate: (id) => api.get(`/salary/templates/${id}`),
  updateTemplate: (id, data) => api.put(`/salary/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/salary/templates/${id}`),
  getSalaryRecords: (employeeId) => api.get(`/salary/records/${employeeId}`),
  createSalaryRecord: (data) => api.post('/salary/records', data),
  deleteSalaryRecord: (id) => api.delete(`/salary/records/${id}`),
};

// Payroll API
export const payrollAPI = {
  list: (params) => api.get('/payrolls', { params }),
  get: (id) => api.get(`/payrolls/${id}`),
  generate: (month, departmentIds, remark) => api.post('/payrolls/generate', { month, department_ids: departmentIds, remark }),
  pay: (id) => api.post(`/payrolls/${id}/pay`),
  delete: (id) => api.delete(`/payrolls/${id}`),
};

// Tenant API
export const tenantAPI = {
  getMyTenant: () => api.get('/tenants/me'),
  update: (id, data) => api.put(`/tenants/${id}`, data),
};

// Payment API
export const paymentAPI = {
  list: (params) => api.get('/payments', { params }),
  get: (id) => api.get(`/payments/${id}`),
  retry: (id) => api.post(`/payments/${id}/retry`),
};

// Project API
export const projectAPI = {
  list: (params) => api.get('/projects', { params }),
  create: (data) => api.post('/projects', data),
  get: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  // 项目员工管理
  listEmployees: (projectId) => api.get(`/projects/${projectId}/employees`),
  addEmployee: (projectId, data) => api.post(`/projects/${projectId}/employees`, data),
  updateEmployee: (projectId, projectEmployeeId, data) => api.put(`/projects/${projectId}/employees/${projectEmployeeId}`, data),
  removeEmployee: (projectId, projectEmployeeId) => api.delete(`/projects/${projectId}/employees/${projectEmployeeId}`),
  // 调薪记录
  getAdjustments: (projectId, projectEmployeeId) => api.get(`/projects/${projectId}/employees/${projectEmployeeId}/adjustments`),
  addAdjustment: (projectId, projectEmployeeId, data) => api.post(`/projects/${projectId}/employees/${projectEmployeeId}/adjustments`, data),
  deleteAdjustment: (projectId, projectEmployeeId, adjustmentId) => api.delete(`/projects/${projectId}/employees/${projectEmployeeId}/adjustments/${adjustmentId}`),
  // 一键发薪
  quickPay: (projectId, projectEmployeeId, workHours, workDays) => {
    const params = new URLSearchParams();
    if (workHours) params.append('work_hours', workHours);
    if (workDays) params.append('work_days', workDays);
    return api.post(`/projects/${projectId}/employees/${projectEmployeeId}/pay?${params.toString()}`);
  },
};

// 错误处理工具函数
export const getErrorMessage = (error) => {
  if (!error.response) {
    return '网络错误，请检查网络连接';
  }

  const { data } = error.response;

  // FastAPI 验证错误格式
  if (data.detail) {
    if (Array.isArray(data.detail)) {
      // Pydantic 验证错误数组
      return data.detail.map(err => {
        if (typeof err === 'string') return err;
        const loc = err.loc?.join('.') || '';
        return `${loc ? loc + ': ' : ''}${err.msg}`;
      }).join(', ');
    } else if (typeof data.detail === 'string') {
      return data.detail;
    }
  }

  // 其他错误格式
  return data.message || data.error || '请求失败';
};

export default api;
