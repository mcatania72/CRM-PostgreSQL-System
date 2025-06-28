import React, { useState, useEffect } from 'react';
import { opportunityService, Opportunity } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Opportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('');

  useEffect(() => {
    loadOpportunities();
  }, [selectedStage]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStage) params.stage = selectedStage;
      
      const response = await opportunityService.getAll(params);
      setOpportunities(response.opportunities || response);
    } catch (error: any) {
      setError('Errore nel caricamento delle opportunità');
      console.error('Opportunities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageBadge = (stage: string) => {
    const colors = {
      lead: 'bg-gray-100 text-gray-800',
      qualified: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-orange-100 text-orange-800',
      'closed-won': 'bg-green-100 text-green-800',
      'closed-lost': 'bg-red-100 text-red-800'
    };
    return colors[stage as keyof typeof colors] || colors.lead;
  };

  const getStageLabel = (stage: string) => {
    const labels = {
      lead: 'Lead',
      qualified: 'Qualificata',
      proposal: 'Proposta',
      negotiation: 'Negoziazione',
      'closed-won': 'Vinta',
      'closed-lost': 'Persa'
    };
    return labels[stage as keyof typeof labels] || stage;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Opportunità</h1>
            <p className="text-gray-600">Gestisci le tue opportunità di vendita</p>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => {/* TODO: Add create opportunity modal */}}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuova Opportunità
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
          >
            <option value="">Tutte le fasi</option>
            <option value="lead">Lead</option>
            <option value="qualified">Qualificata</option>
            <option value="proposal">Proposta</option>
            <option value="negotiation">Negoziazione</option>
            <option value="closed-won">Vinta</option>
            <option value="closed-lost">Persa</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadOpportunities}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
          >
            Riprova
          </button>
        </div>
      )}

      {/* Opportunities Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {opportunities.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Nessuna opportunità trovata
            </li>
          ) : (
            opportunities.map((opportunity) => (
              <li key={opportunity.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {opportunity.title}
                        </p>
                        {opportunity.customer && (
                          <p className="text-sm text-gray-500">
                            Cliente: {opportunity.customer.name}
                          </p>
                        )}
                        {opportunity.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {opportunity.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        {opportunity.value && (
                          <span className="text-sm font-medium text-green-600">
                            €{opportunity.value.toLocaleString()}
                          </span>
                        )}
                        {opportunity.probability && (
                          <span className="text-sm text-gray-500">
                            {opportunity.probability}% prob.
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageBadge(opportunity.stage)}`}>
                          {getStageLabel(opportunity.stage)}
                        </span>
                        {opportunity.expectedCloseDate && (
                          <span className="text-sm text-gray-500">
                            {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Opportunities;