import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Select, Tag, List, Avatar, Statistic, Space } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { provinces, processTypes } from '../mock/data';
import dayjs from 'dayjs';
import { cn } from '../lib/utils';

const { Option } = Select;

const Dashboard = () => {
  const navigate = useNavigate();
  const [metricType, setMetricType] = useState<'utilization' | 'compliance' | 'risk'>(
    'utilization'
  );
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>();
  const [selectedProcess, setSelectedProcess] = useState<string | undefined>();
  const { nationalMetrics, getHeatmapData, getFarms, getAlerts, simulateRealtimeUpdate, user } =
    useAppStore();

  useEffect(() => {
    const interval = setInterval(() => {
      simulateRealtimeUpdate();
    }, 30000);
    return () => clearInterval(interval);
  }, [simulateRealtimeUpdate]);

  const farms = useMemo(
    () => getFarms({ province: selectedProvince, processType: selectedProcess }),
    [getFarms, selectedProvince, selectedProcess]
  );

  const scopedMetrics = useMemo(() => {
    const util = farms.length > 0
      ? farms.reduce((s, f) => s + f.resourceUtilizationRate, 0) / farms.length
      : nationalMetrics.resourceUtilizationRate;
    const comp = farms.length > 0
      ? farms.reduce((s, f) => s + f.facilityComplianceRate, 0) / farms.length
      : nationalMetrics.facilityComplianceRate;
    const risk = farms.length > 0
      ? farms.reduce((s, f) => s + f.environmentalRiskIndex, 0) / farms.length
      : nationalMetrics.environmentalRiskIndex;
    const active = farms.filter((f) => f.status === 'active').length;
    return { resourceUtilizationRate: parseFloat(util.toFixed(1)), facilityComplianceRate: parseFloat(comp.toFixed(1)), environmentalRiskIndex: parseFloat(risk.toFixed(1)), activeFarms: active };
  }, [farms, nationalMetrics]);

  const topRiskFarms = useMemo(
    () =>
      [...farms]
        .sort((a, b) => b.environmentalRiskIndex - a.environmentalRiskIndex)
        .slice(0, 10),
    [farms]
  );

  const recentAlerts = useMemo(() => getAlerts().slice(0, 8), [getAlerts]);

  const getMetricLabel = () => {
    switch (metricType) {
      case 'utilization':
        return '资源化利用率';
      case 'compliance':
        return '设施达标率';
      case 'risk':
        return '环境风险指数';
      default:
        return '资源化利用率';
    }
  };

  const heatmapData = getHeatmapData();

  const getMetricValue = (item: (typeof heatmapData)[0]) => {
    switch (metricType) {
      case 'utilization':
        return item.avgUtilizationRate;
      case 'compliance':
        return item.value * 0.9 + 5;
      case 'risk':
        return 100 - item.value;
      default:
        return item.avgUtilizationRate;
    }
  };

  const heatmapOption = useMemo(() => {
    const data = heatmapData.map((item) => ({
      name: item.province,
      value: getMetricValue(item),
      farmCount: item.farmCount,
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `<div class="p-2">
            <div class="font-bold mb-1">${params.name}</div>
            <div>${getMetricLabel()}: <span class="font-semibold text-teal-600">${params.value.toFixed(
              1
            )}%</span></div>
            <div>养殖场数量: ${params.data.farmCount}家</div>
          </div>`;
        },
      },
      visualMap: {
        min: metricType === 'risk' ? 20 : 50,
        max: metricType === 'risk' ? 90 : 95,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color:
            metricType === 'risk'
              ? ['#d1fae5', '#fef08a', '#fed7aa', '#fecaca', '#ef4444']
              : ['#ecfdf5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981'],
        },
      },
      series: [
        {
          name: getMetricLabel(),
          type: 'map',
          map: 'china',
          roam: false,
          emphasis: {
            label: {
              show: true,
            },
            itemStyle: {
              areaColor: '#0f766e',
            },
          },
          data,
        },
      ],
    };
  }, [heatmapData, metricType]);

  const riskRankingOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        max: 100,
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: topRiskFarms.map((f) => f.name.slice(0, 8) + '...'),
        axisLabel: {
          fontSize: 11,
          interval: 0,
        },
      },
      series: [
        {
          name: '环境风险指数',
          type: 'bar',
          data: topRiskFarms.map((f) => ({
            value: f.environmentalRiskIndex,
            itemStyle: {
              color:
                f.environmentalRiskIndex >= 70
                  ? '#ef4444'
                  : f.environmentalRiskIndex >= 45
                  ? '#f59e0b'
                  : '#10b981',
            },
          })),
          barWidth: 16,
          label: {
            show: true,
            position: 'right',
            fontSize: 11,
            formatter: '{c}',
          },
        },
      ],
    };
  }, [topRiskFarms]);

  const alertTrendOption = useMemo(() => {
    const days = [];
    const level1Data = [];
    const level2Data = [];
    for (let i = 6; i >= 0; i--) {
      days.push(dayjs().subtract(i, 'day').format('MM-DD'));
      level1Data.push(Math.floor(Math.random() * 5) + 3);
      level2Data.push(Math.floor(Math.random() * 2) + 1);
    }

    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['一级预警', '二级预警'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: days,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '一级预警',
          type: 'line',
          data: level1Data,
          smooth: true,
          itemStyle: { color: '#f59e0b' },
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
        {
          name: '二级预警',
          type: 'line',
          data: level2Data,
          smooth: true,
          itemStyle: { color: '#dc2626' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(220, 38, 38, 0.3)' },
                { offset: 1, color: 'rgba(220, 38, 38, 0.05)' },
              ],
            },
          },
        },
      ],
    };
  }, []);

  const getAlertTag = (level: string, status: string) => {
    const levelColor = level === 'level1' ? 'orange' : 'red';
    const levelText = level === 'level1' ? '一级预警' : '二级预警';
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'warning', text: '待处理' },
      processing: { color: 'processing', text: '处理中' },
      resolved: { color: 'success', text: '已解决' },
      escalated: { color: 'error', text: '已升级' },
    };
    return (
      <Space size="small">
        <Tag color={levelColor}>{levelText}</Tag>
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      </Space>
    );
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'danger':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <span className="text-gray-600">切换指标:</span>
          <Select
            value={metricType}
            onChange={setMetricType}
            style={{ width: 160 }}
          >
            <Option value="utilization">资源化利用率</Option>
            <Option value="compliance">设施达标率</Option>
            <Option value="risk">环境风险指数</Option>
          </Select>
        </div>
        <div className="flex gap-4">
          <Select
            placeholder="选择省份"
            allowClear
            style={{ width: 140 }}
            onChange={setSelectedProvince}
          >
            {provinces.map((p) => (
              <Option key={p.code} value={p.code}>
                {p.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="处理工艺"
            allowClear
            style={{ width: 140 }}
            onChange={setSelectedProcess}
          >
            {processTypes.map((p) => (
              <Option key={p.code} value={p.code}>
                {p.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="border-0 shadow-sm hover:shadow-md transition-all duration-300"
            styles={{ body: { padding: '24px' } }}
          >
            <Statistic
              title={user?.role === 'national' ? '全国资源化利用率' : '辖区资源化利用率'}
              value={scopedMetrics.resourceUtilizationRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#0f766e', fontSize: '32px', fontWeight: 700 }}
              prefix={
                <ArrowUpOutlined
                  className={cn(
                    'text-lg',
                    scopedMetrics.resourceUtilizationRate > 80
                      ? 'text-green-500'
                      : 'text-red-500'
                  )}
                />
              }
            />
            <div className="mt-2 text-sm text-gray-500">
              同比{' '}
              <span className="text-green-600 font-medium">+2.3%</span>
              <span className="mx-2">|</span>
              环比 <span className="text-green-600 font-medium">+0.8%</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="border-0 shadow-sm hover:shadow-md transition-all duration-300"
            styles={{ body: { padding: '24px' } }}
          >
            <Statistic
              title={user?.role === 'national' ? '设施运行达标率' : '辖区设施运行达标率'}
              value={scopedMetrics.facilityComplianceRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#059669', fontSize: '32px', fontWeight: 700 }}
              prefix={
                <CheckCircleOutlined
                  className={cn(
                    'text-lg',
                    scopedMetrics.facilityComplianceRate > 85
                      ? 'text-green-500'
                      : 'text-yellow-500'
                  )}
                />
              }
            />
            <div className="mt-2 text-sm text-gray-500">
              同比{' '}
              <span className="text-green-600 font-medium">+1.5%</span>
              <span className="mx-2">|</span>
              环比 <span className="text-green-600 font-medium">+0.5%</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="border-0 shadow-sm hover:shadow-md transition-all duration-300"
            styles={{ body: { padding: '24px' } }}
          >
            <Statistic
              title={user?.role === 'national' ? '环境风险指数' : '辖区环境风险指数'}
              value={scopedMetrics.environmentalRiskIndex}
              precision={1}
              valueStyle={{
                color: scopedMetrics.environmentalRiskIndex > 50 ? '#dc2626' : '#f59e0b',
                fontSize: '32px',
                fontWeight: 700,
              }}
              prefix={
                <WarningOutlined
                  className={cn(
                    'text-lg',
                    scopedMetrics.environmentalRiskIndex > 50
                      ? 'text-red-500'
                      : 'text-yellow-500'
                  )}
                />
              }
            />
            <div className="mt-2 text-sm text-gray-500">
              同比{' '}
              <span className="text-red-600 font-medium">+3.2%</span>
              <span className="mx-2">|</span>
              环比 <span className="text-green-600 font-medium">-1.1%</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="border-0 shadow-sm hover:shadow-md transition-all duration-300"
            styles={{ body: { padding: '24px' } }}
          >
            <Statistic
              title={user?.role === 'national' ? '在产养殖场数' : '辖内在产养殖场数'}
              value={scopedMetrics.activeFarms}
              valueStyle={{ color: '#0891b2', fontSize: '32px', fontWeight: 700 }}
              prefix={<EnvironmentOutlined className="text-lg text-cyan-500" />}
            />
            <div className="mt-2 text-sm text-gray-500">
              较上周{' '}
              <span className="text-green-600 font-medium">+126家</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="全国热力图"
            className="border-0 shadow-sm"
            extra={
              <span className="text-sm text-gray-500">
                当前显示: {getMetricLabel()}
              </span>
            }
          >
            <div style={{ height: '480px' }}>
              <ReactECharts
                option={heatmapOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="风险排名 TOP10"
            className="border-0 shadow-sm h-full"
            extra={
              <Tag color="red">高风险优先</Tag>
            }
          >
            <div style={{ height: '430px' }}>
              <ReactECharts
                option={riskRankingOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="最新预警"
            className="border-0 shadow-sm"
            extra={
              <a
                onClick={() => navigate('/alert')}
                className="text-teal-600 hover:text-teal-700 cursor-pointer text-sm"
              >
                查看全部 →
              </a>
            }
          >
            <List
              dataSource={recentAlerts}
              renderItem={(alert) => (
                <List.Item
                  key={alert.id}
                  className="cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
                  onClick={() => navigate(`/alert?id=${alert.id}`)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<WarningOutlined />}
                        className={
                          alert.level === 'level1' ? 'bg-orange-500' : 'bg-red-500'
                        }
                      />
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{alert.farmName}</span>
                        {getAlertTag(alert.level, alert.status)}
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">
                          {alert.triggerCondition} · 触发值{' '}
                          <span
                            className={cn(
                              'font-semibold',
                              alert.triggerValue < alert.threshold
                                ? 'text-green-600'
                                : 'text-red-600'
                            )}
                          >
                            {alert.triggerValue}%
                          </span>{' '}
                          / 阈值 {alert.threshold}%
                        </div>
                        <div className="text-xs text-gray-400">
                          {dayjs(alert.createdAt).format('YYYY-MM-DD HH:mm')}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="预警趋势 (近7天)"
            className="border-0 shadow-sm"
            extra={
              <Space size="small">
                <Tag color="orange">一级预警</Tag>
                <Tag color="red">二级预警</Tag>
              </Space>
            }
          >
            <div style={{ height: '380px' }}>
              <ReactECharts
                option={alertTrendOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="快速统计" className="border-0 shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={4}>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">
                {farms.filter((f) => f.riskLevel === 'normal').length}
              </div>
              <div className="text-sm text-gray-500 mt-1">正常运行</div>
            </div>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600">
                {farms.filter((f) => f.riskLevel === 'warning').length}
              </div>
              <div className="text-sm text-gray-500 mt-1">风险预警</div>
            </div>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
              <div className="text-3xl font-bold text-red-600">
                {farms.filter((f) => f.riskLevel === 'danger').length}
              </div>
              <div className="text-sm text-gray-500 mt-1">高风险</div>
            </div>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">
                {farms.filter((f) => f.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500 mt-1">在产</div>
            </div>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl">
              <div className="text-3xl font-bold text-slate-600">
                {farms.filter((f) => f.status === 'suspended').length}
              </div>
              <div className="text-sm text-gray-500 mt-1">停产整改</div>
            </div>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl">
              <div className="text-3xl font-bold text-teal-600">
                {(
                  (farms.filter((f) => f.status === 'active').length / farms.length) *
                  100
                ).toFixed(1)}
                %
              </div>
              <div className="text-sm text-gray-500 mt-1">开工率</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
