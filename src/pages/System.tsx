import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tabs,
  message,
  Switch,
  Descriptions,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/store';
import { provinces, processTypes, livestockTypes } from '@/mock/data';
import { User, UserRole } from '@/types';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const roleMap: Record<UserRole, { label: string; color: string }> = {
  national: { label: '国家级管理员', color: 'purple' },
  provincial: { label: '省级管理员', color: 'blue' },
  municipal: { label: '市级管理员', color: 'cyan' },
  county_epd: { label: '县级环保局', color: 'green' },
  provincial_agri: { label: '省级农业农村厅', color: 'orange' },
  farm_owner: { label: '养殖场主', color: 'geekblue' },
};

const System: React.FC = () => {
  const { user, hasPermission } = useAppStore();
  const [users, setUsers] = useState<User[]>(useAppStore.getState().user ? [useAppStore.getState().user!] : []);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm] = Form.useForm();

  const [dictType, setDictType] = useState('province');

  const canManageSystem = hasPermission('all');

  const handleAddUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    userForm.setFieldsValue(user);
    setUserModalVisible(true);
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      onOk: () => {
        setUsers(users.filter((u) => u.id !== userId));
        message.success('删除成功');
      },
    });
  };

  const handleToggleUserStatus = (userId: string, enabled: boolean) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, enabled } : u)));
    message.success(enabled ? '用户已启用' : '用户已禁用');
  };

  const handleUserSubmit = async () => {
    try {
      const values = await userForm.validateFields();
      if (editingUser) {
        setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...values } : u)));
        message.success('用户信息更新成功');
      } else {
        const newUser: User = {
          ...values,
          id: `user_${String(users.length + 1).padStart(3, '0')}`,
          permissions: values.role === 'national' ? ['all'] : ['view'],
        };
        setUsers([...users, newUser]);
        message.success('用户添加成功');
      }
      setUserModalVisible(false);
    } catch (error) {
      // Validation failed
    }
  };

  const userColumns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => <span className="font-mono text-sm">{id}</span>,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: UserRole) => (
        <Tag color={roleMap[role].color}>{roleMap[role].label}</Tag>
      ),
    },
    {
      title: '所属区域',
      key: 'region',
      render: (_: any, record: User) => {
        if (record.province) {
          const province = provinces.find((p) => p.code === record.province);
          return province?.name || record.province;
        }
        return '全国';
      },
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Space wrap>
          {permissions.map((p) => (
            <Tag key={p} color="blue">
              {p === 'all' ? '全部权限' : p}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: User) => (
        <Switch
          checked={record.enabled !== false}
          checkedChildren={<UnlockOutlined />}
          unCheckedChildren={<LockOutlined />}
          onChange={(checked) => handleToggleUserStatus(record.id, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  if (!canManageSystem) {
    return (
      <div className="p-6">
        <Card className="text-center py-20">
          <LockOutlined className="text-6xl text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">无权限访问</h2>
          <p className="text-gray-400">系统管理功能仅对国家级管理员开放</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">系统管理</h1>
        <p className="text-gray-500 mt-1">管理系统用户和数据字典配置</p>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><UserOutlined className="mr-2" />系统用户数</span>}
              value={users.length}
              valueStyle={{ color: '#0F766E' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><EnvironmentOutlined className="mr-2" />省份数</span>}
              value={provinces.length}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><ToolOutlined className="mr-2" />处理工艺</span>}
              value={processTypes.length}
              valueStyle={{ color: '#0891B2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><DatabaseOutlined className="mr-2" />畜禽类型</span>}
              value={livestockTypes.length}
              valueStyle={{ color: '#722ED1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Tabs defaultActiveKey="users" size="large">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                用户管理
              </span>
            }
            key="users"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-gray-600">共 {users.length} 个用户</div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                  新增用户
                </Button>
              </div>
              <Table
                columns={userColumns}
                dataSource={users}
                rowKey="id"
                size="middle"
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                数据字典
              </span>
            }
            key="dictionary"
          >
            <div className="p-4">
              <Space className="mb-4">
                <Button
                  type={dictType === 'province' ? 'primary' : 'default'}
                  icon={<EnvironmentOutlined />}
                  onClick={() => setDictType('province')}
                >
                  省份列表
                </Button>
                <Button
                  type={dictType === 'process' ? 'primary' : 'default'}
                  icon={<ToolOutlined />}
                  onClick={() => setDictType('process')}
                >
                  处理工艺
                </Button>
                <Button
                  type={dictType === 'livestock' ? 'primary' : 'default'}
                  icon={<DatabaseOutlined />}
                  onClick={() => setDictType('livestock')}
                >
                  畜禽类型
                </Button>
              </Space>

              {dictType === 'province' && (
                <Table
                  dataSource={provinces}
                  rowKey="code"
                  size="middle"
                  columns={[
                    { title: '省份编码', dataIndex: 'code', key: 'code', width: 150 },
                    { title: '省份名称', dataIndex: 'name', key: 'name' },
                  ]}
                />
              )}

              {dictType === 'process' && (
                <Table
                  dataSource={processTypes}
                  rowKey="code"
                  size="middle"
                  columns={[
                    { title: '工艺编码', dataIndex: 'code', key: 'code', width: 150 },
                    { title: '工艺名称', dataIndex: 'name', key: 'name' },
                    {
                      title: '处理效率',
                      dataIndex: 'efficiency',
                      key: 'efficiency',
                      width: 150,
                      render: (eff: number) => `${(eff * 100).toFixed(0)}%`,
                    },
                  ]}
                />
              )}

              {dictType === 'livestock' && (
                <Table
                  dataSource={livestockTypes}
                  rowKey="type"
                  size="middle"
                  columns={[
                    { title: '类型编码', dataIndex: 'type', key: 'type', width: 150 },
                    { title: '类型名称', dataIndex: 'name', key: 'name' },
                    {
                      title: '粪污产出系数',
                      dataIndex: 'wasteCoefficient',
                      key: 'wasteCoefficient',
                      width: 180,
                      render: (coeff: number) => `${coeff} kg/头·天`,
                    },
                  ]}
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        onOk={handleUserSubmit}
        okText="保存"
        width={600}
      >
        <Form form={userForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="role"
            label="用户角色"
            rules={[{ required: true, message: '请选择用户角色' }]}
          >
            <Select placeholder="请选择用户角色">
              {Object.entries(roleMap).map(([role, info]) => (
                <Option key={role} value={role}>
                  {info.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="province"
            label="所属省份"
            rules={[{ required: false }]}
          >
            <Select placeholder="请选择省份">
              {provinces.map((p) => (
                <Option key={p.code} value={p.code}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="city"
            label="所属城市"
            rules={[{ required: false }]}
          >
            <Input placeholder="请输入城市编码" />
          </Form.Item>
          <Form.Item
            name="farmId"
            label="关联养殖场"
            rules={[{ required: false }]}
          >
            <Input placeholder="仅养殖场主需要填写" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default System;
