import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Upload,
  Button,
  Table,
  Space,
  Tag,
  Statistic,
  Progress,
  Descriptions,
  List,
  Alert,
  message,
  Modal,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  BarChartOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  FileExcelOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import { Farm, LivestockPlan, ForecastData, PlanRecommendation } from '@/types';

const { Option } = Select;

const Forecast: React.FC = () => {
  const { user, getFarms, getFarmById, uploadPlan, calculateForecast, getForecast } = useAppStore();
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [livestockPlan, setLivestockPlan] = useState<LivestockPlan[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recommendationModalVisible, setRecommendationModalVisible] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<PlanRecommendation | null>(null);

  const farms = getFarms();

  useEffect(() => {
    if (farms.length > 0 && !selectedFarm) {
      setSelectedFarm(farms[0]);
    }
  }, [farms]);

  useEffect(() => {
    if (selectedFarm) {
      const data = getForecast(selectedFarm.id);
      setForecastData(data);
    }
  }, [selectedFarm]);

  const handleFarmChange = (farmId: string) => {
    const farm = getFarmById(farmId);
    if (farm) {
      setSelectedFarm(farm);
      setLivestockPlan([]);
    }
  };

  const handleUpload = (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];

        const extractedPlan: LivestockPlan[] = jsonData.map((row, index) => ({
          month: row['月份'] || row['month'] || index + 1,
          livestockCount: row['存栏量'] || row['livestockCount'] || 0,
          notes: row['备注'] || row['notes'] || '',
        }));

        if (selectedFarm) {
          const result = uploadPlan(selectedFarm.id, extractedPlan);
          if (result.success) {
            setLivestockPlan(result.extractedData);
            const newForecast = calculateForecast(selectedFarm.id);
            setForecastData(newForecast);
            message.success('年度计划上传成功，已自动提取存栏数据');
            onSuccess?.();
          } else {
            message.error('上传失败');
            onError?.();
          }
        }
      } catch (error) {
        message.error('Excel格式错误，请检查模板');
        onError?.();
      } finally {
        setUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      { 月份: 1, 存栏量: 1000, 备注: '基准存栏' },
      { 月份: 2, 存栏量: 1050, 备注: '' },
      { 月份: 3, 存栏量: 1100, 备注: '春季补栏' },
      { 月份: 4, 存栏量: 1150, 备注: '' },
      { 月份: 5, 存栏量: 1200, 备注: '' },
      { 月份: 6, 存栏量: 1250, 备注: '夏季高峰' },
      { 月份: 7, 存栏量: 1200, 备注: '' },
      { 月份: 8, 存栏量: 1150, 备注: '' },
      { 月份: 9, 存栏量: 1100, 备注: '秋季调整' },
      { 月份: 10, 存栏量: 1050, 备注: '' },
      { 月份: 11, 存栏量: 1000, 备注: '' },
      { 月份: 12, 存栏量: 950, 备注: '冬季出栏' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '年度养殖计划');
    XLSX.writeFile(workbook, '年度养殖计划模板.xlsx');
  };

  const getForecastChartOption = () => {
    if (!forecastData) return {};

    const dates = Array.from({ length: forecastData.forecastDays }, (_, i) =>
      dayjs().add(i + 1, 'day').format('MM-DD')
    );

    const hasGap = forecastData.capacityGap.some((g) => g > 0);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: ['预测粪污产出', '处理能力', '产出缺口'],
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
        data: dates,
        axisLabel: {
          interval: Math.floor(forecastData.forecastDays / 10),
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: '吨/天',
        axisLabel: { formatter: '{value}' },
      },
      series: [
        {
          name: '预测粪污产出',
          type: 'line',
          data: forecastData.predictedWasteProduction,
          smooth: true,
          lineStyle: { color: '#0F766E', width: 3 },
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
          name: '处理能力',
          type: 'line',
          data: Array(forecastData.forecastDays).fill(forecastData.treatmentCapacity),
          lineStyle: { color: '#059669', width: 2, type: 'dashed' },
          symbol: 'none',
        },
        hasGap
          ? {
              name: '产出缺口',
              type: 'line',
              data: forecastData.capacityGap.map((g) => (g > 0 ? forecastData.treatmentCapacity + g : null)),
              lineStyle: { color: '#DC2626', width: 3 },
              areaStyle: {
                color: 'rgba(220, 38, 38, 0.2)',
              },
              markArea: {
                silent: true,
                data: forecastData.capacityGap
                  .map((g, i) => (g > 0 ? [{ xAxis: dates[i] }, { xAxis: dates[i] }] : null))
                  .filter(Boolean),
              },
            }
          : {},
      ].filter(Boolean),
    };
  };

  const getLivestockChartOption = () => {
    if (!forecastData) return {};

    const dates = Array.from({ length: forecastData.forecastDays }, (_, i) =>
      dayjs().add(i + 1, 'day').format('MM-DD')
    );

    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['预测存栏量'],
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
        data: dates,
        axisLabel: {
          interval: Math.floor(forecastData.forecastDays / 10),
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: '头/只',
      },
      series: [
        {
          name: '预测存栏量',
          type: 'bar',
          data: forecastData.plannedLivestockCount,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#059669' },
                { offset: 1, color: '#10B981' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
  };

  const planColumns = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      width: 100,
      render: (month: number) => `${month}月`,
    },
    {
      title: '计划存栏量',
      dataIndex: 'livestockCount',
      key: 'livestockCount',
      render: (count: number) => count.toLocaleString() + ' 头/只',
    },
    {
      title: '环比变化',
      key: 'change',
      render: (_: any, record: LivestockPlan, index: number) => {
        if (index === 0) return <Tag color="default">基准</Tag>;
        const prev = livestockPlan[index - 1]?.livestockCount || record.livestockCount;
        const change = ((record.livestockCount - prev) / prev) * 100;
        if (change > 0) {
          return <Tag color="green">↑ {change.toFixed(1)}%</Tag>;
        } else if (change < 0) {
          return <Tag color="red">↓ {Math.abs(change).toFixed(1)}%</Tag>;
        }
        return <Tag color="default">-</Tag>;
      },
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  const recommendationColumns = [
    {
      title: '方案类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'expansion' ? 'blue' : 'orange'}>
          {type === 'expansion' ? '扩产方案' : '外运方案'}
        </Tag>
      ),
    },
    {
      title: '方案名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '预计投资',
      dataIndex: 'cost',
      key: 'cost',
      width: 120,
      render: (cost: number) => `¥${(cost / 10000).toFixed(0)}万元`,
    },
    {
      title: '投资回报率',
      dataIndex: 'roi',
      key: 'roi',
      width: 100,
      render: (roi: number) => (
        <span className="font-semibold text-green-600">{roi.toFixed(1)}年</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: PlanRecommendation) => (
        <Button
          type="link"
          icon={<PlayCircleOutlined />}
          onClick={() => {
            setSelectedRecommendation(record);
            setRecommendationModalVisible(true);
          }}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const hasCapacityGap = forecastData?.capacityGap?.some((g) => g > 0);
  const maxGap = forecastData?.capacityGap ? Math.max(...forecastData.capacityGap) : 0;
  const gapDays = forecastData?.capacityGap?.filter((g) => g > 0).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">预测规划</h1>
          <p className="text-gray-500 mt-1">上传年度养殖计划，预测粪污产出，智能推荐处理方案</p>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
            下载Excel模板
          </Button>
          <Upload
            customRequest={handleUpload}
            accept=".xlsx,.xls"
            showUploadList={false}
            disabled={!selectedFarm}
          >
            <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
              上传年度计划
            </Button>
          </Upload>
        </Space>
      </div>

      <Card className="shadow-sm">
        <Row gutter={16} align="middle">
          <Col span={8}>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium">选择养殖场：</span>
              <Select
                value={selectedFarm?.id}
                onChange={handleFarmChange}
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                placeholder="请选择养殖场"
              >
                {farms.map((farm) => (
                  <Option key={farm.id} value={farm.id}>
                    {farm.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          {selectedFarm && (
            <Col span={16}>
              <Descriptions column={4} size="small">
                <Descriptions.Item label="养殖类型">{selectedFarm.livestockType}</Descriptions.Item>
                <Descriptions.Item label="当前存栏">{selectedFarm.livestockCount.toLocaleString()} 头</Descriptions.Item>
                <Descriptions.Item label="处理工艺">{selectedFarm.processType}</Descriptions.Item>
                <Descriptions.Item label="日处理能力">{selectedFarm.treatmentCapacity} 吨</Descriptions.Item>
              </Descriptions>
            </Col>
          )}
        </Row>
      </Card>

      {hasCapacityGap && (
        <Alert
          message="处理能力预警"
          description={`预测显示未来90天内有 ${gapDays} 天粪污产出将超出处理能力，最大缺口达 ${maxGap.toFixed(1)} 吨/天，请及时采取措施。`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          action={
            <Button size="small" type="primary" danger>
              立即处理
            </Button>
          }
        />
      )}

      {!hasCapacityGap && forecastData && (
        <Alert
          message="处理能力充足"
          description="预测显示未来90天内粪污处理能力充足，无需额外措施。"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      )}

      {forecastData && (
        <>
          <Row gutter={16}>
            <Col span={6}>
              <Card className="shadow-sm h-full">
                <Statistic
                  title={<span className="text-gray-600"><BarChartOutlined className="mr-2" />预测周期</span>}
                  value={forecastData.forecastDays}
                  suffix="天"
                  valueStyle={{ color: '#0F766E' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="shadow-sm h-full">
                <Statistic
                  title={<span className="text-gray-600"><RiseOutlined className="mr-2" />基准存栏</span>}
                  value={forecastData.baselineLivestockCount}
                  suffix="头"
                  valueStyle={{ color: '#059669' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="shadow-sm h-full">
                <Statistic
                  title={<span className="text-gray-600"><EnvironmentOutlined className="mr-2" />日处理能力</span>}
                  value={forecastData.treatmentCapacity}
                  suffix="吨"
                  valueStyle={{ color: '#0891B2' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="shadow-sm h-full">
                <Statistic
                  title={<span className="text-gray-600"><RiseOutlined className="mr-2" />产能利用率</span>}
                  value={((forecastData.predictedWasteProduction[forecastData.predictedWasteProduction.length - 1] / forecastData.treatmentCapacity) * 100).toFixed(1)}
                  suffix="%"
                  valueStyle={{ color: forecastData.predictedWasteProduction[forecastData.predictedWasteProduction.length - 1] > forecastData.treatmentCapacity ? '#DC2626' : '#059669' }}
                />
                <Progress
                  percent={Math.min(100, ((forecastData.predictedWasteProduction[forecastData.predictedWasteProduction.length - 1] / forecastData.treatmentCapacity) * 100))}
                  showInfo={false}
                  size="small"
                  strokeColor={forecastData.predictedWasteProduction[forecastData.predictedWasteProduction.length - 1] > forecastData.treatmentCapacity ? '#DC2626' : '#059669'}
                  className="mt-2"
                />
              </Card>
            </Col>
          </Row>

          <Card
            title={
              <div className="flex items-center gap-2">
                <RiseOutlined className="text-teal-600" />
                <span>未来90天粪污产出预测</span>
              </div>
            }
            className="shadow-sm"
          >
            <ReactECharts
              option={getForecastChartOption()}
              style={{ height: '350px' }}
              notMerge={true}
            />
          </Card>

          <Row gutter={16}>
            <Col span={12}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <BarChartOutlined className="text-teal-600" />
                    <span>存栏量变化趋势</span>
                  </div>
                }
                className="shadow-sm"
              >
                <ReactECharts
                  option={getLivestockChartOption()}
                  style={{ height: '300px' }}
                  notMerge={true}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <FileExcelOutlined className="text-green-600" />
                    <span>年度养殖计划</span>
                    {livestockPlan.length > 0 && (
                      <Tag color="green" className="ml-2">
                        已上传
                      </Tag>
                    )}
                  </div>
                }
                className="shadow-sm"
              >
                {livestockPlan.length > 0 ? (
                  <Table
                    columns={planColumns}
                    dataSource={livestockPlan}
                    rowKey="month"
                    size="small"
                    pagination={false}
                    scroll={{ y: 220 }}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <UploadOutlined className="text-4xl mb-3" />
                    <p>请上传年度养殖计划Excel文件</p>
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {forecastData.recommendations && forecastData.recommendations.length > 0 && (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-blue-600" />
                  <span>智能推荐方案</span>
                  <Tag color="blue" className="ml-2">
                    {forecastData.recommendations.length} 个方案
                  </Tag>
                </div>
              }
              className="shadow-sm"
            >
              <Table
                columns={recommendationColumns}
                dataSource={forecastData.recommendations}
                rowKey="id"
                pagination={false}
                expandable={{
                  expandedRowRender: (record) => (
                    <div className="pl-8 py-4">
                      <p className="text-gray-700 mb-3">{record.description}</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-800">预期效益：</span>
                          {record.benefit}
                        </p>
                      </div>
                    </div>
                  ),
                }}
              />
            </Card>
          )}
        </>
      )}

      <Modal
        title={selectedRecommendation?.title}
        open={recommendationModalVisible}
        onCancel={() => setRecommendationModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setRecommendationModalVisible(false)}>
            关闭
          </Button>,
          <Button key="submit" type="primary">
            采纳此方案
          </Button>,
        ]}
        width={600}
      >
        {selectedRecommendation && (
          <div className="space-y-4">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="方案类型">
                <Tag color={selectedRecommendation.type === 'expansion' ? 'blue' : 'orange'}>
                  {selectedRecommendation.type === 'expansion' ? '设施扩建' : '粪污外运'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="预计投资">
                <span className="text-xl font-bold text-red-500">
                  ¥{(selectedRecommendation.cost / 10000).toFixed(0)}万元
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="投资回收期">
                <span className="text-xl font-bold text-green-600">
                  {selectedRecommendation.roi.toFixed(1)}年
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="预期效益">
                {selectedRecommendation.benefit}
              </Descriptions.Item>
            </Descriptions>

            <Card title="方案详情" size="small">
              <p className="text-gray-700 leading-relaxed">{selectedRecommendation.description}</p>
            </Card>

            {selectedRecommendation.type === 'expansion' && (
              <List
                size="small"
                header={<span className="font-semibold">实施步骤</span>}
                dataSource={[
                  '1. 委托专业机构进行可行性研究（2周）',
                  '2. 编制环境影响评价报告并报批（4周）',
                  '3. 设备采购与安装（8周）',
                  '4. 调试验收（2周）',
                  '5. 正式投产运营',
                ]}
                renderItem={(item) => <List.Item>{item}</List.Item>}
              />
            )}

            {selectedRecommendation.type === 'transport' && (
              <List
                size="small"
                header={<span className="font-semibold">实施步骤</span>}
                dataSource={[
                  '1. 筛选周边有机肥厂合作意向（1周）',
                  '2. 议价并签订长期合作协议（2周）',
                  '3. 落实运输车辆与路线规划（1周）',
                  '4. 制定日常运营管理制度',
                ]}
                renderItem={(item) => <List.Item>{item}</List.Item>}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Forecast;
