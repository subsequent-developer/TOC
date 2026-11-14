import { useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { AnalysisTable } from '../components/analysis/AnalysisTable';
import { useAnalyses } from '../hooks/useAnalyses';
import { Button } from '../components/ui/Button';

export function AnalysesHistory() {
  const [skip, setSkip] = useState<number>(0);
  const limit = 25;
  const [verdictFilter, setVerdictFilter] = useState<string | null>(null);
  const [anomalyFilter, setAnomalyFilter] = useState<boolean | null>(null);

  const { data, isLoading, refetch, isFetching } = useAnalyses({
    skip,
    limit,
    verdict: verdictFilter,
    is_anomaly: anomalyFilter,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <History className="text-indigo-600 dark:text-indigo-400" />
            <span>Workflow Analyses History</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse, search, and audit all persisted workflow trace evaluations and anomaly records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            icon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <AnalysisTable
        items={data?.items ?? []}
        total={data?.total ?? 0}
        skip={skip}
        limit={limit}
        isLoading={isLoading}
        onPageChange={(newSkip) => setSkip(newSkip)}
        onVerdictFilter={(v) => {
          setVerdictFilter(v);
          setSkip(0);
        }}
        onAnomalyFilter={(a) => {
          setAnomalyFilter(a);
          setSkip(0);
        }}
        verdictFilter={verdictFilter}
        anomalyFilter={anomalyFilter}
      />
    </div>
  );
}
