import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, user } = useAppStore();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      if (result.success) {
        message.success('登录成功');
        navigate('/dashboard');
      } else {
        message.error(result.message || '登录失败');
      }
    } catch {
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = [
    { username: 'admin_national', role: '国家级管理员', password: 'national123' },
    { username: 'admin_shandong', role: '山东省管理员', password: 'shandong123' },
    { username: 'farm_owner_001', role: '养殖场主', password: 'owner123' },
    { username: 'county_epd_001', role: '惠民县环保局', password: 'epd123' },
    { username: 'provincial_agri_001', role: '山东省农业农村厅', password: 'agri123' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block">
          <div className="text-5xl font-bold text-teal-800 mb-4">
            畜禽养殖废弃物
            <br />
            资源化利用监管平台
          </div>
          <div className="text-lg text-gray-600 mb-8">
            实时监控 · 智能预警 · 科学决策
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: '全国覆盖', desc: '31个省份养殖场数据接入' },
              { title: '实时监测', desc: '秒级数据更新与告警' },
              { title: '智能预测', desc: 'AI预测粪污产出与处理能力' },
              { title: '分级审批', desc: '三级审批流程确保合规' },
            ].map((item, index) => (
              <Card
                key={index}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-lg font-semibold text-teal-700">
                  {item.title}
                </div>
                <div className="text-sm text-gray-500 mt-1">{item.desc}</div>
              </Card>
            ))}
          </div>
        </div>

        <Card
          className="shadow-2xl border-0"
          styles={{ body: { padding: '40px' } }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">用户登录</h1>
            <p className="text-gray-500">请输入您的账号密码</p>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 border-0 text-base font-medium"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <Alert
            icon={<InfoCircleOutlined />}
            message="测试账号"
            description={
              <div className="space-y-1 mt-2">
                {testAccounts.map((acc, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-medium">{acc.role}:</span>{' '}
                    <span className="text-teal-600 font-mono">{acc.username}</span>{' '}
                    / <span className="font-mono">{acc.password}</span>
                  </div>
                ))}
              </div>
            }
            type="info"
            showIcon
            className="mt-4"
          />
        </Card>
      </div>
    </div>
  );
};

export default Login;
