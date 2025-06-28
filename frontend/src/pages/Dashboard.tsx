import React, { useState, useEffect } from 'react';
import { dashboardService, DashboardStats, DashboardMetrics, PipelineData } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  UsersIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pipeline, setPipeline] = useState<PipelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, metricsData, pipelineData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getMetrics(),
        dashboardService.getPipeline()
      ]);
      
      setStats(statsData);
      setMetrics(metricsData);
      setPipeline(pipelineData);
    } catch (error: any) {
      setError('Errore nel caricamento dei dati dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
        >
          Riprova
        </button>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Clienti Totali',
      value: stats?.customers.total || 0,
      icon: UsersIcon,
      color: 'blue',
      subtitle: `${stats?.customers.recent || 0} questo mese`
    },
    {
      name: 'Opportunità',
      value: stats?.opportunities.total || 0,
      icon: BriefcaseIcon,
      color: 'green',
      subtitle: `€${(stats?.opportunities.totalValue || 0).toLocaleString()}`
    },
    {
      name: 'Attività',
      value: stats?.activities.total || 0,
      icon: ClipboardDocumentListIcon,
      color: 'yellow',
      subtitle: 'Attività totali'
    },
    {
      name: 'Interazioni',
      value: stats?.interactions.total || 0,
      icon: ChatBubbleLeftRightIcon,
      color: 'purple',
      subtitle: 'Interazioni totali'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      purple: 'bg-purple-500 text-white'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Panoramica del sistema CRM PostgreSQL</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${getColorClasses(stat.color)}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value.toLocaleString()}
                    </dd>
                    <dd className="text-sm text-gray-500">
                      {stat.subtitle}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tasso di Conversione
            </h3>
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {metrics.conversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">
                  {metrics.opportunityCounts.won} su {metrics.opportunityCounts.total} opportunità
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Valore Vinto
            </h3>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  €{(stats?.opportunities.wonValue || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Valore totale delle opportunità vinte
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline */}
      {pipeline.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pipeline Vendite</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pipeline.map((stage) => (
                <div key={stage.stage} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {stage.stage.replace('-', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {stage.count} opportunità
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      €{stage.totalValue.toLocaleString()}
                      {stage.avgProbability && (
                        <span className="ml-2 text-xs text-gray-400">
                          ({stage.avgProbability.toFixed(0)}% prob. media)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;