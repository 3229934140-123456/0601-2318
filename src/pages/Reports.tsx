import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Row,
  Col,
  Descriptions,
  List,
  Space,
  Statistic,
  Progress,
  Select,
  Alert,
  message,
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  BarChartOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AlertOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import { DiagnosticReport } from '@/types';

const { Option } = Select;

const scopeTypeMap: Record<string, string> = {
  national: '全国',
  province: '省级',
  city: '市级',
};

const categoryMap: Record<string, string> = {
  process: '工艺优化',
  transport: '运输优化',
  capacity: '产能扩建',
};

const priorityMap: Record<string, { color: string; text: string }> = {
  high: { color: 'red', text: '高优先级' },
  medium: { color: 'orange', text: '中优先级' },
  low: { color: 'blue', text: '低优先级' },
};

const impactLevelMap: Record<string, { color: string; text: string }> = {
  low: { color: 'green', text: '低影响' },
  medium: { color: 'orange', text: '中影响' },
  high: { color: 'red', text: '高影响' },
};

const Reports: React.FC = () => {
  const { getReports, getReportById, getFarmById } = useAppStore();
  const [selectedReport, setSelectedReport] = useState<DiagnosticReport | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [scopeFilter, setScopeFilter] = useState<string>('all');

  const reports = getReports();

  const filteredReports = scopeFilter === 'all'
    ? reports
    : reports.filter((r) => r.scope.type === scopeFilter);

  const handleViewDetail = (report: DiagnosticReport) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };

  const handleDownload = (report: DiagnosticReport) => {
    const content = generateReportContent(report);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `环保诊断报告_${dayjs(report.endDate).format('YYYYMMDD')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('报告下载成功');
  };

  const generateReportContent = (report: DiagnosticReport) => {
    const lines = [];
    lines.push('='.repeat(60));
    lines.push('畜禽养殖废弃物资源化利用与环保监管');
    lines.push('环保诊断报告');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`报告编号：${report.id}`);
    lines.push(`报告周期：${dayjs(report.startDate).format('YYYY年MM月DD日')} - ${dayjs(report.endDate).format('YYYY年MM月DD日')}`);
    lines.push(`统计范围：${scopeTypeMap[report.scope.type]}${report.scope.region ? `（${report.scope.region}）` : ''}`);
    lines.push('');
    lines.push('-'.repeat(60));
    lines.push('一、核心指标汇总');
    lines.push('-'.repeat(60));
    lines.push(`1. 资源化利用率：${report.summary.resourceUtilizationRate.current}%`);
    lines.push(`   同比：${report.summary.resourceUtilizationRate.yoy > 0 ? '+' : ''}${report.summary.resourceUtilizationRate.yoy}%`);
    lines.push(`   环比：${report.summary.resourceUtilizationRate.mom > 0 ? '+' : ''}${report.summary.resourceUtilizationRate.mom}%`);
    lines.push('');
    lines.push(`2. 设施达标率：${report.summary.facilityComplianceRate.current}%`);
    lines.push(`   同比：${report.summary.facilityComplianceRate.yoy > 0 ? '+' : ''}${report.summary.facilityComplianceRate.yoy}%`);
    lines.push(`   环比：${report.summary.facilityComplianceRate.mom > 0 ? '+' : ''}${report.summary.facilityComplianceRate.mom}%`);
    lines.push('');
    lines.push(`3. 预警数量：${report.summary.alertCount.total}次`);
    lines.push(`   一级预警：${report.summary.alertCount.level1}次`);
    lines.push(`   二级预警：${report.summary.alertCount.level2}次`);
    lines.push('');
    lines.push('-'.repeat(60));
    lines.push('二、设施故障类型分布');
    lines.push('-'.repeat(60));
    report.facilityFaultDistribution.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.type}：${item.count}次（${item.percentage}%）`);
    });
    lines.push('');
    lines.push('-'.repeat(60));
    lines.push('三、水体影响评估');
    lines.push('-'.repeat(60));
    report.waterImpactAssessment.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.region}：${impactLevelMap[item.impactLevel].text}`);
      lines.push(`   风险评分：${item.riskScore}分`);
      lines.push(`   影响水体：${item.affectedWaterBodies.join('、')}`);
      lines.push('');
    });
    lines.push('-'.repeat(60));
    lines.push('四、优化建议');
    lines.push('-'.repeat(60));
    report.optimizationSuggestions.forEach((item, index) => {
      lines.push(`${index + 1}. [${priorityMap[item.priority].text}] ${item.title}`);
      lines.push(`   类别：${categoryMap[item.category]}`);
      lines.push(`   建议：${item.description}`);
      lines.push(`   预期效益：${item.expectedBenefit}`);
      lines.push('');
    });
    lines.push('='.repeat(60));
    lines.push(`报告生成时间：${dayjs().format('YYYY年MM月DD日 HH:mm:ss')}`);
    lines.push('='.repeat(60));
    return lines.join('\n');
  };

  const getFaultChartOption = () => {
    if (!selectedReport) return {};
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}次 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '故障类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
          },
          data: selectedReport.facilityFaultDistribution.map((item) => ({
            value: item.count,
            name: item.type,
          })),
        },
      ],
    };
  };

  const getTrendChartOption = () => {
    if (!selectedReport) return {};

    const weeks = ['第4周前', '第3周前', '第2周前', '上周', '本周'];
    const utilizationRates = [75, 77, 78, 79, selectedReport.summary.resourceUtilizationRate.current];
    const complianceRates = [80, 81, 82, 83, selectedReport.summary.facilityComplianceRate.current];

    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['资源化利用率', '设施达标率'],
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: weeks,
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%' },
      },
      series: [
        {
          name: '资源化利用率',
          type: 'line',
          data: utilizationRates,
          smooth: true,
          lineStyle: { color: '#0F766E', width: 3 },
          itemStyle: { color: '#0F766E' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(15, 118, 110, 0.3)' },
                { offset: 1, color: 'rgba(15, 118, 110, 0.05)' },
              ],
            },
          },
        },
        {
          name: '设施达标率',
          type: 'line',
          data: complianceRates,
          smooth: true,
          lineStyle: { color: '#059669', width: 3 },
          itemStyle: { color: '#059669' },
        },
      ],
    };
  };

  const columns = [
    {
      title: '报告编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => <span className="font-mono text-sm">{id}</span>,
    },
    {
      title: '统计范围',
      dataIndex: 'scope',
      key: 'scope',
      width: 120,
      render: (scope: DiagnosticReport['scope']) => (
        <Tag color={scope.type === 'national' ? 'purple' : scope.type === 'province' ? 'blue' : 'green'}>
          {scopeTypeMap[scope.type]}
        </Tag>
      ),
    },
    {
      title: '报告周期',
      key: 'period',
      width: 280,
      render: (_: any, record: DiagnosticReport) => (
        <div>
          <p className="font-medium">
            {dayjs(record.startDate).format('YYYY-MM-DD')} ~ {dayjs(record.endDate).format('YYYY-MM-DD')}
          </p>
          <p className="text-gray-400 text-xs">周度报告</p>
        </div>
      ),
    },
    {
      title: '资源化利用率',
      key: 'utilization',
      width: 180,
      render: (_: any, record: DiagnosticReport) => {
        const data = record.summary.resourceUtilizationRate;
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-teal-600">{data.current}%</span>
              {data.mom > 0 ? (
                <Tag color="green" icon={<ArrowUpOutlined />}>↑{data.mom}%</Tag>
              ) : data.mom < 0 ? (
                <Tag color="red" icon={<ArrowDownOutlined />}>↓{Math.abs(data.mom)}%</Tag>
              ) : (
                <Tag color="default">-</Tag>
              )}
            </div>
            <Progress percent={data.current} showInfo={false} size="small" strokeColor="#0F766E" className="mt-1" />
          </div>
        );
      },
    },
    {
      title: '设施达标率',
      key: 'compliance',
      width: 180,
      render: (_: any, record: DiagnosticReport) => {
        const data = record.summary.facilityComplianceRate;
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600">{data.current}%</span>
              {data.mom > 0 ? (
                <Tag color="green" icon={<ArrowUpOutlined />}>↑{data.mom}%</Tag>
              ) : data.mom < 0 ? (
                <Tag color="red" icon={<ArrowDownOutlined />}>↓{Math.abs(data.mom)}%</Tag>
              ) : (
                <Tag color="default">-</Tag>
              )}
            </div>
            <Progress percent={data.current} showInfo={false} size="small" strokeColor="#059669" className="mt-1" />
          </div>
        );
      },
    },
    {
      title: '预警数量',
      key: 'alerts',
      width: 150,
      render: (_: any, record: DiagnosticReport) => {
        const data = record.summary.alertCount;
        return (
          <Space>
            <Tag color="orange">一级 {data.level1}</Tag>
            <Tag color="red">二级 {data.level2}</Tag>
          </Space>
        );
      },
    },
    {
      title: '优化建议',
      key: 'suggestions',
      width: 120,
      render: (_: any, record: DiagnosticReport) => (
        <Tag color="blue">{record.optimizationSuggestions.length}条</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: DiagnosticReport) => (
        <Space>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">报告中心</h1>
          <p className="text-gray-500 mt-1">每周自动生成环保诊断报告，支持查看和下载</p>
        </div>
        <Space>
          <Select
            value={scopeFilter}
            onChange={setScopeFilter}
            style={{ width: 150 }}
            placeholder="统计范围"
          >
            <Option value="all">全部范围</Option>
            <Option value="national">全国</Option>
            <Option value="province">省级</Option>
            <Option value="city">市级</Option>
          </Select>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (reports.length > 0) {
                handleDownload(reports[0]);
              }
            }}
          >
            下载最新报告
          </Button>
        </Space>
      </div>

      {reports.length > 0 && (
        <Alert
          message={`最新报告：${dayjs(reports[0].endDate).format('YYYY年MM月DD日')}生成`}
          description={`本周资源化利用率 ${reports[0].summary.resourceUtilizationRate.current}%，环比 ${reports[0].summary.resourceUtilizationRate.mom > 0 ? '+' : ''}${reports[0].summary.resourceUtilizationRate.mom}%，共产生预警 ${reports[0].summary.alertCount.total} 次`}
          type="info"
          showIcon
          icon={<BarChartOutlined />}
          action={
            <Button size="small" type="primary" onClick={() => handleViewDetail(reports[0])}>
              查看详情
            </Button>
          }
        />
      )}

      <Row gutter={16}>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><BarChartOutlined className="mr-2" />报告总数</span>}
              value={reports.length}
              valueStyle={{ color: '#0F766E' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><RiseOutlined className="mr-2" />平均资源化利用率</span>}
              value={(reports.reduce((sum, r) => sum + r.summary.resourceUtilizationRate.current, 0) / reports.length).toFixed(1)}
              suffix="%"
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><CheckCircleOutlined className="mr-2" />平均设施达标率</span>}
              value={(reports.reduce((sum, r) => sum + r.summary.facilityComplianceRate.current, 0) / reports.length).toFixed(1)}
              suffix="%"
              valueStyle={{ color: '#0891B2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600"><AlertOutlined className="mr-2" />累计预警次数</span>}
              value={reports.reduce((sum, r) => sum + r.summary.alertCount.total, 0)}
              valueStyle={{ color: '#D97706' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm" title="报告列表">
        <Table
          columns={columns}
          dataSource={filteredReports}
          rowKey="id"
          size="middle"
        />
      </Card>

      <Modal
        title="报告详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => selectedReport && handleDownload(selectedReport)}
          >
            下载报告
          </Button>,
        ]}
      >
        {selectedReport && (
          <div className="space-y-6">
            <Card
              title={
                <div className="flex items-center gap-2">
                  <DashboardOutlined className="text-teal-600" />
                  <span>核心指标汇总</span>
                </div>
              }
              size="small"
            >
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-center">
                    <p className="text-gray-500 mb-1">资源化利用率</p>
                    <p className="text-3xl font-bold text-teal-600">
                      {selectedReport.summary.resourceUtilizationRate.current}%
                    </p>
                    <div className="flex justify-center gap-4 mt-2">
                      <span className="text-sm">
                        同比：
                        {selectedReport.summary.resourceUtilizationRate.yoy > 0 ? (
                          <span className="text-green-600">+{selectedReport.summary.resourceUtilizationRate.yoy}%</span>
                        ) : (
                          <span className="text-red-600">{selectedReport.summary.resourceUtilizationRate.yoy}%</span>
                        )}
                      </span>
                      <span className="text-sm">
                        环比：
                        {selectedReport.summary.resourceUtilizationRate.mom > 0 ? (
                          <span className="text-green-600">+{selectedReport.summary.resourceUtilizationRate.mom}%</span>
                        ) : (
                          <span className="text-red-600">{selectedReport.summary.resourceUtilizationRate.mom}%</span>
                        )}
                      </span>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <p className="text-gray-500 mb-1">设施达标率</p>
                    <p className="text-3xl font-bold text-green-600">
                      {selectedReport.summary.facilityComplianceRate.current}%
                    </p>
                    <div className="flex justify-center gap-4 mt-2">
                      <span className="text-sm">
                        同比：
                        {selectedReport.summary.facilityComplianceRate.yoy > 0 ? (
                          <span className="text-green-600">+{selectedReport.summary.facilityComplianceRate.yoy}%</span>
                        ) : (
                          <span className="text-red-600">{selectedReport.summary.facilityComplianceRate.yoy}%</span>
                        )}
                      </span>
                      <span className="text-sm">
                        环比：
                        {selectedReport.summary.facilityComplianceRate.mom > 0 ? (
                          <span className="text-green-600">+{selectedReport.summary.facilityComplianceRate.mom}%</span>
                        ) : (
                          <span className="text-red-600">{selectedReport.summary.facilityComplianceRate.mom}%</span>
                        )}
                      </span>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <p className="text-gray-500 mb-1">预警数量</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {selectedReport.summary.alertCount.total}
                    </p>
                    <div className="flex justify-center gap-4 mt-2">
                      <Tag color="orange">一级 {selectedReport.summary.alertCount.level1}</Tag>
                      <Tag color="red">二级 {selectedReport.summary.alertCount.level2}</Tag>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            <Row gutter={16}>
              <Col span={12}>
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <RiseOutlined className="text-teal-600" />
                      <span>近5周趋势对比</span>
                    </div>
                  }
                  size="small"
                >
                  <ReactECharts
                    option={getTrendChartOption()}
                    style={{ height: '280px' }}
                    notMerge={true}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <BarChartOutlined className="text-blue-600" />
                      <span>设施故障类型分布</span>
                    </div>
                  }
                  size="small"
                >
                  <ReactECharts
                    option={getFaultChartOption()}
                    style={{ height: '280px' }}
                    notMerge={true}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title={
                <div className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-cyan-600" />
                  <span>水体影响评估</span>
                </div>
              }
              size="small"
            >
              <Row gutter={16}>
                {selectedReport.waterImpactAssessment.map((item, index) => (
                  <Col span={8} key={index}>
                    <Card
                      size="small"
                      className={`border-l-4 ${
                        item.impactLevel === 'high'
                          ? 'border-l-red-500'
                          : item.impactLevel === 'medium'
                          ? 'border-l-orange-500'
                          : 'border-l-green-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{item.region}</span>
                        <Tag color={impactLevelMap[item.impactLevel].color}>
                          {impactLevelMap[item.impactLevel].text}
                        </Tag>
                      </div>
                      <div className="mb-2">
                        <span className="text-gray-500 text-sm">风险评分：</span>
                        <span className={`font-bold ${
                          item.riskScore >= 70 ? 'text-red-600' :
                          item.riskScore >= 50 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {item.riskScore}分
                        </span>
                      </div>
                      <Progress
                        percent={item.riskScore}
                        showInfo={false}
                        size="small"
                        strokeColor={
                          item.riskScore >= 70 ? '#DC2626' :
                          item.riskScore >= 50 ? '#D97706' : '#059669'
                        }
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        影响水体：{item.affectedWaterBodies.join('、')}
                      </p>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>

            <Card
              title={
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <span>优化建议</span>
                  <Tag color="blue" className="ml-2">
                    {selectedReport.optimizationSuggestions.length}条
                  </Tag>
                </div>
              }
              size="small"
            >
              <List
                dataSource={selectedReport.optimizationSuggestions}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    className="border-l-4 pl-4 mb-3"
                    style={{
                      borderColor:
                        item.priority === 'high'
                          ? '#DC2626'
                          : item.priority === 'medium'
                          ? '#D97706'
                          : '#0891B2',
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.title}</span>
                          <Tag color={priorityMap[item.priority].color}>
                            {priorityMap[item.priority].text}
                          </Tag>
                          <Tag color="purple">{categoryMap[item.category]}</Tag>
                        </div>
                      }
                      description={
                        <div>
                          <p className="text-gray-600 mb-2">{item.description}</p>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="text-green-700 text-sm">
                              <CheckCircleOutlined className="mr-1" />
                              预期效益：{item.expectedBenefit}
                            </span>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;
