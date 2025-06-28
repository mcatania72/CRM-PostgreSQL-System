import React, { useState, useEffect } from 'react';
import { interactionService, Interaction } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusIcon } from '@heroicons/react/24/outline';

const Interactions: React.FC = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');

  useEffect(() => {
    loadInteractions();
  }, [selectedType]);

  const loadInteractions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedType) params.type = selectedType;
      
      const response = await interactionService.getAll(params);
      setInteractions(response.interactions || response);
    } catch (error: any) {
      setError('Errore nel caricamento delle interazioni');
      console.error('Interactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      phone: 'bg-blue-100 text-blue-800',
      email: 'bg-green-100 text-green-800',
      meeting: 'bg-purple-100 text-purple-800',
      chat: 'bg-yellow-100 text-yellow-800',
      social: 'bg-pink-100 text-pink-800',
      website: 'bg-gray-100 text-gray-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      phone: 'Telefono',
      email: 'Email',
      meeting: 'Riunione',
      chat: 'Chat',
      social: 'Social',
      website: 'Website',
      other: 'Altro'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getDirectionBadge = (direction: string) => {
    const colors = {
      inbound: 'bg-green-100 text-green-800',
      outbound: 'bg-blue-100 text-blue-800'
    };
    return colors[direction as keyof typeof colors] || colors.inbound;
  };

  const getDirectionLabel = (direction: string) => {
    const labels = {
      inbound: 'In entrata',
      outbound: 'In uscita'
    };
    return labels[direction as keyof typeof labels] || direction;
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
            <h1 className="text-2xl font-bold text-gray-900">Interazioni</h1>
            <p className="text-gray-600">Gestisci le tue interazioni con i clienti</p>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => {/* TODO: Add create interaction modal */}}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuova Interazione
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Tutti i tipi</option>
            <option value="phone">Telefono</option>
            <option value="email">Email</option>
            <option value="meeting">Riunione</option>
            <option value="chat">Chat</option>
            <option value="social">Social</option>
            <option value="website">Website</option>
            <option value="other">Altro</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadInteractions}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
          >
            Riprova
          </button>
        </div>
      )}

      {/* Interactions Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {interactions.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Nessuna interazione trovata
            </li>
          ) : (
            interactions.map((interaction) => (
              <li key={interaction.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-1">
                        {interaction.subject && (
                          <p className="text-sm font-medium text-gray-900">
                            {interaction.subject}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {interaction.description}
                        </p>
                        {interaction.customer && (
                          <p className="text-sm text-gray-500">
                            Cliente: {interaction.customer.name}
                          </p>
                        )}
                        {interaction.user && (
                          <p className="text-sm text-gray-500">
                            Utente: {interaction.user.firstName} {interaction.user.lastName}
                          </p>
                        )}
                        {interaction.notes && (
                          <p className="text-sm text-gray-500 mt-1">
                            Note: {interaction.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(interaction.type)}`}>
                          {getTypeLabel(interaction.type)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDirectionBadge(interaction.direction)}`}>
                          {getDirectionLabel(interaction.direction)}
                        </span>
                        {interaction.duration && (
                          <span className="text-sm text-gray-500">
                            {interaction.duration} min
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(interaction.date).toLocaleDateString()}
                        </span>
                        {interaction.isImportant && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Importante
                          </span>
                        )}
                        {interaction.needsFollowUp && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Follow-up richiesto
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

export default Interactions;