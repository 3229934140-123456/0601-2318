import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Select,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Input,
  message,
  Timeline,
  Descriptions,
  Badge,
} from 'antd';
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { Alert } from '../types';
import ReactECharts from 'echarts-for-react';

const { Option } = Select;
const { TextArea } = Input;

const AlertCenter = () => {
  const [searchParams] = useSearchParams();
  const alertId = searchParams.get('id');
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [detailModal, setDetailModal] = useState<{
    visible: boolean;
    alert: Alert | null;
  }>({ visible: !!alertId, alert: null });
  const [processModal, setProcessModal] = useState<{
    visible: boolean;
    alert: Alert | null;
  }>({ visible: false, alert: null });
  const [form] = Form.useForm();

  const { getAlerts, processAlert, escalateAlert } = useAppStore();

  const alerts = useMemo(
    () => getAlerts({ level: selectedLevel, status: selectedStatus }),
    [getAlerts, selectedLevel, selectedStatus]
  );

  const alertDetail = useMemo(
    () => alerts.find((a) => a.id === alertId) || null,
    [alerts, alertId]
  );

  const getLevelTag = (level: string) => {
    const map: Record<string, { color: string; icon: any; text: string }> = {
      level1: { color: 'orange', icon: WarningOutlined, text: '一级预警' },
      level2: { color: 'red', icon: ExclamationCircleOutlined, text: '二级预警' },
    };
    const config = map[level];
    return (
      <Tag icon={<config.icon />} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  const getTypeTag = (type: string) => {
    const map: Record<string, { color: string; text: string }> = {
      facility: { color: 'blue', text: '设施异常' },
      environment: { color: 'cyan', text: '环境风险' },
      comprehensive: { color: 'purple', text: '综合预警' },
    };
    return <Tag color={map[type]?.color}>{map[type]?.text}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      pending: { color: 'warning', text: '待处理' },
      processing: { color: 'processing', text: '处理中' },
      resolved: { color: 'success', text: '已解决' },
      escalated: { color: 'error', text: '已升级' },
    };
    return <Tag color={map[status]?.color}>{map[status]?.text}</Tag>;
  };

  const columns: ColumnsType<Alert> = [
    {
      title: '预警级别',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (level) => getLevelTag(level),
    },
    {
      title: '预警类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => getTypeTag(type),
    },
    {
      title: '养殖场',
      dataIndex: 'farmName',
      key: 'farmName',
      width: 200,
      ellipsis: true,
      render: (text, record) => (
        <a
          onClick={() => navigate(`/monitor/farm/${record.farmId}`)}
          className="font-medium"
        >
          {text}
        </a>
      ),
    },
    {
      title: '触发条件',
      dataIndex: 'triggerCondition',
      key: 'triggerCondition',
      width: 200,
    },
    {
      title: '触发值/阈值',
      key: 'value',
      width: 140,
      render: (_, record) => (
        <div className="font-mono text-sm">
          <span
            className={
              record.triggerValue < record.threshold
                ? 'text-green-600'
                : 'text-red-600 font-semibold'
            }
          >
            {record.triggerValue}%
          </span>
          <span className="text-gray-400 mx-1">/</span>
          <span>{record.threshold}%</span>
        </div>
      ),
    },
    {
      title: '持续天数',
      dataIndex: 'durationDays',
      key: 'durationDays',
      width: 100,
      render: (days) => (
        <span className="font-mono">
          {days}
          <span className="text-gray-500 text-xs">天</span>
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => setDetailModal({ visible: true, alert: record })}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              onClick={() => setProcessModal({ visible: true, alert: record })}
            >
              处理
            </Button>
          )}
          {record.status === 'pending' && record.level === 'level1' && (
            <Button
              type="link"
              size="small"
              danger
              icon={<ArrowUpOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认升级预警',
                  content: '确认将此预警升级为二级预警？升级后将启动三级审批流程。',
                  onOk: () => {
                    escalateAlert(record.id);
                    message.success('预警已升级');
                  },
                });
              }}
            >
              升级
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const alertTrendOption = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['一级预警', '二级预警'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '一级预警',
        type: 'bar',
        stack: 'total',
        data: [12, 15, 10, 18, 22, 16, 14, 20, 25, 18, 12, 8],
        itemStyle: { color: '#f59e0b' },
      },
      {
        name: '二级预警',
        type: 'bar',
        stack: 'total',
        data: [3, 4, 2, 5, 6, 3, 2, 4, 5, 3, 2, 1],
        itemStyle: { color: '#dc2626' },
      },
    ],
  };

  const alertTypeOption = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '预警类型分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 45, name: '设施异常', itemStyle: { color: '#3b82f6' } },
          { value: 35, name: '环境风险', itemStyle: { color: '#06b6d4' } },
          { value: 20, name: '综合预警', itemStyle: { color: '#8b5cf6' } },
        ],
      },
    ],
  };

  const handleProcess = async (values: { action: string; remark: string }) => {
    if (!processModal.alert) return;
    processAlert(processModal.alert.id, values.action, values.remark);
    message.success('处理成功');
    setProcessModal({ visible: false, alert: null });
    form.resetFields();
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-gray-600">预警级别:</span>
          <Select
            placeholder="全部"
            allowClear
            style={{ width: 140 }}
            onChange={setSelectedLevel}
          >
            <Option value="level1">一级预警</Option>
            <Option value="level2">二级预警</Option>
          </Select>
          <span className="text-gray-600">处理状态:</span>
          <Select
            placeholder="全部"
            allowClear
            style={{ width: 140 }}
            onChange={setSelectedStatus}
          >
            <Option value="pending">待处理</Option>
            <Option value="processing">处理中</Option>
            <Option value="resolved">已解决</Option>
            <Option value="escalated">已升级</Option>
          </Select>
          <Button
            onClick={() => {
              setSelectedLevel(undefined);
              setSelectedStatus(undefined);
            }}
          >
            重置
          </Button>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm h-full">
            <Statistic
              title="预警总数"
              value={alerts.length}
              valueStyle={{ fontSize: '28px', color: '#0f766e' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm h-full">
            <Statistic
              title="待处理"
              value={alerts.filter((a) => a.status === 'pending').length}
              valueStyle={{ fontSize: '28px', color: '#f59e0b' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm h-full">
            <Statistic
              title="处理中"
              value={alerts.filter((a) => a.status === 'processing').length}
              valueStyle={{ fontSize: '28px', color: '#3b82f6' }}
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm h-full">
            <Statistic
              title="已解决"
              value={alerts.filter((a) => a.status === 'resolved').length}
              valueStyle={{ fontSize: '28px', color: '#10b981' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="border-0 shadow-sm" title="预警列表">
            <Table
              columns={columns}
              dataSource={alerts}
              rowKey="id"
              scroll={{ x: 1300 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <div className="space-y-6">
            <Card className="border-0 shadow-sm" title="月度预警趋势">
              <div style={{ height: '250px' }}>
                <ReactECharts
                  option={alertTrendOption}
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>
            </Card>
            <Card className="border-0 shadow-sm" title="预警类型分布">
              <div style={{ height: '250px' }}>
                <ReactECharts
                  option={alertTypeOption}
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      <Modal
        title="预警详情"
        open={detailModal.visible || !!alertId}
        onCancel={() => {
          setDetailModal({ visible: false, alert: null });
          navigate('/alert');
        }}
        width={900}
        footer={null}
      >
        {(detailModal.alert || alertDetail) && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold">{(detailModal.alert || alertDetail)?.farmName}</h3>
              {getLevelTag((detailModal.alert || alertDetail)!.level)}
              {getTypeTag((detailModal.alert || alertDetail)!.type)}
              {getStatusTag((detailModal.alert || alertDetail)!.status)}
            </div>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="预警编号">
                {(detailModal.alert || alertDetail)?.id}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs((detailModal.alert || alertDetail)?.createdAt).format(
                  'YYYY-MM-DD HH:mm:ss'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="触发条件">
                {(detailModal.alert || alertDetail)?.triggerCondition}
              </Descriptions.Item>
              <Descriptions.Item label="持续天数">
                {(detailModal.alert || alertDetail)?.durationDays} 天
              </Descriptions.Item>
              <Descriptions.Item label="触发值">
                <Badge
                  status="error"
                  text={`${(detailModal.alert || alertDetail)?.triggerValue}%`}
                />
              </Descriptions.Item>
              <Descriptions.Item label="阈值">
                <span className="font-mono">
                  {(detailModal.alert || alertDetail)?.threshold}%
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Card size="small" title="处理历史">
              <Timeline
                items={(detailModal.alert || alertDetail)?.processingHistory.map(
                  (record) => ({
                    color:
                      record.action === '预警生成'
                        ? 'orange'
                        : record.action.includes('升级')
                        ? 'red'
                        : 'green',
                    children: (
                      <div>
                        <div className="font-medium">{record.action}</div>
                        <div className="text-sm text-gray-600">
                          操作人: {record.operator} |{' '}
                          {dayjs(record.timestamp).format('YYYY-MM-DD HH:mm')}
                        </div>
                        {record.remark && (
                          <div className="text-sm text-gray-500 mt-1">
                            备注: {record.remark}
                          </div>
                        )}
                      </div>
                    ),
                  })
                )}
              />
            </Card>

            <Card size="small" title="处理建议">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircleOutlined className="text-blue-500 mt-1" />
                  <div>
                    <div className="font-medium text-blue-800">设施检查</div>
                    <div className="text-sm text-blue-700">
                      立即检查处理设施运行状态，重点检查温度、pH值、含氧量等关键参数
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <WarningOutlined className="text-orange-500 mt-1" />
                  <div>
                    <div className="font-medium text-orange-800">应急处理</div>
                    <div className="text-sm text-orange-700">
                      暂时减少粪污产生量，必要时启动应急储存设施，避免溢出
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CloseCircleOutlined className="text-green-500 mt-1" />
                  <div>
                    <div className="font-medium text-green-800">长效措施</div>
                    <div className="text-sm text-green-700">
                      评估处理工艺匹配度，考虑升级处理设施或调整养殖规模
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-3">
              {(detailModal.alert || alertDetail)?.status === 'pending' && (
                <>
                  <Button onClick={() => setProcessModal({ visible: true, alert: detailModal.alert || alertDetail })}>
                    处理预警
                  </Button>
                  {(detailModal.alert || alertDetail)?.level === 'level1' && (
                    <Button
                      type="primary"
                      danger
                      icon={<ArrowUpOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: '确认升级预警',
                          content: '确认将此预警升级为二级预警？升级后将启动三级审批流程。',
                          onOk: () => {
                            escalateAlert((detailModal.alert || alertDetail)!.id);
                            message.success('预警已升级');
                            setDetailModal({ visible: false, alert: null });
                          },
                        });
                      }}
                    >
                      升级为二级预警
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="处理预警"
        open={processModal.visible}
        onCancel={() => setProcessModal({ visible: false, alert: null })}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleProcess}>
          <Form.Item
            name="action"
            label="处理措施"
            rules={[{ required: true, message: '请选择处理措施' }]}
          >
            <Select placeholder="请选择处理措施">
              <Option value="check">已检查设施，参数正常</Option>
              <Option value="repair">已维修故障设备</Option>
              <Option value="adjust">已调整运行参数</Option>
              <Option value="reduce">已降低生产负荷</Option>
              <Option value="other">其他处理措施</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="remark"
            label="处理说明"
            rules={[{ required: true, message: '请填写处理说明' }]}
          >
            <TextArea rows={4} placeholder="请详细描述处理情况..." />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setProcessModal({ visible: false, alert: null })}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              确认处理
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AlertCenter;
