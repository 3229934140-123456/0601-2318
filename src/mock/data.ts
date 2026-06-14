import {
  User,
  Farm,
  Alert,
  ApprovalProcess,
  DiagnosticReport,
  Province,
  ProcessType,
  LivestockType,
  RealtimeData,
  TransportRecord,
  HeatmapItem,
  NationalMetrics,
  ForecastData,
  LivestockPlan,
} from '../types';

export const provinces: Province[] = [
  { code: '11', name: '北京市' },
  { code: '12', name: '天津市' },
  { code: '13', name: '河北省' },
  { code: '14', name: '山西省' },
  { code: '15', name: '内蒙古自治区' },
  { code: '21', name: '辽宁省' },
  { code: '22', name: '吉林省' },
  { code: '23', name: '黑龙江省' },
  { code: '31', name: '上海市' },
  { code: '32', name: '江苏省' },
  { code: '33', name: '浙江省' },
  { code: '34', name: '安徽省' },
  { code: '35', name: '福建省' },
  { code: '36', name: '江西省' },
  { code: '37', name: '山东省' },
  { code: '41', name: '河南省' },
  { code: '42', name: '湖北省' },
  { code: '43', name: '湖南省' },
  { code: '44', name: '广东省' },
  { code: '45', name: '广西壮族自治区' },
  { code: '46', name: '海南省' },
  { code: '50', name: '重庆市' },
  { code: '51', name: '四川省' },
  { code: '52', name: '贵州省' },
  { code: '53', name: '云南省' },
  { code: '54', name: '西藏自治区' },
  { code: '61', name: '陕西省' },
  { code: '62', name: '甘肃省' },
  { code: '63', name: '青海省' },
  { code: '64', name: '宁夏回族自治区' },
  { code: '65', name: '新疆维吾尔自治区' },
];

export const processTypes: ProcessType[] = [
  { code: 'compost', name: '好氧堆肥', efficiency: 0.85 },
  { code: 'biogas', name: '沼气工程', efficiency: 0.78 },
  { code: 'separation', name: '固液分离', efficiency: 0.72 },
  { code: 'fermentation', name: '生物发酵', efficiency: 0.88 },
  { code: 'membrane', name: '膜处理', efficiency: 0.92 },
  { code: 'ecological', name: '生态处理', efficiency: 0.65 },
];

export const livestockTypes: LivestockType[] = [
  { type: 'pig', name: '生猪', wasteCoefficient: 5.2 },
  { type: 'cow', name: '奶牛', wasteCoefficient: 28.5 },
  { type: 'beef', name: '肉牛', wasteCoefficient: 18.3 },
  { type: 'chicken', name: '蛋鸡', wasteCoefficient: 0.12 },
  { type: 'broiler', name: '肉鸡', wasteCoefficient: 0.08 },
  { type: 'sheep', name: '肉羊', wasteCoefficient: 3.6 },
  { type: 'duck', name: '肉鸭', wasteCoefficient: 0.15 },
];

export const initialUsers: User[] = [
  {
    id: 'user_001',
    username: 'admin_national',
    name: '国家级管理员',
    role: 'national',
    permissions: ['all'],
  },
  {
    id: 'user_002',
    username: 'admin_shandong',
    name: '山东省管理员',
    role: 'provincial',
    province: '37',
    permissions: ['view_province', 'approval'],
  },
  {
    id: 'user_003',
    username: 'farm_owner_001',
    name: '惠民养殖场场主',
    role: 'farm_owner',
    farmId: 'farm_001',
    permissions: ['view_farm', 'upload_plan', 'confirm_adjustment'],
  },
  {
    id: 'user_004',
    username: 'county_epd_001',
    name: '惠民县环保局',
    role: 'county_epd',
    province: '37',
    city: '16',
    permissions: ['review_approval', 'view_county'],
  },
  {
    id: 'user_005',
    username: 'provincial_agri_001',
    name: '山东省农业农村厅',
    role: 'provincial_agri',
    province: '37',
    permissions: ['final_approval', 'view_province'],
  },
];

const farmNames = [
  '惠民养殖场',
  '绿源生态养殖基地',
  '天蓬牧业',
  '金农畜牧产业园',
  '丰华奶牛场',
  '鹏程养猪专业合作社',
  '宏远禽业',
  '顺发肉牛养殖基地',
  '益农生猪养殖场',
  '富硒牧业',
  '康源畜禽养殖公司',
  '恒达生态养殖场',
  '兴农畜牧科技',
  '盛达养猪场',
  '裕丰禽业合作社',
];

export const generateFarms = (): Farm[] => {
  const farms: Farm[] = [];
  const scales: Farm['scale'][] = ['small', 'medium', 'large'];
  const riskLevels: Farm['riskLevel'][] = ['normal', 'warning', 'danger'];
  const statuses: Farm['status'][] = ['active', 'active', 'active', 'suspended'];

  for (let i = 0; i < 50; i++) {
    const provinceIndex = i % provinces.length;
    const province = provinces[provinceIndex];
    const processType = processTypes[i % processTypes.length];
    const livestockType = livestockTypes[i % livestockTypes.length];
    const scale = scales[i % 3];
    const isDanger = i % 7 === 0;
    const isWarning = i % 5 === 0 && !isDanger;

    const baseLat = 35 + (Math.random() - 0.5) * 10;
    const baseLng = 110 + (Math.random() - 0.5) * 20;

    farms.push({
      id: `farm_${String(i + 1).padStart(3, '0')}`,
      name: farmNames[i % farmNames.length] + ` (${province.name})`,
      province: province.code,
      city: String(1 + (i % 17)).padStart(2, '0'),
      district: String(1 + (i % 100)).padStart(2, '0'),
      address: `${province.name}某市某县某镇${i + 1}号`,
      scale,
      processType: processType.code,
      livestockType: livestockType.type,
      livestockCount: Math.floor(
        (scale === 'large' ? 5000 : scale === 'medium' ? 1000 : 200) *
          (0.8 + Math.random() * 0.4)
      ),
      dailyWasteProduction: parseFloat(
        (
          livestockType.wasteCoefficient *
          (scale === 'large' ? 5000 : scale === 'medium' ? 1000 : 200) /
          1000
        ).toFixed(2)
      ),
      treatmentCapacity: parseFloat(
        (
          livestockType.wasteCoefficient *
          (scale === 'large' ? 5000 : scale === 'medium' ? 1000 : 200) *
          processType.efficiency /
          1000
        ).toFixed(2)
      ),
      organicFertilizerCapacity: parseFloat(
        (
          livestockType.wasteCoefficient *
          (scale === 'large' ? 5000 : scale === 'medium' ? 1000 : 200) *
          0.3 /
          1000
        ).toFixed(2)
      ),
      coordinates: [parseFloat(baseLat.toFixed(4)), parseFloat(baseLng.toFixed(4))],
      riskLevel: isDanger ? 'danger' : isWarning ? 'warning' : 'normal',
      resourceUtilizationRate: isDanger
        ? 45 + Math.random() * 20
        : isWarning
        ? 65 + Math.random() * 15
        : 80 + Math.random() * 18,
      facilityComplianceRate: isDanger
        ? 50 + Math.random() * 18
        : isWarning
        ? 68 + Math.random() * 10
        : 88 + Math.random() * 10,
      environmentalRiskIndex: isDanger
        ? 75 + Math.random() * 20
        : isWarning
        ? 45 + Math.random() * 25
        : 10 + Math.random() * 30,
      status: statuses[i % 4],
      consecutiveLowComplianceDays: isDanger ? 3 + Math.floor(Math.random() * 5) : isWarning ? 1 + Math.floor(Math.random() * 3) : 0,
      consecutiveRiskRiseDays: isDanger ? 2 + Math.floor(Math.random() * 4) : isWarning ? 1 + Math.floor(Math.random() * 2) : 0,
    });
  }
  return farms;
};

export const farms = generateFarms();

export const generateAlerts = (): Alert[] => {
  const alerts: Alert[] = [];
  const now = Date.now();

  for (let i = 0; i < 15; i++) {
    const farm = farms[i % farms.length];
    const isLevel2 = i % 5 === 0;
    const daysAgo = 1 + (i % 10);
    const durationDays = 3 + (i % 4);

    alerts.push({
      id: `alert_${String(i + 1).padStart(3, '0')}`,
      farmId: farm.id,
      farmName: farm.name,
      level: isLevel2 ? 'level2' : 'level1',
      type: i % 3 === 0 ? 'facility' : i % 3 === 1 ? 'environment' : 'comprehensive',
      triggerCondition: i % 2 === 0 ? '连续设施达标率低于70%' : '环境风险指数持续上升',
      triggerValue: parseFloat((60 + Math.random() * 10).toFixed(1)),
      threshold: 70,
      durationDays,
      status:
        i % 4 === 0
          ? 'pending'
          : i % 4 === 1
          ? 'processing'
          : i % 4 === 2
          ? 'resolved'
          : 'escalated',
      createdAt: now - daysAgo * 24 * 60 * 60 * 1000,
      notifiedUsers: ['user_003', 'user_004'],
      processingHistory: [
        {
          action: '预警生成',
          operator: 'system',
          timestamp: now - daysAgo * 24 * 60 * 60 * 1000,
          remark: '自动检测异常',
        },
      ],
    });
  }
  return alerts;
};

export const alerts = generateAlerts();

export const generateApprovals = (): ApprovalProcess[] => {
  const escalatedAlerts = alerts.filter((a) => a.status === 'escalated');
  return escalatedAlerts.map((alert, index) => ({
    id: `approval_${String(index + 1).padStart(3, '0')}`,
    alertId: alert.id,
    farmId: alert.farmId,
    alertLevel: alert.level,
    adjustmentType: index % 2 === 0 ? 'process_change' : 'production_limit',
    proposedPlan:
      index % 2 === 0
        ? '建议升级处理设施，采用膜处理工艺，预计投资200万元，处理能力提升30%'
        : '建议限制生产规模30%，减少粪污产生量，待设施升级完成后恢复',
    currentStage:
      index % 3 === 0 ? 'farm_owner' : index % 3 === 1 ? 'county_epd' : 'provincial_agri',
    stages: [
      {
        id: 'stage_1',
        stageName: 'farm_owner',
        status: index % 3 === 0 ? 'pending' : 'approved',
        opinion: index % 3 === 0 ? '' : '同意调整方案，将尽快落实',
        approvedAt:
          index % 3 === 0 ? undefined : Date.now() - 3 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'stage_2',
        stageName: 'county_epd',
        status: index % 3 === 0 ? 'pending' : index % 3 === 1 ? 'pending' : 'approved',
        opinion: index % 3 <= 1 ? '' : '复核通过，建议加快设施升级进度',
        approvedAt:
          index % 3 <= 1 ? undefined : Date.now() - 1 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'stage_3',
        stageName: 'provincial_agri',
        status: index % 3 === 2 ? 'pending' : 'pending',
        opinion: '',
        approvedAt: undefined,
      },
    ],
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  }));
};

export const approvals = generateApprovals();

export const generateReports = (): DiagnosticReport[] => {
  const reports: DiagnosticReport[] = [];
  const now = Date.now();
  const reportScopes: Array<{
    type: 'national' | 'province' | 'city' | 'farm';
    region?: string;
    farmId?: string;
  }> = [
    { type: 'national' },
    { type: 'province', region: '37' },
    { type: 'province', region: '32' },
    { type: 'province', region: '44' },
    { type: 'city', region: '3716' },
    { type: 'city', region: '3201' },
    { type: 'city', region: '4403' },
    { type: 'farm', region: '1101', farmId: 'farm_001' },
    { type: 'farm', region: '1201', farmId: 'farm_002' },
    { type: 'farm', region: '1301', farmId: 'farm_003' },
    { type: 'farm', region: '1401', farmId: 'farm_004' },
    { type: 'farm', region: '1501', farmId: 'farm_005' },
  ];

  for (let i = 0; i < reportScopes.length; i++) {
    const scope = reportScopes[i];
    let targetFarm: Farm | undefined;
    if (scope.type === 'farm' && scope.farmId) {
      targetFarm = farms.find((f) => f.id === scope.farmId);
    }
    reports.push({
      id: `report_${String(i + 1).padStart(3, '0')}`,
      period: 'weekly',
      startDate: now - 7 * 24 * 60 * 60 * 1000,
      endDate: now,
      scope: {
        type: scope.type,
        region: scope.region,
        farmId: (scope as any).farmId,
      },
      summary: {
        resourceUtilizationRate: targetFarm
          ? {
              current: parseFloat(targetFarm.resourceUtilizationRate.toFixed(1)),
              yoy: parseFloat((-2 + Math.random() * 5).toFixed(1)),
              mom: parseFloat((-1 + Math.random() * 3).toFixed(1)),
            }
          : {
              current: parseFloat((78 + Math.random() * 15).toFixed(1)),
              yoy: parseFloat((-2 + Math.random() * 5).toFixed(1)),
              mom: parseFloat((-1 + Math.random() * 3).toFixed(1)),
            },
        facilityComplianceRate: targetFarm
          ? {
              current: parseFloat(targetFarm.facilityComplianceRate.toFixed(1)),
              yoy: parseFloat((-1 + Math.random() * 4).toFixed(1)),
              mom: parseFloat((0.5 + Math.random() * 2).toFixed(1)),
            }
          : {
              current: parseFloat((82 + Math.random() * 12).toFixed(1)),
              yoy: parseFloat((-1 + Math.random() * 4).toFixed(1)),
              mom: parseFloat((0.5 + Math.random() * 2).toFixed(1)),
            },
        alertCount: targetFarm
          ? {
              level1: alerts.filter((a) => a.farmId === targetFarm!.id && a.level === 'level1').length,
              level2: alerts.filter((a) => a.farmId === targetFarm!.id && a.level === 'level2').length,
              total: alerts.filter((a) => a.farmId === targetFarm!.id).length,
            }
          : {
              level1: 8 + Math.floor(Math.random() * 5),
              level2: 2 + Math.floor(Math.random() * 3),
              total: 10 + Math.floor(Math.random() * 8),
            },
      },
      facilityFaultDistribution: [
        { type: '设备老化', count: 12, percentage: 30 },
        { type: '参数异常', count: 10, percentage: 25 },
        { type: '堵塞故障', count: 8, percentage: 20 },
        { type: '动力故障', count: 6, percentage: 15 },
        { type: '其他', count: 4, percentage: 10 },
      ],
      waterImpactAssessment: [
        {
          region: '黄河流域',
          impactLevel: 'medium',
          affectedWaterBodies: ['黄河干流', '某支流'],
          riskScore: 58,
        },
        {
          region: '淮河流域',
          impactLevel: 'high',
          affectedWaterBodies: ['淮河', '某水库'],
          riskScore: 75,
        },
        {
          region: '长江流域',
          impactLevel: 'low',
          affectedWaterBodies: ['长江支流'],
          riskScore: 32,
        },
      ],
      optimizationSuggestions: [
        {
          id: 'sug_001',
          category: 'process',
          title: '升级好氧堆肥工艺',
          description: '建议将现有好氧堆肥设施升级为智能控温发酵系统，提高腐熟效率',
          expectedBenefit: '资源化利用率提升8-12%',
          priority: 'high',
        },
        {
          id: 'sug_002',
          category: 'transport',
          title: '优化运输路线',
          description: '根据有机肥销售网点分布，重新规划运输路线，减少空驶率',
          expectedBenefit: '运输成本降低15%',
          priority: 'medium',
        },
        {
          id: 'sug_003',
          category: 'capacity',
          title: '扩建处理设施',
          description: '针对部分养殖场处理能力不足问题，建议按30%预留量扩建',
          expectedBenefit: '减少超阈值预警60%',
          priority: 'high',
        },
      ],
    });
  }
  return reports;
};

export const reports = generateReports();

export const generateRealtimeData = (farmId: string): RealtimeData => {
  return {
    farmId,
    timestamp: Date.now(),
    wasteProduction: parseFloat((80 + Math.random() * 40).toFixed(2)),
    wasteTreated: parseFloat((70 + Math.random() * 35).toFixed(2)),
    fertilizerProduced: parseFloat((20 + Math.random() * 15).toFixed(2)),
    facilityRunningParams: {
      temperature: parseFloat((55 + Math.random() * 10).toFixed(1)),
      ph: parseFloat((6.5 + Math.random() * 1.5).toFixed(2)),
      oxygenLevel: parseFloat((8 + Math.random() * 4).toFixed(1)),
      powerConsumption: parseFloat((120 + Math.random() * 30).toFixed(1)),
    },
    waterMonitoring: {
      cod: parseFloat((35 + Math.random() * 20).toFixed(1)),
      ammoniaNitrogen: parseFloat((2 + Math.random() * 3).toFixed(2)),
      totalPhosphorus: parseFloat((0.3 + Math.random() * 0.4).toFixed(2)),
      dissolvedOxygen: parseFloat((5 + Math.random() * 3).toFixed(1)),
    },
  };
};

export const generateHistoryData = (farmId: string, days: number = 7) => {
  const dates: string[] = [];
  const data: RealtimeData[] = [];
  const now = Date.now();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    dates.push(date.toLocaleDateString('zh-CN'));
    data.push({
      ...generateRealtimeData(farmId),
      timestamp: now - i * 24 * 60 * 60 * 1000,
    });
  }

  return { dates, data };
};

export const generateFertilizerData = (farmId: string, months: number = 6) => {
  const dates: string[] = [];
  const production: number[] = [];
  const sales: number[] = [];
  const now = Date.now();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now - i * 30 * 24 * 60 * 60 * 1000);
    dates.push(date.toLocaleDateString('zh-CN', { month: 'long' }));
    const baseProd = 50 + Math.random() * 30;
    production.push(parseFloat(baseProd.toFixed(1)));
    sales.push(parseFloat((baseProd * (0.85 + Math.random() * 0.2)).toFixed(1)));
  }

  return { dates, production, sales };
};

export const generateTransportRecords = (farmId: string): TransportRecord[] => {
  const records: TransportRecord[] = [];
  const now = Date.now();
  const farm = farms.find((f) => f.id === farmId);
  const baseLat = farm?.coordinates[0] || 35;
  const baseLng = farm?.coordinates[1] || 115;

  for (let i = 0; i < 5; i++) {
    const isTransit = i === 0;
    records.push({
      id: `transport_${String(i + 1).padStart(3, '0')}`,
      vehicleId: `vehicle_${String(i + 1).padStart(3, '0')}`,
      vehiclePlate: `鲁A${String(10000 + i)}`,
      farmId,
      destination: ['济南', '青岛', '烟台', '潍坊', '临沂'][i],
      cargoType: i % 2 === 0 ? '有机肥' : '沼渣',
      cargoWeight: parseFloat((15 + Math.random() * 10).toFixed(1)),
      departureTime: now - (isTransit ? 2 : 24 + i * 4) * 60 * 60 * 1000,
      arrivalTime: isTransit ? undefined : now - (24 + i * 4 - 4) * 60 * 60 * 1000,
      status: isTransit ? 'transit' : i % 5 === 1 ? 'delayed' : 'arrived',
      route: [
        [baseLat, baseLng],
        [baseLat + (Math.random() - 0.5) * 2, baseLng + (Math.random() - 0.5) * 2],
        [baseLat + (Math.random() - 0.5) * 3, baseLng + (Math.random() - 0.5) * 3],
      ],
      currentPosition: [
        baseLat + (Math.random() - 0.5) * 1.5,
        baseLng + (Math.random() - 0.5) * 1.5,
      ],
    });
  }
  return records;
};

export const generateHeatmapData = (): HeatmapItem[] => {
  return provinces.slice(0, 31).map((province) => ({
    province: province.name,
    provinceCode: province.code,
    value: 50 + Math.random() * 45,
    farmCount: 50 + Math.floor(Math.random() * 200),
    avgUtilizationRate: parseFloat((70 + Math.random() * 25).toFixed(1)),
  }));
};

export const nationalMetrics: NationalMetrics = {
  resourceUtilizationRate: 82.5,
  facilityComplianceRate: 88.3,
  environmentalRiskIndex: 28.7,
  activeFarms: 12580,
};

export const generateForecastData = (farmId: string, planData?: LivestockPlan[]): ForecastData => {
  const farm = farms.find((f) => f.id === farmId);
  const baseline = farm?.livestockCount || 1000;
  const forecastDays = 90;
  const plannedLivestockCount: number[] = [];
  const predictedWasteProduction: number[] = [];
  const capacityGap: number[] = [];
  const treatmentCapacity = farm?.treatmentCapacity || 100;
  const wasteCoefficient =
    livestockTypes.find((t) => t.type === farm?.livestockType)?.wasteCoefficient || 5.2;

  const dailyWastePerHead = wasteCoefficient / 1000;

  if (planData && planData.length > 0) {
    const sorted = [...planData].sort((a, b) => a.month - b.month);
    for (let i = 0; i < forecastDays; i++) {
      const currentMonth = new Date().getMonth() + Math.floor(i / 30);
      const monthIndex = currentMonth % 12;
      const nextMonthIndex = (monthIndex + 1) % 12;
      const planCurrent = sorted.find((p) => p.month === monthIndex + 1);
      const planNext = sorted.find((p) => p.month === nextMonthIndex + 1);
      const countCurrent = planCurrent?.livestockCount || baseline;
      const countNext = planNext?.livestockCount || countCurrent;
      const dayInMonth = i % 30;
      const fraction = dayInMonth / 30;
      const interpolated = Math.round(countCurrent + (countNext - countCurrent) * fraction);
      plannedLivestockCount.push(interpolated);
      const predicted = parseFloat((interpolated * dailyWastePerHead).toFixed(2));
      predictedWasteProduction.push(predicted);
      capacityGap.push(parseFloat(Math.max(0, predicted - treatmentCapacity).toFixed(2)));
    }
  } else {
    for (let i = 0; i < forecastDays; i++) {
      const growthFactor = 1 + (i / forecastDays) * 0.3;
      const planned = Math.floor(baseline * growthFactor);
      plannedLivestockCount.push(planned);
      const predicted = parseFloat((planned * dailyWastePerHead).toFixed(2));
      predictedWasteProduction.push(predicted);
      capacityGap.push(parseFloat(Math.max(0, predicted - treatmentCapacity).toFixed(2)));
    }
  }

  const hasGap = capacityGap.some((g) => g > 0);
  const gapDays = capacityGap.filter((g) => g > 0).length;
  const maxGap = capacityGap.length > 0 ? Math.max(...capacityGap) : 0;

  const recommendations = hasGap
    ? [
        {
          id: 'rec_001',
          type: 'expansion' as const,
          title: '处理设施扩建方案',
          description:
            `建议新增一套膜处理系统，处理能力提升${Math.ceil(maxGap / treatmentCapacity * 100)}%，预计投资${Math.ceil(maxGap / treatmentCapacity * 300)}万元，建设周期3个月`,
          cost: Math.ceil(maxGap / treatmentCapacity * 300) * 10000,
          benefit: `处理能力提升${Math.ceil(maxGap / treatmentCapacity * 100)}%，消除未来90天${gapDays}天的处理缺口`,
          roi: parseFloat((1.5 + maxGap / treatmentCapacity * 3).toFixed(1)),
        },
        {
          id: 'rec_002',
          type: 'transport' as const,
          title: '粪污外运方案',
          description:
            `与周边有机肥厂签订外运协议，日均外运${Math.ceil(maxGap)}吨，运输成本约80元/吨`,
          cost: Math.ceil(maxGap * 80 * 365),
          benefit: '快速解决处理能力不足问题，无需固定资产投入',
          roi: parseFloat((1.2 + maxGap / treatmentCapacity * 2).toFixed(1)),
        },
      ]
    : [];

  return {
    farmId,
    forecastDate: Date.now(),
    forecastDays,
    baselineLivestockCount: baseline,
    plannedLivestockCount,
    predictedWasteProduction,
    treatmentCapacity,
    capacityGap,
    recommendations,
  };
};
