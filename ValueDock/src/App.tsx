import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { toast, Toaster } from "sonner@2.0.3";
import {
  Calculator,
  Wrench,
  TrendingUp,
  BarChart3,
  Share2,
  Calendar,
  LogOut,
  UserCog,
  RotateCcw,
  Menu,
  FileText,
  AlertCircle,
  Target,
  Users,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { InputsScreenTable } from "./components/InputsScreenTable";
import { ImplementationScreen } from "./components/ImplementationScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { ScenarioScreen } from "./components/ScenarioScreen";
import { ExportScreen } from "./components/ExportScreen";
import { TimelineScreen } from "./components/TimelineScreen";
import { LoginScreen } from "./components/LoginScreen";
import { AdminDashboard } from "./components/AdminDashboard";
import { PresentationScreen } from "./components/PresentationScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { DebugConsole } from "./components/DebugConsole";
import { FathomDiagnostic } from "./components/FathomDiagnostic";
import { TenantOrgContextSwitcher } from "./components/TenantOrgContextSwitcher";
import { DeleteConfirmationDialog } from "./components/DeleteConfirmationDialog";
import { StandaloneWorkflow } from "./components/workflow-module";
import { OpportunityMatrix } from "./components/OpportunityMatrixNPV";
import { RiskFactorLiveTest } from "./components/RiskFactorLiveTest";
import MeetingsPanel from "./screens/MeetingsPanel";
import {
  InputData,
  generateCashflowData,
  defaultInputData,
  mergeWithDefaults,
  formatCurrency,
} from "./components/utils/calculations";
import { parseDataFromUrl } from "./components/utils/exportUtils";
import {
  getSession,
  signOut,
  UserProfile,
  hasRole,
  apiCall,
} from "./utils/auth";
import { projectId } from "./utils/supabase/info";
import { asArray, ensureArray, mustArray, normalizeArrayFields, debugArray, assertArray, validateArrayFieldsNotCounts, selectedIdsFromProcesses } from "./utils/arrayHelpers";
import { scheduleROI, resetROIController, isROIReady } from "./utils/roiController";
import logo from "figma:asset/5b7eb6ed47627fe252f3c20b44435ea7f1bf8f1a.png";

export default function App() {
  const [currentTab, setCurrentTab] = useState("inputs");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] =
    useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false); // Track when data is being loaded from backend
  const [initError, setInitError] = useState<string | null>(
    null,
  );
  const [initSuccess, setInitSuccess] = useState(false);
  const [tenantName, setTenantName] = useState<string>("");
  const [organizationName, setOrganizationName] =
    useState<string>("");

  // Workflow editor state
  const [showWorkflowEditor, setShowWorkflowEditor] =
    useState(false);
  const [workflowProcessId, setWorkflowProcessId] =
    useState<string>("");
  const [workflowProcessName, setWorkflowProcessName] =
    useState<string>("");

  // Context switcher state for multi-tenant/org admins
  const [selectedContextTenantId, setSelectedContextTenantId] =
    useState<string | null>(() => {
      const saved = localStorage.getItem(
        "valuedock_selected_tenant_id",
      );
      return saved || null;
    });
  const [selectedContextOrgId, setSelectedContextOrgId] =
    useState<string | null>(() => {
      const saved = localStorage.getItem(
        "valuedock_selected_org_id",
      );
      return saved || null;
    });
  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<
    any[]
  >([]);
  const [inputData, setInputData] = useState<InputData>(() => {
    // Try to load data from URL parameters first
    const urlData = parseDataFromUrl();
    if (urlData) {
      const merged = mergeWithDefaults(urlData);
      // Ensure arrays are actually arrays, not counts
      const normalized = {
        ...merged,
        groups: mustArray('URL.groups', merged.groups),
        processes: mustArray('URL.processes', merged.processes).map((p) => ({
          ...p,
          selected: false,
        })),
      };
      return normalized;
    }
    // NO DUMMY DATA - start with EMPTY arrays
    // Backend MUST load actual data or app will error
    return {
      ...defaultInputData,
      groups: [],
      processes: [],
    };
  });

  // Process filtering state - shared between ResultsScreen and PresentationScreen
  // Default: ALL processes selected automatically for every org
  const [selectedProcessIds, setSelectedProcessIds] = useState<
    string[]
  >([]);

  // Hard costs only toggle state - shared between ResultsScreen and PresentationScreen
  const [hardCostsOnlyMode, setHardCostsOnlyMode] =
    useState(false);

  // Time horizon for financial calculations (in months) - shared across screens
  const [timeHorizonMonths, setTimeHorizonMonths] =
    useState(36); // Default 3 years

  // Cost classification for the current organization
  const [costClassification, setCostClassification] =
    useState<any>(null);

  // Readiness flag - only calculate ROI when data is actually loaded
  const [dataReadyForROI, setDataReadyForROI] = useState(false);
  
  // Add flag to track if cost classification has been loaded
  const [costClassificationLoaded, setCostClassificationLoaded] = useState(false);
  
  // Debounce ref to prevent rapid ROI recalculations
  const roiDebounceRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // ROI results state - updated by ROI controller only
  const [results, setResults] = useState({
    annualNetSavings: 0,
    totalCost: 0,
    roi: 0,
    paybackPeriodMonths: 0,
    npv: 0,
    totalFTEsFreed: 0,
    processResults: [],
  });

  // Auto-select all processes whenever processes change
  // This is independent of the process selection in the Inputs screen (which is for deletion only)
  // Only run this after initial data has loaded to prevent calculating ROI with empty data
  useEffect(() => {
    // Skip if we're currently loading data or if this is the initial empty state
    if (dataLoading) return;

    // Clear any existing debounce timer
    if (roiDebounceRef.current) {
      clearTimeout(roiDebounceRef.current);
    }

    // Debounce the state update to prevent rapid re-fires
    roiDebounceRef.current = setTimeout(() => {
      try {
        // Use mustArray to THROW if processes is not an array
        const processes = mustArray('autoSelectProcesses', inputData.processes);
        const allProcessIds = processes
          .filter(p => p && typeof p === 'object' && 'id' in p)
          .map((p) => p.id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0);
        
        console.log('[autoSelectProcesses] Setting selectedProcessIds:', {
          count: allProcessIds.length,
          isArray: Array.isArray(allProcessIds),
        });
        
        // ✅ Set selectedProcessIds with ARRAY of IDs, not a count
        setSelectedProcessIds(allProcessIds);
        
        // Mark data as ready for ROI calculation
        // ROI will be triggered by the useEffect that watches these flags
        setDataReadyForROI(true);
      } catch (error) {
        console.error('[autoSelectProcesses] ERROR:', error);
        setDataReadyForROI(false);
        throw error;
      }
    }, 0); // Use 0ms to defer to next event loop tick (prevents micro-task echo)

    return () => {
      if (roiDebounceRef.current) {
        clearTimeout(roiDebounceRef.current);
      }
    };
  }, [inputData.processes, dataLoading]);

  // Create filtered data based on selected processes
  const filteredData = React.useMemo(() => {
    try {
      // Use mustArray to THROW if not arrays - NO FALLBACKS
      const processes = mustArray('filteredData.processes', inputData.processes);
      const selectedIds = mustArray<string>('filteredData.selectedIds', selectedProcessIds);
      const groups = mustArray('filteredData.groups', inputData.groups);
      
      return {
        ...inputData,
        groups,
        processes: processes.map((p) => ({
          ...p,
          selected: selectedIds.includes(p.id),
        })),
      };
    } catch (error) {
      console.error('[filteredData] ERROR:', error);
      throw error;
    }
  }, [inputData, selectedProcessIds]);

  // ROI calculation effect - routes through centralized controller
  useEffect(() => {
    const controllerState = {
      processCount: inputData.processes.length,
      selectedCount: selectedProcessIds.length,
      costClassificationLoaded,
      dataReadyForROI,
      costClassification,
      orgId: selectedContextOrgId || userProfile?.organizationId,
      hardCosts: costClassification?.hardCosts,
      softCosts: costClassification?.softCosts,
    };

    // Only attempt to calculate if ready
    if (isROIReady(controllerState)) {
      // scheduleROI returns results or null if blocked
      // NOTE: calculateFn parameter removed - now uses ROI service internally
      const calculatedResults = scheduleROI(
        'data or classification changed',
        controllerState,
        filteredData,
        timeHorizonMonths,
      );
      
      // Update state with results (only if not null)
      if (calculatedResults) {
        setResults(calculatedResults);
      }
    } else {
      console.log("[App] 🚫 ROI not ready yet", {
        dataReadyForROI,
        costClassificationLoaded,
        processCount: inputData.processes.length,
      });
    }
  }, [
    filteredData,
    costClassification,
    timeHorizonMonths,
    dataReadyForROI,
    costClassificationLoaded,
    selectedProcessIds.length,
  ]);

  const cashflowData = React.useMemo(() => {
    // Only generate cashflow data if cost classification is loaded
    if (!costClassificationLoaded || !costClassification) {
      console.log('[App] 🚫 Cashflow data blocked - cost classification not loaded');
      return [];
    }
    
    console.log('[App] 📊 Generating cashflow data with cost classification');
    return generateCashflowData(filteredData, 24, undefined, costClassification);
  }, [filteredData, costClassification, costClassificationLoaded]);

  const handleInputChange = (data: InputData) => {
    console.log("[App] ===== DATA CHANGE DETECTED =====");
    
    try {
      // ✅ CRITICAL: Validate arrays are arrays, not counts - THROWS on error
      validateArrayFieldsNotCounts(data, ['groups', 'processes'], 'handleInputChange before setState');
      
      // ✅ CRITICAL: Force array validation with mustArray - THROWS on error
      const validatedData = {
        ...data,
        groups: mustArray('handleInputChange.groups', data.groups),
        processes: mustArray('handleInputChange.processes', data.processes),
      };

      console.log("[App] New data (counts for debugging):", {
        processCount: validatedData.processes.length,
        groupCount: validatedData.groups.length,
        processes: validatedData.processes.map((p) => ({
          id: p.id,
          name: p.name,
          fteCount: p.fteCount,
          taskVolume: p.taskVolume,
        })),
      });
      console.log("[App] ====================================");

      setInputData(validatedData);

      // Save to localStorage whenever data changes (browser backup)
      try {
        localStorage.setItem(
          "valuedock_data",
          JSON.stringify(validatedData),
        );
      } catch (error) {
        console.error(
          "Error saving data to localStorage:",
          error,
        );
      }

      // Also save to Supabase backend if user is authenticated
      if (isAuthenticated && userProfile) {
        saveDataToBackend(validatedData).catch((err) => {
          console.error("Backend save error:", err);
        });
      }
    } catch (error) {
      console.error("[handleInputChange] VALIDATION ERROR:", error);
      throw error;
    }
  };

  const handleWorkflowClick = (
    processId: string,
    processName: string,
  ) => {
    setWorkflowProcessId(processId);
    setWorkflowProcessName(processName);
    setShowWorkflowEditor(true);
  };

  const handleWorkflowBack = () => {
    setShowWorkflowEditor(false);
    setWorkflowProcessId("");
    setWorkflowProcessName("");
  };

  const handleCalculate = () => {
    setCurrentTab("results");
    // toast.success('ROI calculated successfully!');
  };

  const handleDownloadPDF = () => {
    toast.info(
      "PDF download functionality would be implemented here",
    );
  };

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      // Silently handle clipboard permission errors - user already gets toast message
      toast.error(
        "Failed to copy link - clipboard access denied",
      );
    }
  };

  // State for Clear Data confirmation dialog
  const [showClearDataDialog, setShowClearDataDialog] =
    useState(false);

  const handleSaveSnapshot = async () => {
    try {
      const snapshot = {
        data: inputData,
        timestamp: new Date().toISOString(),
        userName:
          userProfile?.name || userProfile?.email || "Unknown",
        userId: userProfile?.id,
      };

      const response = await apiCall("/snapshots/save", {
        method: "POST",
        body: snapshot,
      });

      if (response.success) {
        // toast.success('Snapshot saved successfully!');
      } else {
        console.error("Failed to save snapshot");
        // toast.error('Failed to save snapshot');
      }
    } catch (error) {
      console.error("Save snapshot error:", error);
      // toast.error('Failed to save snapshot');
    }
  };

  const handleClearAllData = () => {
    // Check if user is admin
    if (
      !hasRole(userProfile, [
        "master_admin",
        "tenant_admin",
        "org_admin",
      ])
    ) {
      console.error("Only administrators can clear all data");
      // toast.error('Only administrators can clear all data');
      return;
    }

    // Open confirmation dialog
    setShowClearDataDialog(true);
  };

  // Confirm and execute clear data (organization-scoped)
  const confirmClearData = async () => {
    try {
      // Determine which organization's data to clear
      const orgId =
        selectedContextOrgId || userProfile?.organizationId;

      // Clear from backend (now creates backup automatically)
      const endpoint = orgId
        ? `/data/clear?organizationId=${orgId}`
        : "/data/clear";
      await apiCall(endpoint, {
        method: "DELETE",
      });

      // Clear localStorage
      localStorage.removeItem("valuedock_data");
      localStorage.removeItem("valuedock_snapshot");
      localStorage.removeItem("valuedock_snapshot_timestamp");

      // Reset to default data
      setInputData(defaultInputData);
      // Note: selectedProcessIds will be auto-updated by useEffect when inputData changes

      // Close dialog
      setShowClearDataDialog(false);

      const orgName = allOrganizations.find(
        (o) => o.id === orgId,
      )?.name;
      // toast.success(orgName
      //   ? `Data for ${orgName} cleared and backed up successfully`
      //   : 'All data cleared and backed up successfully');
      setCurrentTab("inputs");
    } catch (error) {
      console.error("Error clearing data:", error);
      // toast.error('Failed to clear data');
    }
  };

  const handleRestoreSnapshot = async () => {
    try {
      // Only admins can restore
      if (
        !hasRole(userProfile, [
          "master_admin",
          "tenant_admin",
          "org_admin",
        ])
      ) {
        console.error(
          "Only administrators can restore snapshots",
        );
        // toast.error('Only administrators can restore snapshots');
        return;
      }

      const response = await apiCall("/snapshots/list");

      if (response.snapshots && response.snapshots.length > 0) {
        // For now, restore the most recent snapshot
        // In a full implementation, you'd show a list to choose from
        const latestSnapshot = response.snapshots[0];
        setInputData(latestSnapshot.data);
        // toast.success(`Snapshot restored from ${new Date(latestSnapshot.timestamp).toLocaleString()}`);
      } else {
        toast.info("No snapshots available to restore");
      }
    } catch (error) {
      console.error("Restore snapshot error:", error);
      // toast.error('Failed to restore snapshot');
    }
  };

  // Context switcher handlers - with data reload
  const handleContextTenantChange = async (
    tenantId: string | null,
  ) => {
    setSelectedContextTenantId(tenantId);
    if (tenantId) {
      localStorage.setItem(
        "valuedock_selected_tenant_id",
        tenantId,
      );
    } else {
      localStorage.removeItem("valuedock_selected_tenant_id");
    }

    // Reload data for new context
    await loadDataForCurrentContext(
      tenantId,
      selectedContextOrgId,
    );
  };

  const handleContextOrgChange = async (
    orgId: string | null,
  ) => {
    setSelectedContextOrgId(orgId);
    if (orgId) {
      localStorage.setItem("valuedock_selected_org_id", orgId);
    } else {
      localStorage.removeItem("valuedock_selected_org_id");
    }

    // Reload data for new context
    await loadDataForCurrentContext(
      selectedContextTenantId,
      orgId,
    );
  };

  // Load data scoped to current tenant/org context
  const loadDataForCurrentContext = async (
    tenantId: string | null,
    orgId: string | null,
    profileOverride?: UserProfile | null,
  ) => {
    try {
      setDataLoading(true); // Start loading
      setCostClassificationLoaded(false); // Reset cost classification loaded flag
      resetROIController(); // Reset ROI controller state

      // Use provided profile or fall back to state
      const activeProfile = profileOverride || userProfile;

      console.log(
        "[App - loadDataForCurrentContext] 🔄 Loading data for context:",
        {
          tenantId,
          orgId,
          userRole: activeProfile?.role,
          userGroupIds: activeProfile?.groupIds,
        },
      );

      if (orgId) {
        console.log(
          "[App - loadDataForCurrentContext] 📡 Fetching data from backend for org:",
          orgId,
        );
        const response = await apiCall(
          `/data/load?organizationId=${orgId}`,
          { method: "GET" },
        );

        console.log(
          "[App - loadDataForCurrentContext] 📦 Backend response:",
          {
            success: response.success,
            hasData: !!response.data,
            groupCount: response.data?.groups?.length || 0,
            processCount: response.data?.processes?.length || 0,
          },
        );

        if (response.success && response.data) {
          // ✅ NO FALLBACKS - mustArray will THROW if not arrays
          const normalizedResponse = {
            ...response.data,
            groups: mustArray('API.groups', response.data.groups),
            processes: mustArray('API.processes', response.data.processes),
          };
          
          const merged = mergeWithDefaults(normalizedResponse);
          
          // ✅ CRITICAL: Validate arrays with mustArray - NO ensureArray fallbacks
          const safemerged = {
            ...merged,
            groups: mustArray('merged.groups', merged.groups),
            processes: mustArray('merged.processes', merged.processes),
          };

          console.log(
            "[App - loadDataForCurrentContext] ✅ Data merged with defaults (counts for debugging):",
            {
              groupCount: safemerged.groups.length,
              processCount: safemerged.processes.length,
              groupsAreArray: Array.isArray(safemerged.groups),
              processesAreArray: Array.isArray(safemerged.processes),
            },
          );

          // Filter data based on user's group memberships (for regular users only)
          let filteredData = safemerged;
          if (
            activeProfile &&
            activeProfile.role === "user" &&
            activeProfile.groupIds &&
            mustArray<string>('activeProfile.groupIds', activeProfile.groupIds).length > 0
          ) {
            // ✅ NO FALLBACKS - mustArray will THROW if not array
            const userGroupIdsArray = mustArray<string>('activeProfile.groupIds', activeProfile.groupIds);
            
            console.log(
              "[App - loadDataForCurrentContext] 🔍 FILTERING CHECK:",
              {
                userEmail: activeProfile.email,
                userRole: activeProfile.role,
                userGroupIds: userGroupIdsArray,
                allGroups: safemerged.groups.map((g: any) => ({
                  id: g.id,
                  name: g.name,
                })),
                allProcesses: safemerged.processes.map(
                  (p: any) => ({
                    id: p.id,
                    name: p.name,
                    group: p.group,
                  }),
                ),
              },
            );

            const userGroupIds = new Set(userGroupIdsArray);
            const userGroupNames = new Set(
              safemerged.groups
                .filter((g: any) => userGroupIds.has(g.id))
                .map((g: any) => g.name),
            );

            filteredData = {
              ...safemerged,
              groups: safemerged.groups.filter((g: any) =>
                userGroupIds.has(g.id),
              ),
              processes: safemerged.processes.filter((p: any) => {
                return (
                  p.group &&
                  (userGroupIds.has(p.group) ||
                    userGroupNames.has(p.group))
                );
              }),
            };

            console.log(
              "[App - loadDataForCurrentContext] ✅ Group-based filtering applied:",
              {
                userRole: activeProfile.role,
                userGroupIds: Array.from(userGroupIds),
                userGroupNames: Array.from(userGroupNames),
                totalGroups: safemerged.groups.length,
                visibleGroups: filteredData.groups.length,
                totalProcesses: safemerged.processes.length,
                visibleProcesses: filteredData.processes.length,
                processGroupMappings: safemerged.processes.map(
                  (p: any) => ({
                    id: p.id,
                    name: p.name,
                    group: p.group,
                    visible:
                      p.group &&
                      (userGroupIds.has(p.group) ||
                        userGroupNames.has(p.group)),
                  }),
                ),
              },
            );
          } else {
            const reason =
              activeProfile?.role !== "user"
                ? "User is admin - sees all data"
                : "User has no group assignments - sees all data";
            console.log(
              `[App - loadDataForCurrentContext] ℹ️ No filtering applied: ${reason}`,
              {
                userRole: activeProfile?.role,
                hasGroupIds:
                  activeProfile?.groupIds &&
                  ensureArray(activeProfile.groupIds).length > 0,
                totalGroups: safemerged.groups.length,
                totalProcesses: safemerged.processes.length,
              },
            );
          }

          // ✅ CRITICAL: Final validation - mustArray will THROW if not arrays
          const safeGroups = mustArray('filtered.groups', filteredData.groups);
          const safeProcesses = mustArray('filtered.processes', filteredData.processes);
          
          const migratedData = {
            ...filteredData,
            groups: safeGroups,
            processes: safeProcesses.map((p) => ({
              ...p,
              selected: false,
            })),
          };
          
          // Validate the data structure before setting
          debugArray('[loadDataForCurrentContext] Final groups', migratedData.groups);
          debugArray('[loadDataForCurrentContext] Final processes', migratedData.processes);
          
          // ✅ CRITICAL: Validate NO key collision - THROWS on error
          validateArrayFieldsNotCounts(migratedData, ['groups', 'processes'], 'loadDataForCurrentContext before setState');
          
          // ✅ CRITICAL: Set state with ARRAYS, not counts
          setInputData(migratedData);

          // Log counts for debugging (NOT the actual state structure)
          console.log(
            "[App - loadDataForCurrentContext] ✅ State updated (showing COUNTS for debugging):",
            {
              groupsCount: migratedData.groups.length,
              processesCount: migratedData.processes.length,
              groupsAreArray: Array.isArray(migratedData.groups),
              processesAreArray: Array.isArray(migratedData.processes),
            },
          );

          // Load cost classification for this organization
          try {
            console.log(
              "[App - loadDataForCurrentContext] 📊 Loading cost classification for org:",
              orgId,
            );
            const classificationResponse = await apiCall(
              `/cost-classification/${orgId}`,
              { method: "GET" },
            );
            if (
              classificationResponse.success &&
              classificationResponse.classification
            ) {
              // ✅ NO FALLBACKS - mustArray will THROW if not arrays
              const normalizedClassification = {
                ...classificationResponse.classification,
                hardCosts: mustArray('classification.hardCosts', classificationResponse.classification.hardCosts),
                softCosts: mustArray('classification.softCosts', classificationResponse.classification.softCosts),
              };
              
              console.log(
                "[App - loadDataForCurrentContext] ✅ Cost classification loaded:",
                {
                  hardCosts: normalizedClassification.hardCosts.length,
                  softCosts: normalizedClassification.softCosts.length,
                },
              );
              setCostClassification(normalizedClassification);
              setCostClassificationLoaded(true);
              
              // ✅ Run meetings pipeline after cost classification loads
              // No try/catch needed - pipeline handles all errors gracefully
              import('./meetings/pipeline').then(({ runMeetingsPipeline }) => {
                runMeetingsPipeline({ orgId });
              });
            } else {
              console.log(
                "[App - loadDataForCurrentContext] ℹ️ No cost classification found - ROI will use defaults",
              );
              // Set empty classification (app can still work without it)
              setCostClassification({
                organizationId: orgId,
                hardCosts: [],
                softCosts: [],
              });
              setCostClassificationLoaded(true); // Mark as loaded so app doesn't get stuck
              
              // Still run meetings pipeline
              import('./meetings/pipeline').then(({ runMeetingsPipeline }) => {
                runMeetingsPipeline({ orgId });
              });
            }
          } catch (error: any) {
            console.warn(
              "[App - loadDataForCurrentContext] ⚠️ Could not load cost classification (network or server issue):",
              error.message,
            );
            console.log(
              "[App - loadDataForCurrentContext] ℹ️ Continuing with default cost classification",
            );
            // Set empty classification so app doesn't get stuck
            setCostClassification({
              organizationId: orgId,
              hardCosts: [],
              softCosts: [],
            });
            setCostClassificationLoaded(true); // Mark as loaded so app can continue
            
            // Still run meetings pipeline
            import('./meetings/pipeline').then(({ runMeetingsPipeline }) => {
              runMeetingsPipeline({ orgId });
            });
          }
        } else {
          // ❌ NO DUMMY DATA - ERROR OUT
          const error = "[App - loadDataForCurrentContext] ❌ Backend returned no data - CANNOT CONTINUE";
          console.error(error);
          throw new Error(error);
        }
      } else {
        // No organization selected - this is OK for master_admins who need to use context switcher
        console.log(
          "[App - loadDataForCurrentContext] ℹ️ No organization selected",
          {
            userRole: activeProfile?.role,
            isMasterAdmin: activeProfile?.role === "master_admin",
            message: activeProfile?.role === "master_admin" 
              ? "Master admin should use context switcher to select an organization"
              : "No organization ID available - cannot load data",
          }
        );
        
        // Set empty data state
        setInputData({
          ...defaultInputData,
          groups: [],
          processes: [],
        });
        
        // Don't throw error for master_admins (they use context switcher)
        // For other users, this is a data issue but we'll handle gracefully
        if (activeProfile?.role !== "master_admin") {
          console.warn(
            "[App - loadDataForCurrentContext] ⚠️ User has no organization - data cannot be loaded"
          );
        }
      }
    } catch (error: any) {
      console.error(
        "[App - loadDataForCurrentContext] ❌ Error loading context data:",
        error,
      );
      
      // Set empty data state on error
      setInputData({
        ...defaultInputData,
        groups: [],
        processes: [],
      });
      
      // Show user-friendly message
      toast.error(
        error.message?.includes("No organization") 
          ? "Please select an organization to view data" 
          : "Failed to load data. Please try again."
      );
    } finally {
      setDataLoading(false); // Done loading
    }
  };

  // Load tenants and organizations for context switcher
  useEffect(() => {
    const loadContextData = async () => {
      if (
        !userProfile ||
        !hasRole(userProfile, ["master_admin", "tenant_admin"])
      ) {
        return;
      }

      try {
        const [tenantsRes, orgsRes] = await Promise.all([
          apiCall("/admin/tenants"),
          apiCall("/admin/organizations"),
        ]);

        // ✅ NO FALLBACKS - mustArray will THROW if not arrays
        if (tenantsRes.tenants) {
          setAllTenants(mustArray('tenantsRes.tenants', tenantsRes.tenants));
        }
        if (orgsRes.organizations) {
          setAllOrganizations(mustArray('orgsRes.organizations', orgsRes.organizations));
        }
      } catch (error) {
        console.error("Error loading context data:", error);
      }
    };

    loadContextData();
  }, [userProfile]);

  // Reload data when organization context changes
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      // Only load data if we have an organization ID
      const orgId = selectedContextOrgId || userProfile.organizationId;
      if (orgId) {
        loadDataForCurrentContext(
          selectedContextTenantId,
          orgId,
        );
      } else {
        console.log(
          "[App] ℹ️ No organization selected - waiting for context selection (master_admin may need to use context switcher)",
        );
      }
    }
  }, [selectedContextOrgId, isAuthenticated]);

  // Auto-refresh data when switching FROM admin tab TO any other tab
  const [previousTab, setPreviousTab] = useState(currentTab);
  useEffect(() => {
    if (
      previousTab === "admin" &&
      currentTab !== "admin" &&
      isAuthenticated &&
      userProfile
    ) {
      console.log(
        "[App] 🔄 Leaving admin tab - auto-refreshing data...",
      );
      loadDataForCurrentContext(
        selectedContextTenantId,
        selectedContextOrgId,
      );
      toast.info("Refreshing data...", { duration: 1000 });
    }
    setPreviousTab(currentTab);
  }, [
    currentTab,
    previousTab,
    isAuthenticated,
    userProfile,
    selectedContextTenantId,
    selectedContextOrgId,
  ]);

  // Check for existing session on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log(
          "[App - Initialize] Checking for existing session...",
        );
        const { session, profile: initialProfile } =
          await getSession();

        if (session && initialProfile) {
          console.log(
            "[App - Initialize] Session found for:",
            initialProfile.email,
          );
          console.log(
            "[App - Initialize] Profile tenant/org:",
            {
              tenantId: initialProfile.tenantId,
              organizationId: initialProfile.organizationId,
            },
          );

          setIsAuthenticated(true);
          setUserProfile(initialProfile);
          await fetchUserContextNames(initialProfile);

          if (initialProfile.organizationId) {
            await loadDataForCurrentContext(
              null,
              initialProfile.organizationId,
              initialProfile,
            );
          } else if (initialProfile.role === "master_admin") {
            console.log(
              "[App - Initialize] ℹ️ Master admin - no default org (will use context switcher)",
            );
          } else {
            console.warn(
              "[App - Initialize] ⚠️ User has no organizationId",
            );
          }
        } else {
          console.log(
            "[App - Initialize] No existing session found",
          );
        }
      } catch (error: any) {
        console.error("Initialization error:", error);
        setInitError(
          error.message || "Unknown initialization error",
        );
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleLoginSuccess = async () => {
    const { session, profile } = await getSession();
    console.log(
      "[App - handleLoginSuccess] 🔐 Login success, loading user data:",
      {
        userId: profile?.id,
        email: profile?.email,
        role: profile?.role,
        organizationId: profile?.organizationId,
        tenantId: profile?.tenantId,
        groupIds: profile?.groupIds,
      },
    );

    if (session && profile) {
      setIsAuthenticated(true);
      setUserProfile(profile);
      await fetchUserContextNames(profile);
      if (profile.organizationId) {
        console.log(
          "[App - handleLoginSuccess] 📂 Loading data for organization:",
          profile.organizationId,
        );
        await loadDataForCurrentContext(
          null,
          profile.organizationId,
          profile,
        );
      } else if (profile.role === "master_admin") {
        console.log(
          "[App - handleLoginSuccess] ℹ️ Master admin logged in - no default org (will use context switcher)",
        );
        toast.info("Please select an organization from the context switcher");
      } else {
        console.warn(
          "[App - handleLoginSuccess] ⚠️ User has no organizationId - cannot load data",
        );
        toast.warning("Your account has no organization assigned. Please contact your administrator.");
      }
      setCurrentTab("inputs");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsAuthenticated(false);
    setUserProfile(null);
    setTenantName("");
    setOrganizationName("");
  };

  const fetchUserContextNames = async (
    profile: UserProfile,
  ) => {
    try {
      if (profile.tenantId) {
        try {
          console.log(
            "[fetchUserContextNames] Fetching tenant:",
            profile.tenantId,
          );
          const tenantData = await apiCall(
            `/tenants/${profile.tenantId}`,
          );
          if (tenantData.tenant) {
            console.log(
              "[fetchUserContextNames] ✅ Tenant found:",
              tenantData.tenant.name,
            );
            setTenantName(tenantData.tenant.name);
          } else {
            console.warn(
              "[fetchUserContextNames] ⚠️ Tenant response missing tenant object",
            );
          }
        } catch (err) {
          console.error(
            "[fetchUserContextNames] ❌ Failed to fetch tenant:",
            profile.tenantId,
          );
        }
      }
      if (profile.organizationId) {
        try {
          console.log(
            "[fetchUserContextNames] Fetching organization:",
            profile.organizationId,
          );
          const orgData = await apiCall(
            `/organizations/${profile.organizationId}`,
          );
          if (orgData.organization) {
            console.log(
              "[fetchUserContextNames] ✅ Organization found:",
              orgData.organization.name,
            );
            setOrganizationName(
              orgData.organization.name ||
                orgData.organization.companyName,
            );
          } else {
            console.warn(
              "[fetchUserContextNames] ⚠️ Organization response missing organization object",
            );
          }
        } catch (err) {
          console.error(
            "[fetchUserContextNames] ❌ Failed to fetch organization:",
            profile.organizationId,
          );
        }
      }
    } catch (error) {
      console.error(
        "[fetchUserContextNames] ❌ Unexpected error:",
        error,
      );
    }
  };

  const loadDataFromBackend = async () => {
    try {
      const orgId =
        selectedContextOrgId || userProfile?.organizationId;
      
      if (!orgId) {
        throw new Error('[loadDataFromBackend] ❌ No organizationId - CANNOT LOAD DATA');
      }
      
      const endpoint = `/data/load?organizationId=${orgId}`;
      const response = await apiCall(endpoint);
      
      if (!response.success || !response.data) {
        throw new Error('[loadDataFromBackend] ❌ Backend returned no data - CANNOT CONTINUE');
      }
      
      // ✅ NO FALLBACKS - mustArray will THROW if not arrays
      const normalizedResponse = {
        ...response.data,
        groups: mustArray('backend.groups', response.data.groups),
        processes: mustArray('backend.processes', response.data.processes),
      };
      
      const merged = mergeWithDefaults(normalizedResponse);
      
      // ✅ CRITICAL: Validate with mustArray - NO ensureArray fallbacks
      const safeMerged = {
        ...merged,
        groups: mustArray('merged.groups', merged.groups),
        processes: mustArray('merged.processes', merged.processes),
      };
      
      let filteredData = safeMerged;
      if (
        userProfile &&
        userProfile.role === "user" &&
        userProfile.groupIds &&
        mustArray<string>('user.groupIds', userProfile.groupIds).length > 0
      ) {
        const userGroupIdsArray = mustArray<string>('user.groupIds', userProfile.groupIds);
        const userGroupIds = new Set(userGroupIdsArray);
          const userGroupNames = new Set(
            safeMerged.groups
              .filter((g: any) => userGroupIds.has(g.id))
              .map((g: any) => g.name),
          );
          filteredData = {
            ...safeMerged,
            groups: safeMerged.groups.filter((g: any) =>
              userGroupIds.has(g.id),
            ),
            processes: safeMerged.processes.filter(
              (p: any) =>
                p.group &&
                (userGroupIds.has(p.group) ||
                  userGroupNames.has(p.group)),
            ),
          };
        }
      
      // ✅ CRITICAL: Final validation - mustArray will THROW if not arrays
      const safeGroups = mustArray('filtered.groups', filteredData.groups);
      const safeProcesses = mustArray('filtered.processes', filteredData.processes);
      
      const migratedData = {
        ...filteredData,
        groups: safeGroups,
        processes: safeProcesses.map((p) => ({
          ...p,
          selected: true,
        })),
      };
      
      // ✅ CRITICAL: Validate NO key collision - THROWS on error
      validateArrayFieldsNotCounts(migratedData, ['groups', 'processes'], 'loadDataFromBackend before setState');
      
      // ✅ CRITICAL: Set state with ARRAYS, not counts
      setInputData(migratedData);
      localStorage.setItem(
        "valuedock_data",
        JSON.stringify(filteredData),
      );
      return true;
    } catch (error) {
      console.error("❌ [loadDataFromBackend] CRITICAL ERROR:", error);
      throw error; // Re-throw to propagate error
    }
  };

  const saveDataToBackend = async (data: InputData) => {
    try {
      const savePayload = {
        ...data,
        _meta: {
          organizationId:
            selectedContextOrgId || userProfile?.organizationId,
          tenantId:
            selectedContextTenantId || userProfile?.tenantId,
          savedAt: new Date().toISOString(),
        },
      };
      const response = await apiCall("/data/save", {
        method: "POST",
        body: savePayload,
      });
      return response.success;
    } catch (error) {
      console.error("Error saving data to backend:", error);
      return false;
    }
  };

  const getWelcomeMessage = () => {
    if (!userProfile) return "Welcome";
    const selectedTenant = allTenants.find(
      (t) => t.id === selectedContextTenantId,
    );
    const selectedOrg = allOrganizations.find(
      (o) => o.id === selectedContextOrgId,
    );
    if (
      selectedOrg &&
      hasRole(userProfile, ["master_admin", "tenant_admin"])
    )
      return `Viewing: ${selectedOrg.name}`;
    if (
      selectedTenant &&
      hasRole(userProfile, ["master_admin"])
    )
      return `Viewing: ${selectedTenant.name}`;
    const userFirstName =
      userProfile.name?.split(" ")[0] ||
      userProfile.name ||
      userProfile.email;
    switch (userProfile.role) {
      case "master_admin":
        return "Welcome Global Admin";
      case "tenant_admin":
        return tenantName
          ? `${tenantName} - Welcome Admin`
          : "Welcome Admin";
      case "org_admin":
        return organizationName
          ? `${organizationName} - Welcome ${userFirstName}`
          : `Welcome ${userFirstName}`;
      default:
        return organizationName
          ? `${organizationName} - Welcome ${userFirstName}`
          : `Welcome ${userFirstName}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <Toaster position="top-right" />
        <DebugConsole />
        {initError && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg z-50 max-w-md">
            <p className="text-sm font-medium">
              Initialization Error:
            </p>
            <p className="text-sm">{initError}</p>
          </div>
        )}
        {initSuccess && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md">
            <p className="text-sm">
              ✓ System initialized successfully
            </p>
          </div>
        )}
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Show workflow editor if requested
  if (showWorkflowEditor && userProfile) {
    return (
      <>
        <Toaster position="top-right" />
        <StandaloneWorkflow
          onClose={handleWorkflowBack}
          processId={workflowProcessId}
          processName={workflowProcessName}
          organizationId={
            selectedContextOrgId || userProfile.organizationId
          }
          onComplexityUpdate={(complexity) => {
            console.log(
              "🔔 onComplexityUpdate TRIGGERED for processId:",
              workflowProcessId,
            );
            console.log(
              "   Complexity data received:",
              complexity,
            );
            if (workflowProcessId) {
              setInputData((prev) => ({
                ...prev,
                processes: prev.processes.map((p) => {
                  if (p.id !== workflowProcessId) return p;
                  const currentMetrics =
                    p.complexityMetrics || {
                      autoGatherFromWorkflow: true,
                      inputsCount: 0,
                      stepsCount: 0,
                      dependenciesCount: 0,
                      inputsScore: 1,
                      stepsScore: 1,
                      dependenciesScore: 1,
                    };
                  if (
                    currentMetrics.autoGatherFromWorkflow ===
                    false
                  )
                    return p;
                  const updatedMetrics = {
                    ...currentMetrics,
                    autoGatherFromWorkflow: true,
                    inputsCount:
                      currentMetrics.manualInputsOverride
                        ? currentMetrics.inputsCount
                        : complexity.inputsCount,
                    inputsScore:
                      currentMetrics.manualInputsOverride
                        ? currentMetrics.inputsScore
                        : complexity.inputsScore,
                    stepsCount:
                      currentMetrics.manualStepsOverride
                        ? currentMetrics.stepsCount
                        : complexity.stepsCount,
                    stepsScore:
                      currentMetrics.manualStepsOverride
                        ? currentMetrics.stepsScore
                        : complexity.stepsScore,
                    dependenciesCount:
                      currentMetrics.manualDependenciesOverride
                        ? currentMetrics.dependenciesCount
                        : complexity.dependenciesCount,
                    dependenciesScore:
                      currentMetrics.manualDependenciesOverride
                        ? currentMetrics.dependenciesScore
                        : complexity.dependenciesScore,
                  };
                  const complexityIndex =
                    updatedMetrics.inputsScore * 0.4 +
                    updatedMetrics.stepsScore * 0.4 +
                    updatedMetrics.dependenciesScore * 0.2;
                  let riskCategory:
                    | "Simple"
                    | "Moderate"
                    | "Complex" = "Moderate";
                  let riskValue = 5;
                  if (complexityIndex < 4.0) {
                    riskCategory = "Simple";
                    riskValue = 2;
                  } else if (complexityIndex < 7.0) {
                    riskCategory = "Moderate";
                    riskValue = 5;
                  } else {
                    riskCategory = "Complex";
                    riskValue = 8;
                  }
                  return {
                    ...p,
                    complexityMetrics: {
                      ...updatedMetrics,
                      complexityIndex:
                        Math.round(complexityIndex * 10) / 10,
                      riskCategory,
                      riskValue,
                    },
                  };
                }),
              }));
              setTimeout(() => {
                setInputData((prev) => {
                  saveDataToBackend(prev)
                    .then((success) => {
                      if (success)
                        console.log(
                          "✅ Complexity metrics saved to backend",
                        );
                      else
                        console.error(
                          "❌ Backend save returned false",
                        );
                    })
                    .catch((error) =>
                      console.error(
                        "❌ Failed to save complexity metrics:",
                        error,
                      ),
                    );
                  return prev;
                });
              }, 100);
            }
          }}
          config={{
            onWorkflowSave: (workflow) => {
              console.log(
                "✅ Workflow saved for process:",
                workflowProcessName,
                workflow,
              );
              toast.success(
                `Workflow "${workflow.name}" saved successfully!`,
              );
            },
            onWorkflowDeploy: (workflow, customerId) => {
              console.log("🚀 Workflow deployed:", {
                processId: workflowProcessId,
                processName: workflowProcessName,
                organizationId:
                  selectedContextOrgId ||
                  userProfile.organizationId,
                customerId,
              });
              toast.success("Workflow deployed successfully!");
            },
            onTemplateCreate: (template) => {
              console.log(
                "📋 Template created:",
                template.name,
              );
              toast.success(
                `Template "${template.name}" created!`,
              );
            },
            initialWorkflow: {
              name: workflowProcessName || "New Workflow",
            },
            ui: {
              showDeployButton: true,
              showTemplateButtons: true,
              showDocumentLibrary: false,
            },
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <DebugConsole />
      <div className="responsive-container py-4 md:py-8">
        {/* Header with user info */}
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <img
              src={logo}
              alt="DockeryAI"
              className="h-8 md:h-12 flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-xl md:text-3xl font-bold truncate">
                ValuDock<sup className="text-xs">®</sup>
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {getWelcomeMessage()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Context Switcher for multi-tenant/org admins */}
            {hasRole(userProfile, [
              "master_admin",
              "tenant_admin",
            ]) && (
              <div className="hidden md:block w-64">
                <TenantOrgContextSwitcher
                  currentUser={userProfile!}
                  tenants={allTenants}
                  organizations={allOrganizations}
                  selectedTenantId={selectedContextTenantId}
                  selectedOrgId={selectedContextOrgId}
                  onTenantChange={handleContextTenantChange}
                  onOrgChange={handleContextOrgChange}
                />
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 md:h-10 md:w-10"
                >
                  <Menu className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 md:w-80"
              >
                {/* Mobile Context Switcher */}
                {hasRole(userProfile, [
                  "master_admin",
                  "tenant_admin",
                ]) && (
                  <>
                    <div className="md:hidden p-2">
                      <TenantOrgContextSwitcher
                        currentUser={userProfile!}
                        tenants={allTenants}
                        organizations={allOrganizations}
                        selectedTenantId={
                          selectedContextTenantId
                        }
                        selectedOrgId={selectedContextOrgId}
                        onTenantChange={
                          handleContextTenantChange
                        }
                        onOrgChange={handleContextOrgChange}
                      />
                    </div>
                    <DropdownMenuSeparator className="md:hidden" />
                  </>
                )}
                <DropdownMenuItem onClick={handleSaveSnapshot}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Save Snapshot
                </DropdownMenuItem>
                {hasRole(userProfile, [
                  "master_admin",
                  "tenant_admin",
                  "org_admin",
                ]) && (
                  <DropdownMenuItem
                    onClick={handleRestoreSnapshot}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore Snapshot
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {hasRole(userProfile, [
                  "master_admin",
                  "tenant_admin",
                  "org_admin",
                ]) && (
                  <>
                    <DropdownMenuItem
                      onClick={handleClearAllData}
                      className="text-destructive focus:text-destructive"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Clear All Data
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Context-aware Profile Menu */}
                <DropdownMenuItem
                  onClick={() => setCurrentTab("profile")}
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  {userProfile?.role === "master_admin" &&
                    "Global Profile"}
                  {userProfile?.role === "tenant_admin" &&
                    tenantName &&
                    `${tenantName} Profile`}
                  {userProfile?.role === "tenant_admin" &&
                    !tenantName &&
                    "Tenant Profile"}
                  {userProfile?.role === "org_admin" &&
                    organizationName &&
                    `${organizationName} Profile`}
                  {userProfile?.role === "org_admin" &&
                    !organizationName &&
                    "Organization Profile"}
                  {userProfile?.role === "user" &&
                    userProfile?.name &&
                    `${userProfile.name} Profile`}
                  {userProfile?.role === "user" &&
                    !userProfile?.name &&
                    "Profile"}
                </DropdownMenuItem>

                {hasRole(userProfile, [
                  "master_admin",
                  "tenant_admin",
                  "org_admin",
                ]) && (
                  <DropdownMenuItem
                    onClick={() => setCurrentTab("admin")}
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setCurrentTab("presentation")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Presentation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-4 md:mb-8">
            <TabsList className="inline-flex md:grid w-auto md:w-full grid-cols-8 min-w-max md:min-w-0">
              <TabsTrigger
                value="inputs"
                className="gap-1 md:gap-2 px-3 md:px-4"
              >
                <Calculator className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  Inputs
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="implementation"
                className="gap-1 md:gap-2 px-3 md:px-4"
              >
                <Wrench className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  Implementation
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="results"
                className="gap-1 md:gap-2 px-3 md:px-4"
              >
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  Impact and ROI
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="opportunity"
                className="gap-1 md:gap-2 px-3 md:px-4"
              >
                <Target className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  Opportunity
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="gap-1 md:gap-2 px-3 md:px-4"
              >
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  Timeline
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="scenarios"
                className="gap-1 md:gap-2 px-3 md:px-4"
              >
                <BarChart3 className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  Scenarios
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className="gap-1 md:gap-2 px-3 md:px-4"
              >
                <Share2 className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  Export
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="meetings"
                className="gap-1 md:gap-2 px-3 md:px-4"
              >
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  Meetings
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="inputs" className="mt-0">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading data...
                  </p>
                </div>
              </div>
            ) : (
              <InputsScreenTable
                data={inputData}
                onChange={handleInputChange}
                onWorkflowClick={handleWorkflowClick}
                organizationId={
                  selectedContextOrgId ||
                  userProfile?.organizationId
                }
              />
            )}
          </TabsContent>

          <TabsContent value="implementation" className="mt-0">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading data...
                  </p>
                </div>
              </div>
            ) : (
              <ImplementationScreen
                data={inputData}
                onChange={handleInputChange}
              />
            )}
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading data...
                  </p>
                </div>
              </div>
            ) : (
              <ResultsScreen
                data={inputData}
                results={results}
                cashflowData={cashflowData}
                onExport={() => setCurrentTab("export")}
                onCalculate={handleCalculate}
                selectedProcessIds={selectedProcessIds}
                setSelectedProcessIds={setSelectedProcessIds}
                hardCostsOnlyMode={hardCostsOnlyMode}
                setHardCostsOnlyMode={setHardCostsOnlyMode}
                costClassification={costClassification}
                timeHorizonMonths={timeHorizonMonths}
                setTimeHorizonMonths={setTimeHorizonMonths}
              />
            )}
          </TabsContent>

          <TabsContent value="opportunity" className="mt-0">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading data...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <RiskFactorLiveTest
                  currentGlobalRisk={
                    inputData.globalDefaults
                      .financialAssumptions?.globalRiskFactor ||
                    0
                  }
                  sampleROI={2.0}
                />
                <OpportunityMatrix
                  data={inputData}
                  results={results}
                  timeHorizonMonths={timeHorizonMonths}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading data...
                  </p>
                </div>
              </div>
            ) : (
              <TimelineScreen
                data={inputData}
                processResults={results.processResults}
              />
            )}
          </TabsContent>

          <TabsContent value="scenarios" className="mt-0">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading data...
                  </p>
                </div>
              </div>
            ) : (
              <ScenarioScreen
                data={inputData}
                costClassification={costClassification}
                timeHorizonMonths={timeHorizonMonths}
              />
            )}
          </TabsContent>

          <TabsContent value="export" className="mt-0">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading data...
                  </p>
                </div>
              </div>
            ) : (
              <ExportScreen
                data={inputData}
                results={results}
                onDownloadPDF={handleDownloadPDF}
                onCopyLink={handleCopyLink}
              />
            )}
          </TabsContent>

          <TabsContent value="meetings" className="mt-0">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading meetings...
                  </p>
                </div>
              </div>
            ) : (
              <MeetingsPanel
                orgId={
                  selectedContextOrgId ||
                  userProfile?.organizationId ||
                  null
                }
              />
            )}
          </TabsContent>

          <TabsContent value="presentation" className="mt-0">
            <PresentationScreen
              data={{
                ...filteredData,
                groups: mustArray('PresentationScreen.groups', filteredData.groups),
                processes: mustArray('PresentationScreen.processes', filteredData.processes),
              }}
              results={results}
              selectedProcessIds={mustArray('PresentationScreen.selectedProcessIds', selectedProcessIds)}
              hardCostsOnlyMode={hardCostsOnlyMode}
            />
          </TabsContent>

          {hasRole(userProfile, [
            "master_admin",
            "tenant_admin",
            "org_admin",
          ]) && (
            <TabsContent value="admin" className="mt-0">
              <AdminDashboard
                currentUser={userProfile!}
                globalDefaults={inputData.globalDefaults}
                selectedContextOrgId={selectedContextOrgId}
                onSaveGlobalDefaults={async (newDefaults) => {
                  console.log(
                    "[App - onSaveGlobalDefaults] 💾 Saving global defaults with effort anchors:",
                    newDefaults,
                  );
                  const updatedInputData = {
                    ...inputData,
                    globalDefaults: newDefaults,
                  };
                  setInputData(updatedInputData);
                  const orgId =
                    selectedContextOrgId ||
                    userProfile.organizationId;
                  const savePayload = {
                    ...updatedInputData,
                    _meta: {
                      organizationId: orgId,
                      tenantId:
                        selectedContextTenantId ||
                        userProfile?.tenantId,
                      savedAt: new Date().toISOString(),
                    },
                  };
                  const response = await apiCall("/data/save", {
                    method: "POST",
                    body: savePayload,
                  });
                  console.log(
                    "[App - onSaveGlobalDefaults] 📡 Backend save response:",
                    response,
                  );
                  try {
                    localStorage.setItem(
                      "valuedock_data",
                      JSON.stringify(updatedInputData),
                    );
                  } catch {}
                  toast.success(
                    "Effort anchors saved successfully!",
                  );
                }}
              />
            </TabsContent>
          )}

          <TabsContent value="profile" className="mt-0">
            <ProfileScreen
              userEmail={userProfile?.email}
              userName={userProfile?.name}
              userRole={userProfile?.role}
              userId={userProfile?.id}
              tenantId={userProfile?.tenantId}
              organizationId={userProfile?.organizationId}
              tenantName={tenantName}
              organizationName={organizationName}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Clear Data Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showClearDataDialog}
        onOpenChange={setShowClearDataDialog}
        onConfirm={confirmClearData}
        entityType="data"
        additionalWarning={`This will delete ${inputData.processes.length} process${inputData.processes.length !== 1 ? "es" : ""} and ${inputData.groups.length} group${inputData.groups.length !== 1 ? "s" : ""}.`}
      />

      {/* Debug Tools - Only show when authenticated */}
      {isAuthenticated && (
        <>
          <DebugConsole />
          <FathomDiagnostic />
        </>
      )}
    </div>
  );
}