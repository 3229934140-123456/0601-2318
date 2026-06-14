import { useState } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Badge } from 'antd';
import {
  DashboardOutlined,
  MonitorOutlined,
  AlertOutlined,
  LineChartOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  BarChartOutlined,
  TeamOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, getAlerts, getPendingApprovals } = useAppStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const pendingAlerts = getAlerts({ status: 'pending' }).length;
  const pendingApprovals = getPendingApprovals().length;

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据概览',
    },
    {
      key: '/monitor',
      icon: <MonitorOutlined />,
      label: '实时监控',
    },
    {
      key: '/alert',
      icon: (
        <Badge count={pendingAlerts} size="small" offset={[5, -2]}>
          <AlertOutlined />
        </Badge>
      ),
      label: '预警中心',
    },
    {
      key: '/forecast',
      icon: <LineChartOutlined />,
      label: '预测规划',
    },
    {
      key: '/approval',
      icon: (
        <Badge count={pendingApprovals} size="small" offset={[5, -2]}>
          <BarChartOutlined />
        </Badge>
      ),
      label: '审批中心',
    },
    {
      key: '/report',
      icon: <FileTextOutlined />,
      label: '报告中心',
    },
    ...(user?.role === 'national'
      ? [
          {
            key: 'system',
            icon: <DatabaseOutlined />,
            label: '系统管理',
            children: [
              { key: '/system/users', icon: <TeamOutlined />, label: '用户管理' },
              { key: '/system/dict', icon: <DatabaseOutlined />, label: '数据字典' },
            ],
          },
        ]
      : []),
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      national: '国家级管理员',
      provincial: '省级管理员',
      municipal: '市级管理员',
      county_epd: '县级环保局',
      provincial_agri: '省级农业农村厅',
      farm_owner: '养殖场主',
    };
    return roleMap[role] || role;
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        className="bg-gradient-to-b from-teal-900 to-teal-800"
      >
        <div className="h-16 flex items-center justify-center px-4 border-b border-teal-700">
          <span
            className={cn(
              'text-white font-bold transition-all',
              collapsed ? 'text-lg' : 'text-xl'
            )}
          >
            {collapsed ? '畜禽环保' : '畜禽养殖环保监管平台'}
          </span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="bg-transparent border-r-0 mt-2"
        />
      </Sider>
      <Layout>
        <Header
          style={{ background: colorBgContainer }}
          className="flex items-center justify-between px-6 shadow-sm"
        >
          <div className="text-lg font-medium text-gray-700">
            {menuItems
              .flatMap((item) =>
                'children' in item ? item.children || [] : [item]
              )
              .find((item) => item.key === location.pathname)?.label || '数据概览'}
          </div>
          <div className="flex items-center gap-4">
            <Badge count={pendingAlerts + pendingApprovals} size="small">
              <button className="text-gray-500 hover:text-teal-600 transition-colors p-2">
                <BellOutlined className="text-xl" />
              </button>
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors">
                <Avatar size="small" className="bg-teal-600">
                  {user?.name?.charAt(0)}
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                  <div className="text-xs text-gray-500">
                    {getRoleLabel(user?.role || '')}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className="m-6 p-6 bg-slate-50"
          style={{
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
