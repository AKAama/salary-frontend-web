// 处理 API 错误响应
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
    } else if (typeof data.detail === 'object') {
      // 对象格式的错误
      return data.detail.msg || JSON.stringify(data.detail);
    }
  }

  // 其他错误格式
  return data.message || data.error || '请求失败';
};
