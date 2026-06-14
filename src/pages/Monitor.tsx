import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Select,
  Input,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Progress,
  Descriptions,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { provinces, processTypes, livestockTypes } from '../mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { Farm, RealtimeData } from '../types';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';

const { Option } = Select;

const Monitor = () => {
  const navigate = useNavigate();
  const [urlParams, setUrlParams] = useSearchParams();

  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(urlParams.get('province') || undefined);
  const [selectedScale, setSelectedScale] = useState<string | undefined>(urlParams.get('scale') || undefined);
  const [selectedProcess, setSelectedProcess] = useState<string | undefined>(urlParams.get('process') || undefined);
  const [selectedRisk, setSelectedRisk] = useState<string | undefined>(urlParams.get('risk') || undefined);
  const [searchText, setSearchText] = useState(urlParams.get('search') || '');

  const syncParams = (p: string, s: string, pr: string, r: string, q: string) => {
    const sp = new URLSearchParams();
    if (p) sp.set('province', p);
    if (s) sp.set('scale', s);
    if (pr) sp.set('process', pr);
    if (r) sp.set('risk', r);
    if (q) sp.set('search', q);
    setUrlParams(sp, { replace: true });
  };

  const handleSetProvince = (v: string | undefined) => { setSelectedProvince(v); syncParams(v || '', selectedScale || '', selectedProcess || '', selectedRisk || '', searchText); };
  const handleSetScale = (v: string | undefined) => { setSelectedScale(v); syncParams(selectedProvince || '', v || '', selectedProcess || '', selectedRisk || '', searchText); };
  const handleSetProcess = (v: string | undefined) => { setSelectedProcess(v); syncParams(selectedProvince || '', selectedScale || '', v || '', selectedRisk || '', searchText); };
  const handleSetRisk = (v: string | undefined) => { setSelectedRisk(v); syncParams(selectedProvince || '', selectedScale || '', selectedProcess || '', v || '', searchText); };
  const handleSetSearch = (v: string) => { setSearchText(v); syncParams(selectedProvince || '', selectedScale || '', selectedProcess || '', selectedRisk || '', v); };
  const [detailModal, setDetailModal] = useState<{
    visible: boolean;
    farm: Farm | null;
  }>({ visible: false, farm: null });

  const { getFarms, getRealtimeData } = useAppStore();

  const farms = useMemo(() => {
    let result = getFarms({
      province: selectedProvince,
      scale: selectedScale,
      processType: selectedProcess,
      riskLevel: selectedRisk,
    });
    if (searchText) {
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(searchText.toLowerCase()) ||
          f.address.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return result;
  }, [
    getFarms,
    selectedProvince,
    selectedScale,
    selectedProcess,
    selectedRisk,
    searchText,
  ]);

  const getProvinceName = (code: string) => {
    return provinces.find((p) => p.code === code)?.name || code;
  };

  const getProcessName = (code: string) => {
    return processTypes.find((p) => p.code === code)?.name || code;
  };

  const getLivestockName = (type: string) => {
    return livestockTypes.find((l) => l.type === type)?.name || type;
  };

  const getScaleTag = (scale: string) => {
    const map: Record<string, { color: string; text: string }> = {
      small: { color: 'blue', text: '小型' },
      medium: { color: 'orange', text: '中型' },
      large: { color: 'red', text: '大型' },
    };
    return <Tag color={map[scale]?.color}>{map[scale]?.text}</Tag>;
  };

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

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: '在产' },
      suspended: { color: 'warning', text: '停产整改' },
      closed: { color: 'default', text: '已关闭' },
    };
    return <Tag color={map[status]?.color}>{map[status]?.text}</Tag>;
  };

  const columns: ColumnsType<Farm> = [
    {
      title: '养殖场名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: '所在地区',
      dataIndex: 'province',
      key: 'province',
      width: 120,
      render: (code) => getProvinceName(code),
    },
    {
      title: '养殖类型',
      dataIndex: 'livestockType',
      key: 'livestockType',
      width: 100,
      render: (type) => getLivestockName(type),
    },
    {
      title: '规模',
      dataIndex: 'scale',
      key: 'scale',
      width: 80,
      render: (scale) => getScaleTag(scale),
    },
    {
      title: '处理工艺',
      dataIndex: 'processType',
      key: 'processType',
      width: 120,
      render: (code) => getProcessName(code),
    },
    {
      title: '存栏量',
      dataIndex: 'livestockCount',
      key: 'livestockCount',
      width: 100,
      align: 'right',
      render: (count) => <span className="font-mono">{count.toLocaleString()}</span>,
    },
    {
      title: '资源化利用率',
      dataIndex: 'resourceUtilizationRate',
      key: 'resourceUtilizationRate',
      width: 140,
      render: (value) => (
        <Progress
          percent={parseFloat(value.toFixed(1))}
          size="small"
          status={value >= 80 ? 'success' : value >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
    {
      title: '设施达标率',
      dataIndex: 'facilityComplianceRate',
      key: 'facilityComplianceRate',
      width: 140,
      render: (value) => (
        <Progress
          percent={parseFloat(value.toFixed(1))}
          size="small"
          status={value >= 85 ? 'success' : value >= 70 ? 'normal' : 'exception'}
        />
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (risk) => getRiskTag(risk),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setDetailModal({ visible: true, farm: record });
            }}
          >
            实时监控
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/farm/${record.id}?from=monitor`)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  const FacilityMonitorModal = () => {
    if (!detailModal.farm) return null;
    const realtimeData = getRealtimeData(detailModal.farm.id);

    const waterQualityOption = {
      tooltip: {
        trigger: 'axis',
      },
      radar: {
        indicator: [
          { name: 'COD', max: 100 },
          { name: '氨氮', max: 10 },
          { name: '总磷', max: 2 },
          { name: '溶解氧', max: 15 },
        ],
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [
                realtimeData.waterMonitoring.cod,
                realtimeData.waterMonitoring.ammoniaNitrogen,
                realtimeData.waterMonitoring.totalPhosphorus,
                realtimeData.waterMonitoring.dissolvedOxygen,
              ],
              name: '当前值',
              areaStyle: {
                color: 'rgba(15, 118, 110, 0.3)',
              },
              lineStyle: {
                color: '#0f766e',
              },
              itemStyle: {
                color: '#0f766e',
              },
            },
            {
              value: [50, 5, 1, 7.5],
              name: '标准值',
              lineStyle: {
                color: '#9ca3af',
                type: 'dashed',
              },
              itemStyle: {
                color: '#9ca3af',
              },
            },
          ],
        },
      ],
    };

    const facilityParamsOption = {
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
        type: 'category',
        data: ['温度(°C)', 'pH值', '含氧量(%)', '电耗(kW)'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '当前值',
          type: 'bar',
          data: [
            {
              value: realtimeData.facilityRunningParams.temperature,
              itemStyle: {
                color:
                  realtimeData.facilityRunningParams.temperature > 70
                    ? '#ef4444'
                    : '#10b981',
              },
            },
            {
              value: realtimeData.facilityRunningParams.ph,
              itemStyle: {
                color:
                  realtimeData.facilityRunningParams.ph > 8.5 ||
                  realtimeData.facilityRunningParams.ph < 5.5
                    ? '#ef4444'
                    : '#10b981',
              },
            },
            {
              value: realtimeData.facilityRunningParams.oxygenLevel,
              itemStyle: {
                color:
                  realtimeData.facilityRunningParams.oxygenLevel < 6
                    ? '#ef4444'
                    : '#10b981',
              },
            },
            {
              value: realtimeData.facilityRunningParams.powerConsumption,
              itemStyle: { color: '#3b82f6' },
            },
          ],
          barWidth: '40%',
        },
      ],
    };

    return (
      <Modal
        title={
          <div className="flex items-center gap-3">
            <span>实时监控 - {detailModal.farm?.name}</span>
            <Tag color="green">实时更新中</Tag>
          </div>
        }
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, farm: null })}
        width={1000}
        footer={null}
      >
        <div className="space-y-4">
          <Descriptions column={4} size="small" bordered>
            <Descriptions.Item label="更新时间">
              {dayjs(realtimeData.timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="粪污产生量">
              {realtimeData.wasteProduction.toFixed(2)} 吨/天
            </Descriptions.Item>
            <Descriptions.Item label="处理量">
              {realtimeData.wasteTreated.toFixed(2)} 吨/天
            </Descriptions.Item>
            <Descriptions.Item label="有机肥产出">
              {realtimeData.fertilizerProduced.toFixed(2)} 吨/天
            </Descriptions.Item>
          </Descriptions>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="设施运行参数" size="small">
                <div style={{ height: '250px' }}>
                  <ReactECharts
                    option={facilityParamsOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="水体监测指标" size="small">
                <div style={{ height: '250px' }}>
                  <ReactECharts
                    option={waterQualityOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" className="text-center">
                <Statistic
                  title="处理效率"
                  value={(
                    (realtimeData.wasteTreated / realtimeData.wasteProduction) *
                    100
                  ).toFixed(1)}
                  suffix="%"
                  valueStyle={{ fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" className="text-center">
                <Statistic
                  title="资源化转化率"
                  value={(
                    (realtimeData.fertilizerProduced / realtimeData.wasteProduction) *
                    100
                  ).toFixed(1)}
                  suffix="%"
                  valueStyle={{ fontSize: '24px', color: '#059669' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" className="text-center">
                <Statistic
                  title="设备负荷率"
                  value={85 + Math.random() * 10}
                  precision={1}
                  suffix="%"
                  valueStyle={{ fontSize: '24px', color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" className="text-center">
                <Statistic
                  title="运行状态"
                  value="正常"
                  valueStyle={{ fontSize: '24px', color: '#10b981' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <Input
            placeholder="搜索养殖场名称或地址"
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
            value={searchText}
            onChange={(e) => handleSetSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="选择省份"
            allowClear
            style={{ width: 140 }}
            value={selectedProvince}
            onChange={handleSetProvince}
          >
            {provinces.map((p) => (
              <Option key={p.code} value={p.code}>
                {p.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="养殖规模"
            allowClear
            style={{ width: 120 }}
            value={selectedScale}
            onChange={handleSetScale}
          >
            <Option value="small">小型</Option>
            <Option value="medium">中型</Option>
            <Option value="large">大型</Option>
          </Select>
          <Select
            placeholder="处理工艺"
            allowClear
            style={{ width: 140 }}
            value={selectedProcess}
            onChange={handleSetProcess}
          >
            {processTypes.map((p) => (
              <Option key={p.code} value={p.code}>
                {p.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="风险等级"
            allowClear
            style={{ width: 120 }}
            value={selectedRisk}
            onChange={handleSetRisk}
          >
            <Option value="normal">正常</Option>
            <Option value="warning">预警</Option>
            <Option value="danger">高风险</Option>
          </Select>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText('');
                setSelectedProvince(undefined);
                setSelectedScale(undefined);
                setSelectedProcess(undefined);
                setSelectedRisk(undefined);
                setUrlParams({}, { replace: true });
              }}
            >
              重置
            </Button>
            <Button type="primary" icon={<DownloadOutlined />}>
              导出数据
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="养殖场总数"
              value={farms.length}
              valueStyle={{ fontSize: '28px', color: '#0f766e' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="正常运行"
              value={farms.filter((f) => f.riskLevel === 'normal').length}
              valueStyle={{ fontSize: '28px', color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="风险预警"
              value={farms.filter((f) => f.riskLevel === 'warning').length}
              valueStyle={{ fontSize: '28px', color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="高风险"
              value={farms.filter((f) => f.riskLevel === 'danger').length}
              valueStyle={{ fontSize: '28px', color: '#dc2626' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm" title="养殖场列表">
        <Table
          columns={columns}
          dataSource={farms}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          size="middle"
        />
      </Card>

      <FacilityMonitorModal />
    </div>
  );
};

export default Monitor;
