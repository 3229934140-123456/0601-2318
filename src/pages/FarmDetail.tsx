import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Progress,
  Tabs,
  Empty,
  Button,
  Space,
  Table,
  Badge,
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '../store';
import { provinces, processTypes, livestockTypes } from '../mock/data';
import dayjs from 'dayjs';
import { useMemo, useState, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { TransportRecord } from '../types';

const FarmDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFarmById, getHistoryData, getFertilizerData, getTransportRecords } =
    useAppStore();

  const farm = useMemo(() => (id ? getFarmById(id) : undefined), [id, getFarmById]);
  const historyData = useMemo(
    () => (id ? getHistoryData(id, 7) : { dates: [], data: [] }),
    [id, getHistoryData]
  );
  const fertilizerData = useMemo(
    () => (id ? getFertilizerData(id) : { dates: [], production: [], sales: [] }),
    [id, getFertilizerData]
  );
  const transportRecords = useMemo(
    () => (id ? getTransportRecords(id) : []),
    [id, getTransportRecords]
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && transportRecords.length > 0) {
      interval = setInterval(() => {
        setCurrentTrackIndex((prev) => (prev + 1) % transportRecords.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, transportRecords.length]);

  if (!farm) {
    return <Empty description="养殖场不存在" />;
  }

  const getProvinceName = (code: string) =>
    provinces.find((p) => p.code === code)?.name || code;
  const getProcessName = (code: string) =>
    processTypes.find((p) => p.code === code)?.name || code;
  const getLivestockName = (type: string) =>
    livestockTypes.find((l) => l.type === type)?.name || type;

  const getRiskTag = (risk: string) => {
    const map: Record<string, { color: string; icon: any; text: string }> = {
      normal: { color: 'success', icon: CheckCircleOutlined, text: '正常' },
      warning: { color: 'warning', icon: WarningOutlined, text: '预警' },
      danger: { color: 'error', icon: CloseCircleOutlined, text: '高风险' },
    };
    const config = map[risk];
    return (
      <Tag icon={<config.icon />} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  const getScaleTag = (scale: string) => {
    const map: Record<string, { color: string; text: string }> = {
      small: { color: 'blue', text: '小型' },
      medium: { color: 'orange', text: '中型' },
      large: { color: 'red', text: '大型' },
    };
    return <Tag color={map[scale]?.color}>{map[scale]?.text}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: '在产' },
      suspended: { color: 'warning', text: '停产整改' },
      closed: { color: 'default', text: '已关闭' },
    };
    return <Tag color={map[status]?.color}>{map[status]?.text}</Tag>;
  };

  const trendOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['粪污产生量', '处理量', '资源化利用率'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: historyData.dates,
    },
    yAxis: [
      {
        type: 'value',
        name: '吨/天',
        position: 'left',
      },
      {
        type: 'value',
        name: '利用率(%)',
        position: 'right',
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        name: '粪污产生量',
        type: 'bar',
        data: historyData.data.map((d) => d.wasteProduction),
        itemStyle: {
          color: 'rgba(245, 158, 11, 0.8)',
        },
      },
      {
        name: '处理量',
        type: 'bar',
        data: historyData.data.map((d) => d.wasteTreated),
        itemStyle: {
          color: 'rgba(16, 185, 129, 0.8)',
        },
      },
      {
        name: '资源化利用率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: historyData.data.map((d) =>
          parseFloat(((d.wasteTreated / d.wasteProduction) * 100).toFixed(1))
        ),
        itemStyle: {
          color: '#0f766e',
        },
        lineStyle: {
          width: 3,
        },
        symbol: 'circle',
        symbolSize: 8,
      },
    ],
  };

  const fertilizerOption = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['有机肥产出', '有机肥销售'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: fertilizerData.dates,
    },
    yAxis: {
      type: 'value',
      name: '吨',
    },
    series: [
      {
        name: '有机肥产出',
        type: 'bar',
        data: fertilizerData.production,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#059669' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '30%',
      },
      {
        name: '有机肥销售',
        type: 'line',
        smooth: true,
        data: fertilizerData.sales,
        itemStyle: {
          color: '#f59e0b',
        },
        lineStyle: {
          width: 3,
        },
        symbol: 'diamond',
        symbolSize: 10,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.05)' },
            ],
          },
        },
      },
    ],
  };

  const transportColumns: ColumnsType<TransportRecord> = [
    {
      title: '车牌号',
      dataIndex: 'vehiclePlate',
      key: 'vehiclePlate',
      width: 100,
    },
    {
      title: '目的地',
      dataIndex: 'destination',
      key: 'destination',
      width: 100,
    },
    {
      title: '货物类型',
      dataIndex: 'cargoType',
      key: 'cargoType',
      width: 100,
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: '重量(吨)',
      dataIndex: 'cargoWeight',
      key: 'cargoWeight',
      width: 100,
      render: (w) => <span className="font-mono">{w}</span>,
    },
    {
      title: '出发时间',
      dataIndex: 'departureTime',
      key: 'departureTime',
      width: 160,
      render: (t) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '到达时间',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      width: 160,
      render: (t) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const map: Record<string, { color: string; text: string }> = {
          transit: { color: 'processing', text: '运输中' },
          arrived: { color: 'success', text: '已到达' },
          delayed: { color: 'warning', text: '延误' },
        };
        return <Badge status={map[status]?.color as any} text={map[status]?.text} />;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record, index) => (
        <Button
          type="link"
          size="small"
          onClick={() => setCurrentTrackIndex(index)}
          disabled={record.status !== 'transit'}
        >
          查看轨迹
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'trend',
      label: '粪污处理趋势',
      children: (
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card className="border-0 shadow-sm">
                <Statistic
                  title="日均粪污产生量"
                  value={
                    historyData.data.reduce((sum, d) => sum + d.wasteProduction, 0) /
                    historyData.data.length
                  }
                  precision={2}
                  suffix="吨/天"
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="border-0 shadow-sm">
                <Statistic
                  title="日均处理量"
                  value={
                    historyData.data.reduce((sum, d) => sum + d.wasteTreated, 0) /
                    historyData.data.length
                  }
                  precision={2}
                  suffix="吨/天"
                  valueStyle={{ color: '#10b981' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="border-0 shadow-sm">
                <Statistic
                  title="平均资源化利用率"
                  value={
                    historyData.data.reduce(
                      (sum, d) => sum + (d.wasteTreated / d.wasteProduction) * 100,
                      0
                    ) / historyData.data.length
                  }
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#0f766e' }}
                />
              </Card>
            </Col>
          </Row>
          <Card className="border-0 shadow-sm" title="近7天粪污处理趋势">
            <div style={{ height: '400px' }}>
              <ReactECharts
                option={trendOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </Card>
          <Card className="border-0 shadow-sm" title="每日处理详情">
            <Table
              size="small"
              dataSource={historyData.data.map((d, i) => ({
                ...d,
                key: i,
                date: historyData.dates[i],
                utilizationRate: parseFloat(
                  ((d.wasteTreated / d.wasteProduction) * 100).toFixed(1)
                ),
              }))}
              columns={[
                { title: '日期', dataIndex: 'date', key: 'date' },
                {
                  title: '产生量(吨)',
                  dataIndex: 'wasteProduction',
                  key: 'wasteProduction',
                  render: (v) => v.toFixed(2),
                },
                {
                  title: '处理量(吨)',
                  dataIndex: 'wasteTreated',
                  key: 'wasteTreated',
                  render: (v) => v.toFixed(2),
                },
                {
                  title: '有机肥产出(吨)',
                  dataIndex: 'fertilizerProduced',
                  key: 'fertilizerProduced',
                  render: (v) => v.toFixed(2),
                },
                {
                  title: '利用率(%)',
                  dataIndex: 'utilizationRate',
                  key: 'utilizationRate',
                  render: (v) => (
                    <Progress
                      percent={v}
                      size="small"
                      status={v >= 80 ? 'success' : v >= 60 ? 'normal' : 'exception'}
                    />
                  ),
                },
              ]}
              pagination={false}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'fertilizer',
      label: '有机肥产出与销售',
      children: (
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card className="border-0 shadow-sm">
                <Statistic
                  title="累计产出"
                  value={fertilizerData.production.reduce((a, b) => a + b, 0)}
                  precision={1}
                  suffix="吨"
                  valueStyle={{ color: '#10b981' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="border-0 shadow-sm">
                <Statistic
                  title="累计销售"
                  value={fertilizerData.sales.reduce((a, b) => a + b, 0)}
                  precision={1}
                  suffix="吨"
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="border-0 shadow-sm">
                <Statistic
                  title="当前库存"
                  value={
                    fertilizerData.production.reduce((a, b) => a + b, 0) -
                    fertilizerData.sales.reduce((a, b) => a + b, 0)
                  }
                  precision={1}
                  suffix="吨"
                  valueStyle={{ color: '#0891b2' }}
                />
              </Card>
            </Col>
          </Row>
          <Card className="border-0 shadow-sm" title="有机肥产销对比">
            <div style={{ height: '400px' }}>
              <ReactECharts
                option={fertilizerOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </Card>
          <Card className="border-0 shadow-sm" title="产销明细">
            <Table
              size="small"
              dataSource={fertilizerData.dates.map((date, i) => ({
                key: i,
                date,
                production: fertilizerData.production[i],
                sales: fertilizerData.sales[i],
                inventory:
                  fertilizerData.production
                    .slice(0, i + 1)
                    .reduce((a, b) => a + b, 0) -
                  fertilizerData.sales.slice(0, i + 1).reduce((a, b) => a + b, 0),
              }))}
              columns={[
                { title: '月份', dataIndex: 'date', key: 'date' },
                {
                  title: '产出(吨)',
                  dataIndex: 'production',
                  key: 'production',
                  render: (v) => <span className="text-green-600 font-medium">{v}</span>,
                },
                {
                  title: '销售(吨)',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (v) => <span className="text-orange-600 font-medium">{v}</span>,
                },
                {
                  title: '库存(吨)',
                  dataIndex: 'inventory',
                  key: 'inventory',
                  render: (v) => (
                    <span
                      className={`font-medium ${v < 0 ? 'text-red-600' : 'text-cyan-600'}`}
                    >
                      {v.toFixed(1)}
                    </span>
                  ),
                },
              ]}
              pagination={false}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'transport',
      label: '运输车辆轨迹',
      children: (
        <div className="space-y-6">
          <Card
            className="border-0 shadow-sm"
            title="运输车辆监控"
            extra={
              <Space>
                <Button
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? '暂停' : '播放'}
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => setCurrentTrackIndex(0)}
                >
                  重置
                </Button>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <div
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl relative overflow-hidden"
                  style={{ height: '450px' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
                        <TruckOutlined className="text-3xl text-teal-600" />
                      </div>
                      <div className="text-lg font-semibold text-teal-700">
                        车辆 {transportRecords[currentTrackIndex]?.vehiclePlate || '-'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        当前位置:{' '}
                        {transportRecords[currentTrackIndex]?.currentPosition
                          .map((v) => v.toFixed(4))
                          .join(', ') || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        目的地: {transportRecords[currentTrackIndex]?.destination || '-'}
                      </div>
                      <div className="mt-4">
                        <Badge
                          status={
                            transportRecords[currentTrackIndex]?.status === 'transit'
                              ? 'processing'
                              : transportRecords[currentTrackIndex]?.status === 'arrived'
                              ? 'success'
                              : 'warning'
                          }
                          text={
                            transportRecords[currentTrackIndex]?.status === 'transit'
                              ? '运输中'
                              : transportRecords[currentTrackIndex]?.status === 'arrived'
                              ? '已到达'
                              : '延误'
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Timeline
                      items={transportRecords[currentTrackIndex]?.route.map(
                        (point, i) => ({
                          color: i === transportRecords[currentTrackIndex]!.route.length - 1
                            ? 'green'
                            : 'blue',
                          children: (
                            <div className="text-sm">
                              <div className="font-medium">
                                {i === 0 ? '起点' : i === transportRecords[currentTrackIndex]!.route.length - 1 ? '终点' : `途经点${i}`}
                              </div>
                              <div className="text-gray-500">
                                {point.map((v) => v.toFixed(4)).join(', ')}
                              </div>
                            </div>
                          ),
                        })
                      )}
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={8}>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">运输列表</div>
                  {transportRecords.map((record, index) => (
                    <Card
                      key={record.id}
                      size="small"
                      className={`cursor-pointer transition-all ${
                        currentTrackIndex === index
                          ? 'border-teal-500 bg-teal-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentTrackIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{record.vehiclePlate}</div>
                          <div className="text-sm text-gray-500">
                            → {record.destination}
                          </div>
                        </div>
                        <Badge
                          status={
                            record.status === 'transit'
                              ? 'processing'
                              : record.status === 'arrived'
                              ? 'success'
                              : 'warning'
                          }
                          text={
                            record.status === 'transit'
                              ? '运输中'
                              : record.status === 'arrived'
                              ? '已到达'
                              : '延误'
                          }
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </Col>
            </Row>
          </Card>
          <Card className="border-0 shadow-sm" title="运输记录">
            <Table
              columns={transportColumns}
              dataSource={transportRecords}
              rowKey="id"
              size="small"
            />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/monitor')}
        >
          返回列表
        </Button>
        <h2 className="text-xl font-bold text-gray-800">{farm.name}</h2>
        <Space>
          {getRiskTag(farm.riskLevel)}
          {getScaleTag(farm.scale)}
          {getStatusTag(farm.status)}
        </Space>
      </div>

      <Card className="border-0 shadow-sm">
        <Descriptions column={4} bordered size="small">
          <Descriptions.Item label="所在地区">
            {getProvinceName(farm.province)}
          </Descriptions.Item>
          <Descriptions.Item label="详细地址">{farm.address}</Descriptions.Item>
          <Descriptions.Item label="养殖类型">
            {getLivestockName(farm.livestockType)}
          </Descriptions.Item>
          <Descriptions.Item label="处理工艺">
            {getProcessName(farm.processType)}
          </Descriptions.Item>
          <Descriptions.Item label="存栏量">
            <span className="font-mono font-semibold">
              {farm.livestockCount.toLocaleString()}
            </span>{' '}
            头/只
          </Descriptions.Item>
          <Descriptions.Item label="日粪污产生量">
            <span className="font-mono">{farm.dailyWasteProduction.toFixed(2)}</span>{' '}
            吨/天
          </Descriptions.Item>
          <Descriptions.Item label="处理能力">
            <span className="font-mono">{farm.treatmentCapacity.toFixed(2)}</span>{' '}
            吨/天
          </Descriptions.Item>
          <Descriptions.Item label="有机肥产能">
            <span className="font-mono">
              {farm.organicFertilizerCapacity.toFixed(2)}
            </span>{' '}
            吨/天
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm h-full">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">资源化利用率</div>
              <Progress
                type="circle"
                percent={parseFloat(farm.resourceUtilizationRate.toFixed(1))}
                size={100}
                status={
                  farm.resourceUtilizationRate >= 80
                    ? 'success'
                    : farm.resourceUtilizationRate >= 60
                    ? 'normal'
                    : 'exception'
                }
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm h-full">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">设施达标率</div>
              <Progress
                type="circle"
                percent={parseFloat(farm.facilityComplianceRate.toFixed(1))}
                size={100}
                status={
                  farm.facilityComplianceRate >= 85
                    ? 'success'
                    : farm.facilityComplianceRate >= 70
                    ? 'normal'
                    : 'exception'
                }
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm h-full">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">环境风险指数</div>
              <Progress
                type="circle"
                percent={parseFloat(farm.environmentalRiskIndex.toFixed(1))}
                size={100}
                status={
                  farm.environmentalRiskIndex < 30
                    ? 'success'
                    : farm.environmentalRiskIndex < 60
                    ? 'normal'
                    : 'exception'
                }
                format={(percent) => <span className="text-lg font-bold">{percent}</span>}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm h-full">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">经纬度</div>
              <div className="font-mono text-sm">
                {farm.coordinates[0].toFixed(4)}
                <br />
                {farm.coordinates[1].toFixed(4)}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Tabs items={tabItems} defaultActiveKey="trend" />
      </Card>
    </div>
  );
};

export default FarmDetail;
