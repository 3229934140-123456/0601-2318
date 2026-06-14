export type UserRole =
  | 'national'
  | 'provincial'
  | 'municipal'
  | 'county_epd'
  | 'provincial_agri'
  | 'farm_owner';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  province?: string;
  city?: string;
  farmId?: string;
  permissions: string[];
  enabled?: boolean;
}

export type FarmScale = 'small' | 'medium' | 'large';
export type RiskLevel = 'normal' | 'warning' | 'danger';
export type FarmStatus = 'active' | 'suspended' | 'closed';

export interface Farm {
  id: string;
  name: string;
  province: string;
  city: string;
  district: string;
  address: string;
  scale: FarmScale;
  processType: string;
  livestockType: string;
  livestockCount: number;
  dailyWasteProduction: number;
  treatmentCapacity: number;
  organicFertilizerCapacity: number;
  coordinates: [number, number];
  riskLevel: RiskLevel;
  resourceUtilizationRate: number;
  facilityComplianceRate: number;
  environmentalRiskIndex: number;
  status: FarmStatus;
  consecutiveLowComplianceDays?: number;
  consecutiveRiskRiseDays?: number;
}

export interface FacilityRunningParams {
  temperature: number;
  ph: number;
  oxygenLevel: number;
  powerConsumption: number;
}

export interface WaterMonitoring {
  cod: number;
  ammoniaNitrogen: number;
  totalPhosphorus: number;
  dissolvedOxygen: number;
}

export interface RealtimeData {
  farmId: string;
  timestamp: number;
  wasteProduction: number;
  wasteTreated: number;
  fertilizerProduced: number;
  facilityRunningParams: FacilityRunningParams;
  waterMonitoring: WaterMonitoring;
}

export type AlertLevel = 'level1' | 'level2';
export type AlertType = 'facility' | 'environment' | 'comprehensive';
export type AlertStatus = 'pending' | 'processing' | 'resolved' | 'escalated';

export interface ProcessingRecord {
  action: string;
  operator: string;
  timestamp: number;
  remark: string;
}

export interface Alert {
  id: string;
  farmId: string;
  farmName: string;
  level: AlertLevel;
  type: AlertType;
  triggerCondition: string;
  triggerValue: number;
  threshold: number;
  durationDays: number;
  status: AlertStatus;
  createdAt: number;
  notifiedUsers: string[];
  processingHistory: ProcessingRecord[];
}

export type AdjustmentType = 'process_change' | 'production_limit';
export type ApprovalStageName =
  | 'farm_owner'
  | 'county_epd'
  | 'provincial_agri'
  | 'completed'
  | 'rejected';

export interface ApprovalStage {
  id: string;
  stageName: ApprovalStageName;
  approverId?: string;
  status: 'pending' | 'approved' | 'rejected';
  opinion?: string;
  approvedAt?: number;
}

export interface ApprovalProcess {
  id: string;
  alertId: string;
  farmId: string;
  alertLevel?: AlertLevel;
  adjustmentType: AdjustmentType;
  proposedPlan: string;
  currentStage: ApprovalStageName;
  stages: ApprovalStage[];
  createdAt: number;
  completedAt?: number;
}

export type ReportScopeType = 'national' | 'province' | 'city';

export interface DiagnosticReport {
  id: string;
  period: 'weekly';
  startDate: number;
  endDate: number;
  scope: {
    type: ReportScopeType;
    region?: string;
  };
  summary: {
    resourceUtilizationRate: {
      current: number;
      yoy: number;
      mom: number;
    };
    facilityComplianceRate: {
      current: number;
      yoy: number;
      mom: number;
    };
    alertCount: {
      level1: number;
      level2: number;
      total: number;
    };
  };
  facilityFaultDistribution: FaultTypeItem[];
  waterImpactAssessment: WaterImpactItem[];
  optimizationSuggestions: OptimizationSuggestion[];
}

export interface FaultTypeItem {
  type: string;
  count: number;
  percentage: number;
}

export interface WaterImpactItem {
  region: string;
  impactLevel: 'low' | 'medium' | 'high';
  affectedWaterBodies: string[];
  riskScore: number;
}

export interface OptimizationSuggestion {
  id: string;
  category: 'process' | 'transport' | 'capacity';
  title: string;
  description: string;
  expectedBenefit: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TransportRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  farmId: string;
  destination: string;
  cargoType: string;
  cargoWeight: number;
  departureTime: number;
  arrivalTime?: number;
  status: 'transit' | 'arrived' | 'delayed';
  route: [number, number][];
  currentPosition: [number, number];
}

export interface ForecastData {
  farmId: string;
  forecastDate: number;
  forecastDays: number;
  baselineLivestockCount: number;
  plannedLivestockCount: number[];
  predictedWasteProduction: number[];
  treatmentCapacity: number;
  capacityGap: number[];
  recommendations: PlanRecommendation[];
}

export interface PlanRecommendation {
  id: string;
  type: 'expansion' | 'transport';
  title: string;
  description: string;
  cost: number;
  benefit: string;
  roi: number;
}

export interface LivestockPlan {
  month: number;
  livestockCount: number;
  notes?: string;
}

export interface Province {
  code: string;
  name: string;
}

export interface ProcessType {
  code: string;
  name: string;
  efficiency: number;
}

export interface LivestockType {
  type: string;
  name: string;
  wasteCoefficient: number;
}

export interface HeatmapItem {
  province: string;
  provinceCode: string;
  value: number;
  farmCount: number;
  avgUtilizationRate: number;
}

export interface NationalMetrics {
  resourceUtilizationRate: number;
  facilityComplianceRate: number;
  environmentalRiskIndex: number;
  activeFarms: number;
}
