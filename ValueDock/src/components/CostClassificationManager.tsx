import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Info, 
  Save, 
  RotateCcw,
  Briefcase,
  Server,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { apiCall } from '../utils/auth';

export interface CostClassification {
  organizationId: string;
  hardCosts: string[]; // array of cost attribute names
  softCosts: string[]; // array of cost attribute names
  lastModified: string;
  modifiedBy: string;
  modifiedByName?: string; // Optional - user's name or email
}

interface CostAttribute {
  key: string;
  label: string;
  category: 'labor' | 'it' | 'compliance' | 'opportunity';
  description: string;
  defaultClassification: 'hard' | 'soft';
}

// All cost attributes from InternalCosts and other cost sources
const COST_ATTRIBUTES: CostAttribute[] = [
  // Labor & Workforce
  {
    key: 'laborCosts',
    label: 'Direct Labor Costs',
    category: 'labor',
    description: 'Direct wages and salaries for process execution',
    defaultClassification: 'hard'
  },
  {
    key: 'trainingOnboardingCosts',
    label: 'Training & Onboarding',
    category: 'labor',
    description: 'Training and onboarding costs for new hires',
    defaultClassification: 'soft'
  },
  {
    key: 'overtimePremiums',
    label: 'Overtime Premiums',
    category: 'labor',
    description: 'Overtime premiums tied to cyclical demand/SLA',
    defaultClassification: 'hard'
  },
  {
    key: 'shadowSystemsCosts',
    label: 'Shadow Systems',
    category: 'labor',
    description: 'Excel, Access DBs, manual trackers',
    defaultClassification: 'soft'
  },
  {
    key: 'turnoverCosts',
    label: 'Turnover & Attrition',
    category: 'labor',
    description: 'Cost of employee turnover and replacement',
    defaultClassification: 'soft'
  },
  
  // IT & Operations
  {
    key: 'softwareLicensing',
    label: 'Software Licensing',
    category: 'it',
    description: 'Legacy tools and software subscriptions',
    defaultClassification: 'hard'
  },
  {
    key: 'infrastructureCosts',
    label: 'Infrastructure',
    category: 'it',
    description: 'Servers, storage, cloud resources',
    defaultClassification: 'hard'
  },
  {
    key: 'itSupportMaintenance',
    label: 'IT Support & Maintenance',
    category: 'it',
    description: 'IT support, patching, troubleshooting',
    defaultClassification: 'hard'
  },
  {
    key: 'apiLicensing',
    label: 'API Licensing',
    category: 'it',
    description: 'API and integration licensing costs',
    defaultClassification: 'hard'
  },
  
  // Compliance & Risk
  {
    key: 'errorRemediationCosts',
    label: 'Error Remediation',
    category: 'compliance',
    description: 'Error correction and rework costs',
    defaultClassification: 'soft'
  },
  {
    key: 'auditComplianceCosts',
    label: 'Audit & Compliance',
    category: 'compliance',
    description: 'Audit prep and compliance reporting',
    defaultClassification: 'hard'
  },
  {
    key: 'downtimeCosts',
    label: 'Downtime',
    category: 'compliance',
    description: 'Business continuity and downtime costs',
    defaultClassification: 'soft'
  },
  
  // Opportunity Costs
  {
    key: 'decisionDelays',
    label: 'Decision Delays',
    category: 'opportunity',
    description: 'Cost of delayed decision-making',
    defaultClassification: 'soft'
  },
  {
    key: 'staffCapacityDrag',
    label: 'Staff Capacity Drag',
    category: 'opportunity',
    description: 'Skilled staff tied up with low-value work',
    defaultClassification: 'soft'
  },
  {
    key: 'customerImpactCosts',
    label: 'Customer Impact',
    category: 'opportunity',
    description: 'SLA breaches and slow turnaround impact',
    defaultClassification: 'soft'
  },
  {
    key: 'slaPenalties',
    label: 'SLA Penalties',
    category: 'opportunity',
    description: 'Penalties for SLA violations',
    defaultClassification: 'hard'
  }
];

const CATEGORY_INFO = {
  labor: {
    icon: Briefcase,
    label: 'Labor & Workforce',
    color: 'text-blue-600'
  },
  it: {
    icon: Server,
    label: 'IT & Operations',
    color: 'text-purple-600'
  },
  compliance: {
    icon: AlertTriangle,
    label: 'Compliance & Risk',
    color: 'text-orange-600'
  },
  opportunity: {
    icon: Clock,
    label: 'Opportunity Costs',
    color: 'text-green-600'
  }
};

interface CostClassificationManagerProps {
  organizationId: string;
  organizationName: string;
  onSave?: () => void;
}

export function CostClassificationManager({ 
  organizationId, 
  organizationName,
  onSave 
}: CostClassificationManagerProps) {
  const [classification, setClassification] = useState<CostClassification | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [lastAction, setLastAction] = useState<string>('Component mounted');

  useEffect(() => {
    console.log('[CostClassification] Component mounted or org changed');
    setLastAction(`Loading data for org ${organizationId.substring(0, 15)}...`);
    loadClassification();
  }, [organizationId, loadTrigger]);

  const loadClassification = async () => {
    try {
      setLoading(true);
      console.log('[CostClassification] ========== LOADING ==========');
      console.log('[CostClassification] Organization ID:', organizationId);
      console.log('[CostClassification] Timestamp:', new Date().toISOString());
      
      const response = await apiCall(`/cost-classification/${organizationId}`);
      console.log('[CostClassification] API Response:', response);
      
      if (response.classification) {
        console.log('[CostClassification] ✅ Loaded from server');
        console.log('[CostClassification] Hard costs count:', response.classification.hardCosts?.length);
        console.log('[CostClassification] Soft costs count:', response.classification.softCosts?.length);
        console.log('[CostClassification] Hard costs:', response.classification.hardCosts);
        setClassification(response.classification);
        setLastAction('✅ Loaded saved data from server');
      } else {
        // Initialize with defaults if no classification exists
        console.log('[CostClassification] ⚠️ No saved classification, using defaults');
        setLastAction('⚠️ No saved data - loaded defaults');
        const defaultClassification: CostClassification = {
          organizationId,
          hardCosts: COST_ATTRIBUTES
            .filter(attr => attr.defaultClassification === 'hard')
            .map(attr => attr.key),
          softCosts: COST_ATTRIBUTES
            .filter(attr => attr.defaultClassification === 'soft')
            .map(attr => attr.key),
          lastModified: new Date().toISOString(),
          modifiedBy: 'System'
        };
        console.log('[CostClassification] Default hard costs:', defaultClassification.hardCosts);
        setClassification(defaultClassification);
      }
      setHasChanges(false);
      console.log('[CostClassification] ========== LOAD COMPLETE ==========');
    } catch (error: any) {
      console.error('[CostClassification] ❌ Error loading:', error);
      toast.error(`Failed to load: ${error.message || 'Unknown error'}`);
      
      // Fall back to defaults on error
      const defaultClassification: CostClassification = {
        organizationId,
        hardCosts: COST_ATTRIBUTES
          .filter(attr => attr.defaultClassification === 'hard')
          .map(attr => attr.key),
        softCosts: COST_ATTRIBUTES
          .filter(attr => attr.defaultClassification === 'soft')
          .map(attr => attr.key),
        lastModified: new Date().toISOString(),
        modifiedBy: 'System'
      };
      setClassification(defaultClassification);
    } finally {
      setLoading(false);
    }
  };

  const toggleClassification = (attributeKey: string) => {
    if (!classification) return;

    const isHard = classification.hardCosts.includes(attributeKey);
    const attribute = COST_ATTRIBUTES.find(a => a.key === attributeKey);
    
    const newClassification = {
      ...classification,
      hardCosts: isHard 
        ? classification.hardCosts.filter(k => k !== attributeKey)
        : [...classification.hardCosts, attributeKey],
      softCosts: isHard
        ? [...classification.softCosts, attributeKey]
        : classification.softCosts.filter(k => k !== attributeKey)
    };

    setClassification(newClassification);
    setHasChanges(true);
    
    // Visual feedback
    const newType = isHard ? 'Soft' : 'Hard';
    const actionMsg = `🔄 Changed "${attribute?.label}" to ${newType}`;
    setLastAction(actionMsg);
    toast.info(actionMsg + ' cost');
    console.log(`[CostClassification] Toggled ${attributeKey} from ${isHard ? 'Hard' : 'Soft'} to ${newType}`);
  };

  const handleSave = async () => {
    if (!classification) {
      alert('❌ ERROR: No classification data to save!');
      return;
    }

    alert('🚀 SAVE CLICKED! Check debug console for details.');
    setLastAction('🚀 Saving to server...');

    try {
      setSaving(true);
      console.log('[CostClassification] ========== SAVING ==========');
      console.log('[CostClassification] Organization ID:', organizationId);
      console.log('[CostClassification] Hard costs:', classification.hardCosts);
      console.log('[CostClassification] Soft costs:', classification.softCosts);
      console.log('[CostClassification] Timestamp:', new Date().toISOString());
      
      const response = await apiCall(`/cost-classification/${organizationId}`, {
        method: 'POST',
        body: {
          hardCosts: classification.hardCosts,
          softCosts: classification.softCosts
        }
      });
      
      console.log('[CostClassification] ✅ Save response:', response);
      
      // Update with server response to get the timestamp and modifiedBy
      if (response.classification) {
        console.log('[CostClassification] Updating local state with server response');
        setClassification(response.classification);
      }
      
      // Force a reload from server to ensure data is truly persisted
      console.log('[CostClassification] Force reloading from server to verify persistence...');
      await loadClassification();
      
      toast.success('✅ Cost classification saved successfully');
      alert('✅ SAVE SUCCESSFUL! Data has been saved to the database.');
      setLastAction('✅ Saved successfully at ' + new Date().toLocaleTimeString());
      setHasChanges(false);
      onSave?.();
      console.log('[CostClassification] ========== SAVE COMPLETE ==========');
    } catch (error: any) {
      console.error('[CostClassification] ❌ Error saving:', error);
      const errorMsg = error.message || 'Unknown error';
      setLastAction('❌ Save failed: ' + errorMsg);
      toast.error(`Failed to save: ${errorMsg}`);
      alert(`❌ SAVE FAILED!\n\nError: ${errorMsg}\n\nCheck debug console for details.`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadClassification();
    setHasChanges(false);
    toast.success('Reset to saved classification');
  };

  const getClassification = (attributeKey: string): 'hard' | 'soft' => {
    if (!classification) return 'soft';
    return classification.hardCosts.includes(attributeKey) ? 'hard' : 'soft';
  };

  const renderAttributeRow = (attribute: CostAttribute) => {
    const isHard = getClassification(attribute.key) === 'hard';
    
    return (
      <div 
        key={attribute.key}
        className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-lg transition-colors"
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{attribute.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{attribute.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isHard ? 'default' : 'outline'}
            onClick={() => !isHard && toggleClassification(attribute.key)}
            className="w-20"
          >
            <DollarSign className="h-3 w-3 mr-1" />
            Hard
          </Button>
          <Button
            size="sm"
            variant={!isHard ? 'default' : 'outline'}
            onClick={() => isHard && toggleClassification(attribute.key)}
            className="w-20"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Soft
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading cost classification...
          </div>
        </CardContent>
      </Card>
    );
  }

  const hardCount = classification?.hardCosts.length || 0;
  const softCount = classification?.softCosts.length || 0;

  return (
    <>
      {/* ON-SCREEN DEBUG PANEL */}
      <Card className="mb-4 border-2 border-blue-500 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-900">🔍 Debug Info (On-Screen)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="p-2 bg-white rounded border border-blue-300 mb-3">
            <span className="font-semibold text-blue-900">Last Action:</span> 
            <span className="ml-2 text-blue-700">{lastAction}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold">Org ID:</span> {organizationId.substring(0, 20)}...
            </div>
            <div>
              <span className="font-semibold">Has Changes:</span> {hasChanges ? '✅ YES' : '❌ NO'}
            </div>
            <div>
              <span className="font-semibold">Hard Costs:</span> {hardCount}
            </div>
            <div>
              <span className="font-semibold">Soft Costs:</span> {softCount}
            </div>
            <div>
              <span className="font-semibold">Saving:</span> {saving ? '⏳ YES' : '❌ NO'}
            </div>
            <div>
              <span className="font-semibold">Loading:</span> {loading ? '⏳ YES' : '❌ NO'}
            </div>
          </div>
          {classification?.lastModified && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <span className="font-semibold">Last Saved:</span> {new Date(classification.lastModified).toLocaleString()}
              <br />
              <span className="font-semibold">By:</span> {classification.modifiedByName || classification.modifiedBy}
            </div>
          )}
          {!classification?.lastModified && (
            <div className="mt-2 pt-2 border-t border-blue-200 text-orange-600 font-semibold">
              ⚠️ NO SAVED DATA - Using defaults
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Classification
              </CardTitle>
            <CardDescription className="mt-1">
              Define which cost attributes count as hard costs vs soft costs for <strong>{organizationName}</strong>
            </CardDescription>
            {classification && classification.lastModified && (
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(classification.lastModified).toLocaleDateString()} 
                {classification.modifiedByName && ` by ${classification.modifiedByName}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Hard Costs</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{hardCount}</div>
            <p className="text-xs text-blue-600/70 mt-1">Direct, measurable expenses</p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">Soft Costs</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{softCount}</div>
            <p className="text-xs text-green-600/70 mt-1">Indirect, opportunity costs</p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Hard costs</strong> are direct, measurable expenses (labor, software, infrastructure). 
            <strong className="ml-1">Soft costs</strong> are indirect costs and opportunity costs (efficiency gains, decision delays, attrition).
            Click the buttons to reclassify each cost attribute.
          </AlertDescription>
        </Alert>

        {/* Cost Attributes by Category */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="all">
              All ({COST_ATTRIBUTES.length})
            </TabsTrigger>
            <TabsTrigger value="labor">
              Labor ({COST_ATTRIBUTES.filter(a => a.category === 'labor').length})
            </TabsTrigger>
            <TabsTrigger value="it">
              IT ({COST_ATTRIBUTES.filter(a => a.category === 'it').length})
            </TabsTrigger>
            <TabsTrigger value="compliance">
              Risk ({COST_ATTRIBUTES.filter(a => a.category === 'compliance').length})
            </TabsTrigger>
            <TabsTrigger value="opportunity">
              Opportunity ({COST_ATTRIBUTES.filter(a => a.category === 'opportunity').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[500px] pr-4">
              {Object.entries(CATEGORY_INFO).map(([categoryKey, categoryInfo]) => {
                const categoryAttrs = COST_ATTRIBUTES.filter(
                  attr => attr.category === categoryKey
                );
                const Icon = categoryInfo.icon;

                return (
                  <div key={categoryKey} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`h-4 w-4 ${categoryInfo.color}`} />
                      <h3 className={`font-semibold ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </h3>
                      <Badge variant="outline" className="ml-auto">
                        {categoryAttrs.length} attributes
                      </Badge>
                    </div>
                    <div className="space-y-1 pl-6">
                      {categoryAttrs.map(renderAttributeRow)}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </TabsContent>

          {(['labor', 'it', 'compliance', 'opportunity'] as const).map(category => (
            <TabsContent key={category} value={category} className="mt-0">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-1">
                  {COST_ATTRIBUTES
                    .filter(attr => attr.category === category)
                    .map(renderAttributeRow)
                  }
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
    </>
  );
}
