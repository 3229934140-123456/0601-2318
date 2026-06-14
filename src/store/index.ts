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

  getPendingApprovals: () => ApprovalProcess[];
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
  calculateForecast: (farmId: string) => ForecastData;
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

        if (state.user?.role === 'provincial' && state.user.province) {
          result = result.filter((f) => f.province === state.user!.province);
        } else if (state.user?.role === 'farm_owner' && state.user.farmId) {
          result = result.filter((f) => f.id === state.user!.farmId);
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
        return get().farms.find((f) => f.id === id);
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
        let result = [...get().alerts];

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

      getPendingApprovals: () => {
        const state = get();
        const user = state.user;
        if (!user) return [];

        let result = state.approvals.filter(
          (a) => a.currentStage !== 'completed' && a.currentStage !== 'rejected'
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

      getApprovalById: (id) => {
        return get().approvals.find((a) => a.id === id);
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
        return [...get().reports].sort((a, b) => b.endDate - a.endDate);
      },

      getReportById: (id) => {
        return get().reports.find((r) => r.id === id);
      },

      uploadPlan: (farmId, data) => {
        return {
          success: true,
          extractedData: data,
        };
      },

      calculateForecast: (farmId) => {
        const forecast = generateForecastData(farmId);
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

        state.farms.slice(0, 10).forEach((farm) => {
          newDataMap[farm.id] = generateRealtimeData(farm.id);
        });

        set({
          realtimeDataMap: { ...state.realtimeDataMap, ...newDataMap },
        });
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
