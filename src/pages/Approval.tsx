import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Descriptions,
  Timeline,
  Space,
  Statistic,
  Tabs,
  message,
  Empty,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  EnvironmentOutlined,
  AlertOutlined,
  ArrowRightOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import { ApprovalProcess, ApprovalStage } from '@/types';

const { TextArea } = Input;
const { TabPane } = Tabs;

const stageNameMap: Record<string, string> = {
  farm_owner: '场主确认',
  county_epd: '县级环保局复核',
  provincial_agri: '省级农业农村厅批准',
  completed: '已完成',
  rejected: '已驳回',
};

const stageIconMap: Record<string, React.ReactNode> = {
  farm_owner: <UserOutlined />,
  county_epd: <EnvironmentOutlined />,
  provincial_agri: <AlertOutlined />,
};

const Approval: React.FC = () => {
  const { user, getPendingApprovals, getAllApprovals, getApprovalById, getFarmById, approveStage, rejectStage, getAlerts } = useAppStore();
  const [selectedApproval, setSelectedApproval] = useState<ApprovalProcess | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [form] = Form.useForm();

  const pendingApprovals = getPendingApprovals();
  const allApprovals = getAllApprovals();

  const getCurrentUserCanApprove = (approval: ApprovalProcess) => {
    if (!user) return false;
    if (approval.currentStage === 'farm_owner' && user.role === 'farm_owner') return true;
    if (approval.currentStage === 'county_epd' && user.role === 'county_epd') return true;
    if (approval.currentStage === 'provincial_agri' && user.role === 'provincial_agri') return true;
    return false;
  };

  const handleViewDetail = (approval: ApprovalProcess) => {
    setSelectedApproval(approval);
    setDetailModalVisible(true);
  };

  const handleApprove = (approval: ApprovalProcess) => {
    setSelectedApproval(approval);
    setApproveModalVisible(true);
    form.resetFields();
  };

  const handleReject = (approval: ApprovalProcess) => {
    setSelectedApproval(approval);
    setRejectModalVisible(true);
    form.resetFields();
  };

  const confirmApprove = async () => {
    try {
      const values = await form.validateFields();
      if (selectedApproval && user) {
        approveStage(selectedApproval.id, selectedApproval.currentStage, values.opinion, user.id);
        message.success('审批通过');
        setApproveModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      // Validation failed
    }
  };

  const confirmReject = async () => {
    try {
      const values = await form.validateFields();
      if (selectedApproval && user) {
        rejectStage(selectedApproval.id, selectedApproval.currentStage, values.reason, user.id);
        message.success('已驳回');
        setRejectModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      // Validation failed
    }
  };

  const getStageColor = (stage: ApprovalStage) => {
    if (stage.status === 'approved') return 'success';
    if (stage.status === 'rejected') return 'error';
    return 'processing';
  };

  const getStageDot = (stage: ApprovalStage) => {
    if (stage.status === 'approved') return <CheckCircleOutlined className="text-green-500" />;
    if (stage.status === 'rejected') return <CloseCircleOutlined className="text-red-500" />;
    return <ClockCircleOutlined className="text-blue-500" />;
  };

  const columns = [
    {
      title: '申请编号',
      dataIndex: 'id',
      key: 'id',
      width: 130,
      render: (id: string) => (
      <span className="font-mono text-sm">{id}</span>
      ),
    },
    {
      title: '养殖场',
      dataIndex: 'farmId',
      key: 'farmId',
      render: (farmId: string) => {
        const farm = getFarmById(farmId);
        return farm?.name || '-';
      },
    },
    {
      title: '调整类型',
      dataIndex: 'adjustmentType',
      key: 'adjustmentType',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'process_change' ? 'blue' : 'orange'}>
          {type === 'process_change' ? '工艺调整' : '生产限制'}
        </Tag>
      ),
    },
    {
      title: '当前阶段',
      dataIndex: 'currentStage',
      key: 'currentStage',
      width: 180,
      render: (stage: string) => (
        <div className="flex items-center gap-2">
          {stageIconMap[stage]}
          <span>{stageNameMap[stage]}</span>
          {stage !== 'completed' && stage !== 'rejected' && (
            <Tag color="processing" className="animate-pulse">
              待处理
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: ApprovalProcess) => (
        <Space>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {getCurrentUserCanApprove(record) && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
              >
                通过
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const historyColumns = [
    ...columns,
    {
      title: '状态',
      dataIndex: 'currentStage',
      key: 'status',
      width: 100,
      render: (stage: string) => {
        if (stage === 'completed') {
          return <Tag color="success">已完成</Tag>;
        }
        if (stage === 'rejected') {
          return <Tag color="error">已驳回</Tag>;
        }
        return <Tag color="processing">处理中</Tag>;
      },
    },
    {
      title: '完成时间',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 180,
      render: (time: number) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: ApprovalProcess) => (
        <Button
          type="link"
          icon={<FileTextOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  const pendingCount = pendingApprovals.length;
  const completedCount = allApprovals.filter((a) => a.currentStage === 'completed').length;
  const rejectedCount = allApprovals.filter((a) => a.currentStage === 'rejected').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">审批中心</h1>
        <p className="text-gray-500 mt-1">处理工艺调整和限产申请的三级审批流程</p>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><ClockCircleOutlined className="mr-2" />待我审批</span>}
              value={pendingCount}
              valueStyle={{ color: '#1890FF' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><CheckCircleOutlined className="mr-2" />已通过</span>}
              value={completedCount}
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><CloseCircleOutlined className="mr-2" />已驳回</span>}
              value={rejectedCount}
              valueStyle={{ color: '#FF4D4F' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><FileTextOutlined className="mr-2" />申请总数</span>}
              value={allApprovals.length}
              valueStyle={{ color: '#722ED1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Tabs defaultActiveKey="pending" size="large">
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                待我审批
                {pendingCount > 0 && <Tag color="red" className="ml-2">{pendingCount}</Tag>}
              </span>
            }
            key="pending"
          >
            <div className="p-4">
              {pendingApprovals.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={pendingApprovals}
                  rowKey="id"
                  size="middle"
                />
              ) : (
                <Empty description="暂无待审批事项" />
              )}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                全部审批
              </span>
            }
            key="all"
          >
            <div className="p-4">
              <Table
                columns={historyColumns}
                dataSource={allApprovals}
                rowKey="id"
                size="middle"
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="审批详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          selectedApproval && getCurrentUserCanApprove(selectedApproval) && (
            <>
              <Button
                key="reject"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleReject(selectedApproval);
                }}
              >
                驳回
              </Button>
              <Button
                key="approve"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleApprove(selectedApproval);
                }}
              >
                通过
              </Button>
            </>
          ),
        ]}
      >
        {selectedApproval && (
          <div className="space-y-6">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="申请编号">{selectedApproval.id}</Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {dayjs(selectedApproval.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="养殖场">
                {getFarmById(selectedApproval.farmId)?.name}
              </Descriptions.Item>
              <Descriptions.Item label="调整类型">
                <Tag color={selectedApproval.adjustmentType === 'process_change' ? 'blue' : 'orange'}>
                  {selectedApproval.adjustmentType === 'process_change' ? '工艺调整' : '生产限制'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="关联预警" span={2}>
                {selectedApproval.alertId}
              </Descriptions.Item>
              <Descriptions.Item label="申请方案" span={2}>
                {selectedApproval.proposedPlan}
              </Descriptions.Item>
            </Descriptions>

            <Card
              title={
                <div className="flex items-center gap-2">
                  <ArrowRightOutlined className="text-blue-500" />
                  <span>审批流程</span>
                </div>
              }
              size="small"
            >
              <Timeline
                items={selectedApproval.stages.map((stage) => ({
                  color: getStageColor(stage),
                  dot: getStageDot(stage),
                  children: (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{stageNameMap[stage.stageName]}</span>
                        <Tag
                          color={
                            stage.status === 'approved'
                              ? 'success'
                              : stage.status === 'rejected'
                              ? 'error'
                              : 'processing'
                          }
                        >
                          {stage.status === 'approved'
                            ? '已通过'
                            : stage.status === 'rejected'
                            ? '已驳回'
                            : '待处理'}
                        </Tag>
                      </div>
                      {stage.opinion && (
                        <p className="text-gray-600 text-sm">意见：{stage.opinion}</p>
                      )}
                      {stage.approvedAt && (
                        <p className="text-gray-400 text-xs mt-1">
                          {dayjs(stage.approvedAt).format('YYYY-MM-DD HH:mm')}
                        </p>
                      )}
                    </div>
                  ),
                }))}
              />
            </Card>

            {selectedApproval.currentStage === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircleOutlined className="text-xl" />
                  <span className="font-semibold">审批流程已完成</span>
                </div>
                <p className="text-green-600 text-sm mt-2 ml-7">
                  该申请已通过全部审批环节，可以开始执行调整方案。
                </p>
              </div>
            )}

            {selectedApproval.currentStage === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <CloseCircleOutlined className="text-xl" />
                  <span className="font-semibold">审批已驳回</span>
                </div>
                <p className="text-red-600 text-sm mt-2 ml-7">
                  该申请已被驳回，请查看审批意见并重新提交申请。
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="通过审批"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        onOk={confirmApprove}
        okText="确认通过"
        okButtonProps={{ icon: <CheckCircleOutlined /> }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="opinion"
            label="审批意见"
            rules={[{ required: true, message: '请输入审批意见' }]}
          >
            <TextArea rows={4} placeholder="请输入审批意见（选填）" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="驳回审批"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={confirmReject}
        okText="确认驳回"
        okButtonProps={{ danger: true, icon: <CloseCircleOutlined /> }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="驳回原因"
            rules={[{ required: true, message: '请输入驳回原因' }]}
          >
            <TextArea rows={4} placeholder="请输入驳回原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Approval;
