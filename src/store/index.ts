import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  Farm,
  Alert,
  ApprovalProcess,
  DiagnosticReport,
  RealtimeData,
  TransportRecord,
  HeatmapItem,
  NationalMetrics,
  ForecastData,
  LivestockPlan,
} from '../types';
import {
  initialUsers,
  farms as mockFarms,
  alerts as mockAlerts,
  approvals as mockApprovals,
  reports as mockReports,
  generateRealtimeData,
  generateHistoryData,
  generateFertilizerData,
  generateTransportRecords,
  generateHeatmapData,
  nationalMetrics as mockNationalMetrics,
  generateForecastData,
} from '../mock/data';

interface AppState {
  user: User | null;
  token: string | null;
  farms: Farm[];
  alerts: Alert[];
  approvals: ApprovalProcess[];
  reports: DiagnosticReport[];
  heatmapData: HeatmapItem[];
  nationalMetrics: NationalMetrics;
  realtimeDataMap: Record<string, RealtimeData>;
  selectedFarm: Farm | null;
  forecastData: Record<string, ForecastData>;

  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;

  getFarms: (filters?: {
    province?: string;
    scale?: string;
    processType?: string;
    riskLevel?: string;
  }) => Farm[];
  getFarmById: (id: string) => Farm | undefined;
  selectFarm: (farm: Farm | null) => void;
  getRealtimeData: (farmId: string) => RealtimeData;
  getHistoryData: (farmId: string, days?: number) => { dates: string[]; data: RealtimeData[] };
  getFertilizerData: (farmId: string) => { dates: string[]; production: number[]; sales: number[] };
  getTransportRecords: (farmId: string) => TransportRecord[];

  getAlerts: (filters?: {
    level?: string;
    status?: string;
    farmId?: string;
  }) => Alert[];
  processAlert: (alertId: string, action: string, remark: string) => void;
  escalateAlert: (alertId: string) => void;
  generateAutoAlerts: () => void;
  autoEscalateAlerts: () => void;

  getPendingApprovals: () => ApprovalProcess[];
  getAllApprovals: () => ApprovalProcess[];
  getApprovalById: (id: string) => ApprovalProcess | undefined;
  approveStage: (
    approvalId: string,
    stage: string,
    opinion: string,
    userId: string
  ) => void;
  rejectStage: (
    approvalId: string,
    stage: string,
    reason: string,
    userId: string
  ) => void;

  getReports: () => DiagnosticReport[];
  getReportById: (id: string) => DiagnosticReport | undefined;

  uploadPlan: (farmId: string, data: LivestockPlan[]) => {
    success: boolean;
    extractedData: LivestockPlan[];
  };
  calculateForecast: (farmId: string, planData?: LivestockPlan[]) => ForecastData;
  getForecast: (farmId: string) => ForecastData;

  simulateRealtimeUpdate: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      farms: mockFarms,
      alerts: mockAlerts,
      approvals: mockApprovals,
      reports: mockReports,
      heatmapData: generateHeatmapData(),
      nationalMetrics: mockNationalMetrics,
      realtimeDataMap: {},
      selectedFarm: null,
      forecastData: {},

      login: async (username, password) => {
        const user = initialUsers.find(
          (u) => u.username === username && password === `${username.split('_')[1]}123`
        );
        if (user) {
          const token = btoa(`${user.id}:${Date.now()}`);
          set({ user, token });
          return { success: true };
        }
        return { success: false, message: '用户名或密码错误' };
      },

      logout: () => {
        set({ user: null, token: null, selectedFarm: null });
      },

      hasPermission: (permission) => {
        const state = get();
        if (!state.user) return false;
        if (state.user.permissions.includes('all')) return true;
        return state.user.permissions.includes(permission);
      },

      getFarms: (filters) => {
        const state = get();
        let result = [...state.farms];

        const user = state.user;
        if (user) {
          if (user.role === 'provincial' && user.province) {
            result = result.filter((f) => f.province === user.province);
          } else if (user.role === 'municipal' && user.province && user.city) {
            result = result.filter((f) => f.province === user.province && f.city === user.city);
          } else if (user.role === 'county_epd' && user.province && user.city) {
            result = result.filter((f) => f.province === user.province && f.city === user.city);
          } else if (user.role === 'provincial_agri' && user.province) {
            result = result.filter((f) => f.province === user.province);
          } else if (user.role === 'farm_owner' && user.farmId) {
            result = result.filter((f) => f.id === user.farmId);
          }
        }

        if (filters?.province) {
          result = result.filter((f) => f.province === filters.province);
        }
        if (filters?.scale) {
          result = result.filter((f) => f.scale === filters.scale);
        }
        if (filters?.processType) {
          result = result.filter((f) => f.processType === filters.processType);
        }
        if (filters?.riskLevel) {
          result = result.filter((f) => f.riskLevel === filters.riskLevel);
        }

        return result;
      },

      getFarmById: (id) => {
        const state = get();
        const farm = state.farms.find((f) => f.id === id);
        if (!farm) return undefined;
        const user = state.user;
        if (!user) return farm;
        if (user.role === 'national') return farm;
        if (user.role === 'provincial' && user.province) return farm.province === user.province ? farm : undefined;
        if ((user.role === 'municipal' || user.role === 'county_epd') && user.province && user.city) return (farm.province === user.province && farm.city === user.city) ? farm : undefined;
        if (user.role === 'provincial_agri' && user.province) return farm.province === user.province ? farm : undefined;
        if (user.role === 'farm_owner' && user.farmId) return farm.id === user.farmId ? farm : undefined;
        return farm;
      },

      selectFarm: (farm) => {
        set({ selectedFarm: farm });
      },

      getRealtimeData: (farmId) => {
        const state = get();
        if (!state.realtimeDataMap[farmId]) {
          const data = generateRealtimeData(farmId);
          set({
            realtimeDataMap: { ...state.realtimeDataMap, [farmId]: data },
          });
          return data;
        }
        return state.realtimeDataMap[farmId];
      },

      getHistoryData: (farmId, days = 7) => {
        return generateHistoryData(farmId, days);
      },

      getFertilizerData: (farmId) => {
        return generateFertilizerData(farmId);
      },

      getTransportRecords: (farmId) => {
        return generateTransportRecords(farmId);
      },

      getAlerts: (filters) => {
        const state = get();
        let result = [...state.alerts];

        const user = state.user;
        if (user) {
          const visibleFarmIds = new Set(state.farms.filter((f) => {
            if (user.role === 'national') return true;
            if (user.role === 'provincial' && user.province) return f.province === user.province;
            if ((user.role === 'municipal' || user.role === 'county_epd') && user.province && user.city) return f.province === user.province && f.city === user.city;
            if (user.role === 'provincial_agri' && user.province) return f.province === user.province;
            if (user.role === 'farm_owner' && user.farmId) return f.id === user.farmId;
            return true;
          }).map((f) => f.id));
          result = result.filter((a) => visibleFarmIds.has(a.farmId));
        }

        if (filters?.level) {
          result = result.filter((a) => a.level === filters.level);
        }
        if (filters?.status) {
          result = result.filter((a) => a.status === filters.status);
        }
        if (filters?.farmId) {
          result = result.filter((a) => a.farmId === filters.farmId);
        }

        return result.sort((a, b) => b.createdAt - a.createdAt);
      },

      processAlert: (alertId, action, remark) => {
        const state = get();
        const user = state.user;
        const alerts = state.alerts.map((alert) => {
          if (alert.id === alertId) {
            return {
              ...alert,
              status: 'processing' as const,
              processingHistory: [
                ...alert.processingHistory,
                {
                  action,
                  operator: user?.name || 'unknown',
                  timestamp: Date.now(),
                  remark,
                },
              ],
            };
          }
          return alert;
        });
        set({ alerts });
      },

      escalateAlert: (alertId) => {
        const state = get();
        const alert = state.alerts.find((a) => a.id === alertId);
        if (!alert) return;

        const alerts = state.alerts.map((a) => {
          if (a.id === alertId) {
            return {
              ...a,
              level: 'level2' as const,
              status: 'escalated' as const,
              processingHistory: [
                ...a.processingHistory,
                {
                  action: '升级二级预警',
                  operator: 'system',
                  timestamp: Date.now(),
                  remark: '5天内未改善，自动升级',
                },
              ],
            };
          }
          return a;
        });

        const newApproval: ApprovalProcess = {
          id: `approval_${String(state.approvals.length + 1).padStart(3, '0')}`,
          alertId,
          farmId: alert.farmId,
          adjustmentType: 'process_change',
          proposedPlan: '建议升级处理设施或限制生产规模',
          currentStage: 'farm_owner',
          stages: [
            {
              id: 'stage_1',
              stageName: 'farm_owner',
              status: 'pending',
            },
            {
              id: 'stage_2',
              stageName: 'county_epd',
              status: 'pending',
            },
            {
              id: 'stage_3',
              stageName: 'provincial_agri',
              status: 'pending',
            },
          ],
          createdAt: Date.now(),
        };

        set({ alerts, approvals: [...state.approvals, newApproval] });
      },

      generateAutoAlerts: () => {
        const state = get();
        const now = Date.now();
        const newAlerts: Alert[] = [];
        const existingPendingFarmIds = new Set(
          state.alerts
            .filter((a) => a.status === 'pending' || a.status === 'processing')
            .map((a) => a.farmId)
        );

        state.farms.forEach((farm) => {
          if (existingPendingFarmIds.has(farm.id)) return;

          const complianceDays = farm.consecutiveLowComplianceDays || 0;
          const riskDays = farm.consecutiveRiskRiseDays || 0;
          const shouldAlertFacility = complianceDays >= 3;
          const shouldAlertEnvironment = riskDays >= 3;

          if (shouldAlertFacility || shouldAlertEnvironment) {
            const type = shouldAlertFacility ? 'facility' : 'environment';
            const durationDays = shouldAlertFacility ? complianceDays : riskDays;
            const triggerCondition = shouldAlertFacility
              ? `连续${complianceDays}天设施达标率低于70%`
              : `连续${riskDays}天环境风险指数持续上升超阈值`;
            const triggerValue = shouldAlertFacility
              ? parseFloat(farm.facilityComplianceRate.toFixed(1))
              : parseFloat(farm.environmentalRiskIndex.toFixed(1));
            const threshold = shouldAlertFacility ? 70 : 60;

            newAlerts.push({
              id: `alert_auto_${farm.id}_${now}`,
              farmId: farm.id,
              farmName: farm.name,
              level: 'level1',
              type,
              triggerCondition,
              triggerValue,
              threshold,
              durationDays,
              status: 'pending',
              createdAt: now,
              notifiedUsers: ['user_003', 'user_004'],
              processingHistory: [
                {
                  action: '预警生成',
                  operator: 'system',
                  timestamp: now,
                  remark: `自动检测：${triggerCondition}，当前值${triggerValue}`,
                },
              ],
            });
          }
        });

        if (newAlerts.length > 0) {
          set({ alerts: [...newAlerts, ...state.alerts] });
        }
      },

      autoEscalateAlerts: () => {
        const state = get();
        const now = Date.now();
        const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
        let alertsChanged = false;
        let newApprovals: ApprovalProcess[] = [];

        const updatedAlerts = state.alerts.map((alert) => {
          if (alert.level !== 'level1' || alert.status !== 'pending') return alert;
          if (now - alert.createdAt < fiveDaysMs) return alert;

          const farm = state.farms.find((f) => f.id === alert.farmId);
          const stillBelowThreshold = farm
            ? (alert.type === 'facility' && farm.facilityComplianceRate < 70)
              || (alert.type === 'environment' && farm.environmentalRiskIndex > 60)
              || (alert.type === 'comprehensive' && (farm.facilityComplianceRate < 70 || farm.environmentalRiskIndex > 60))
            : true;

          if (!stillBelowThreshold) {
            return {
              ...alert,
              status: 'resolved' as const,
              processingHistory: [
                ...alert.processingHistory,
                {
                  action: '自动恢复',
                  operator: 'system',
                  timestamp: now,
                  remark: '指标已恢复至正常范围，自动解除预警',
                },
              ],
            };
          }

          alertsChanged = true;
          newApprovals.push({
            id: `approval_auto_${alert.farmId}_${now}`,
            alertId: alert.id,
            farmId: alert.farmId,
            adjustmentType: alert.type === 'facility' ? 'process_change' : 'production_limit',
            proposedPlan: '5天整改期满未改善，建议调整处理工艺或限制生产规模',
            currentStage: 'farm_owner',
            stages: [
              { id: 'stage_1', stageName: 'farm_owner', status: 'pending' },
              { id: 'stage_2', stageName: 'county_epd', status: 'pending' },
              { id: 'stage_3', stageName: 'provincial_agri', status: 'pending' },
            ],
            createdAt: now,
          });

          return {
            ...alert,
            level: 'level2' as const,
            status: 'escalated' as const,
            processingHistory: [
              ...alert.processingHistory,
              {
                action: '自动升级二级预警',
                operator: 'system',
                timestamp: now,
                remark: '5天整改期满未改善，系统自动升级为二级预警并启动三级审批流程',
              },
            ],
          };
        });

        if (alertsChanged) {
          set({
            alerts: updatedAlerts,
            approvals: [...state.approvals, ...newApprovals],
          });
        }
      },

      getPendingApprovals: () => {
        const state = get();
        const user = state.user;
        if (!user) return [];

        const visibleFarmIds = new Set(state.farms.filter((f) => {
          if (user.role === 'national') return true;
          if (user.role === 'provincial' && user.province) return f.province === user.province;
          if ((user.role === 'municipal' || user.role === 'county_epd') && user.province && user.city) return f.province === user.province && f.city === user.city;
          if (user.role === 'provincial_agri' && user.province) return f.province === user.province;
          if (user.role === 'farm_owner' && user.farmId) return f.id === user.farmId;
          return true;
        }).map((f) => f.id));

        let result = state.approvals.filter(
          (a) => a.currentStage !== 'completed' && a.currentStage !== 'rejected'
            && visibleFarmIds.has(a.farmId)
        );

        if (user.role === 'farm_owner') {
          result = result.filter((a) => a.currentStage === 'farm_owner');
        } else if (user.role === 'county_epd') {
          result = result.filter((a) => a.currentStage === 'county_epd');
        } else if (user.role === 'provincial_agri') {
          result = result.filter((a) => a.currentStage === 'provincial_agri');
        }

        return result;
      },

      getAllApprovals: () => {
        const state = get();
        const user = state.user;
        if (!user) return [];

        const visibleFarmIds = new Set(state.farms.filter((f) => {
          if (user.role === 'national') return true;
          if (user.role === 'provincial' && user.province) return f.province === user.province;
          if ((user.role === 'municipal' || user.role === 'county_epd') && user.province && user.city) return f.province === user.province && f.city === user.city;
          if (user.role === 'provincial_agri' && user.province) return f.province === user.province;
          if (user.role === 'farm_owner' && user.farmId) return f.id === user.farmId;
          return true;
        }).map((f) => f.id));

        return state.approvals.filter((a) => visibleFarmIds.has(a.farmId));
      },

      getApprovalById: (id) => {
        const state = get();
        const approval = state.approvals.find((a) => a.id === id);
        if (!approval) return undefined;
        const user = state.user;
        if (!user) return approval;
        const visibleFarmIds = new Set(state.farms.filter((f) => {
          if (user.role === 'national') return true;
          if (user.role === 'provincial' && user.province) return f.province === user.province;
          if ((user.role === 'municipal' || user.role === 'county_epd') && user.province && user.city) return f.province === user.province && f.city === user.city;
          if (user.role === 'provincial_agri' && user.province) return f.province === user.province;
          if (user.role === 'farm_owner' && user.farmId) return f.id === user.farmId;
          return true;
        }).map((f) => f.id));
        return visibleFarmIds.has(approval.farmId) ? approval : undefined;
      },

      approveStage: (approvalId, stage, opinion, userId) => {
        const state = get();
        const approvals = state.approvals.map((approval) => {
          if (approval.id === approvalId) {
            const stages = approval.stages.map((s) => {
              if (s.stageName === stage) {
                return {
                  ...s,
                  status: 'approved' as const,
                  opinion,
                  approverId: userId,
                  approvedAt: Date.now(),
                };
              }
              return s;
            });

            const stageOrder: string[] = ['farm_owner', 'county_epd', 'provincial_agri'];
            const currentIndex = stageOrder.indexOf(stage);
            const nextStage =
              currentIndex < stageOrder.length - 1
                ? (stageOrder[currentIndex + 1] as ApprovalProcess['currentStage'])
                : 'completed';

            return {
              ...approval,
              stages,
              currentStage: nextStage,
              completedAt: nextStage === 'completed' ? Date.now() : undefined,
            };
          }
          return approval;
        });

        set({ approvals });
      },

      rejectStage: (approvalId, stage, reason, userId) => {
        const state = get();
        const approvals = state.approvals.map((approval) => {
          if (approval.id === approvalId) {
            const stages = approval.stages.map((s) => {
              if (s.stageName === stage) {
                return {
                  ...s,
                  status: 'rejected' as const,
                  opinion: reason,
                  approverId: userId,
                  approvedAt: Date.now(),
                };
              }
              return s;
            });

            return {
              ...approval,
              stages,
              currentStage: 'rejected' as const,
            };
          }
          return approval;
        });

        set({ approvals });
      },

      getReports: () => {
        const state = get();
        const user = state.user;
        let result = [...state.reports];

        if (user && user.role !== 'national') {
          if (user.role === 'provincial' || user.role === 'provincial_agri') {
            result = result.filter((r) =>
              r.scope.type === 'national' || r.scope.type === 'province'
            );
          } else if (user.role === 'municipal' || user.role === 'county_epd') {
            result = result.filter((r) =>
              r.scope.type === 'national' || r.scope.type === 'province' || r.scope.type === 'city'
            );
          } else if (user.role === 'farm_owner') {
            result = result.filter((r) =>
              r.scope.type === 'national' || r.scope.type === 'province' || r.scope.type === 'city'
            );
          }
        }

        return result.sort((a, b) => b.endDate - a.endDate);
      },

      getReportById: (id) => {
        const state = get();
        const report = state.reports.find((r) => r.id === id);
        if (!report) return undefined;
        const user = state.user;
        if (!user || user.role === 'national') return report;
        if (user.role === 'provincial' || user.role === 'provincial_agri') {
          return report.scope.type === 'national' || report.scope.type === 'province' ? report : undefined;
        }
        return report;
      },

      uploadPlan: (farmId: string, data: LivestockPlan[]) => {
        const state = get();
        const newForecastData = { ...state.forecastData };
        newForecastData[farmId] = generateForecastData(farmId, data);
        set({ forecastData: newForecastData });
        return {
          success: true,
          extractedData: data,
        };
      },

      calculateForecast: (farmId, planData) => {
        const forecast = generateForecastData(farmId, planData);
        set((state) => ({
          forecastData: { ...state.forecastData, [farmId]: forecast },
        }));
        return forecast;
      },

      getForecast: (farmId) => {
        const state = get();
        if (state.forecastData[farmId]) {
          return state.forecastData[farmId];
        }
        return get().calculateForecast(farmId);
      },

      simulateRealtimeUpdate: () => {
        const state = get();
        const newDataMap: Record<string, RealtimeData> = {};

        const updatedFarms = state.farms.map((farm) => {
          const prevCompliance = farm.facilityComplianceRate;
          const prevRisk = farm.environmentalRiskIndex;
          const newCompliance = Math.max(30, Math.min(100, prevCompliance + (Math.random() - 0.55) * 5));
          const newRisk = Math.max(5, Math.min(95, prevRisk + (Math.random() - 0.45) * 4));
          const newUtilRate = Math.max(30, Math.min(100, farm.resourceUtilizationRate + (Math.random() - 0.5) * 3));

          const complianceBelowThreshold = newCompliance < 70;
          const riskAboveThreshold = newRisk > 60;

          const prevComplianceDays = farm.consecutiveLowComplianceDays || 0;
          const prevRiskDays = farm.consecutiveRiskRiseDays || 0;

          return {
            ...farm,
            resourceUtilizationRate: parseFloat(newUtilRate.toFixed(1)),
            facilityComplianceRate: parseFloat(newCompliance.toFixed(1)),
            environmentalRiskIndex: parseFloat(newRisk.toFixed(1)),
            consecutiveLowComplianceDays: complianceBelowThreshold ? prevComplianceDays + 1 : 0,
            consecutiveRiskRiseDays: riskAboveThreshold ? prevRiskDays + 1 : 0,
            riskLevel: (complianceBelowThreshold && prevComplianceDays >= 2) || (riskAboveThreshold && prevRiskDays >= 2)
              ? 'danger' as const
              : complianceBelowThreshold || riskAboveThreshold
              ? 'warning' as const
              : 'normal' as const,
          };
        });

        updatedFarms.slice(0, 10).forEach((farm) => {
          newDataMap[farm.id] = generateRealtimeData(farm.id);
        });

        set({
          realtimeDataMap: { ...state.realtimeDataMap, ...newDataMap },
          farms: updatedFarms,
        });

        get().generateAutoAlerts();
        get().autoEscalateAlerts();
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
