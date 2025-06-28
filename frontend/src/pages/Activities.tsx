import React, { useState, useEffect } from 'react';
import { activityService, Activity } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusIcon, CheckIcon } from '@heroicons/react/24/outline';

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  useEffect(() => {
    loadActivities();
  }, [selectedStatus, selectedType]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      if (selectedType) params.type = selectedType;
      
      const response = await activityService.getAll(params);
      setActivities(response.activities || response);
    } catch (error: any) {
      setError('Errore nel caricamento delle attività');
      console.error('Activities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (id: number) => {
    try {
      await activityService.markAsCompleted(id);
      loadActivities(); // Reload to get updated data
    } catch (error) {
      console.error('Error marking activity as completed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'In Attesa',
      in_progress: 'In Corso',
      completed: 'Completata',
      cancelled: 'Annullata',
      overdue: 'Scaduta'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      call: 'Chiamata',
      email: 'Email',
      meeting: 'Riunione',
      task: 'Attività',
      note: 'Nota',
      'follow-up': 'Follow-up'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Bassa',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };
    return labels[priority as keyof typeof labels] || priority;
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
            <h1 className="text-2xl font-bold text-gray-900">Attività</h1>
            <p className="text-gray-600">Gestisci le tue attività e compiti</p>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => {/* TODO: Add create activity modal */}}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuova Attività
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Tutti gli stati</option>
            <option value="pending">In Attesa</option>
            <option value="in_progress">In Corso</option>
            <option value="completed">Completata</option>
            <option value="cancelled">Annullata</option>
            <option value="overdue">Scaduta</option>
          </select>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Tutti i tipi</option>
            <option value="call">Chiamata</option>
            <option value="email">Email</option>
            <option value="meeting">Riunione</option>
            <option value="task">Attività</option>
            <option value="note">Nota</option>
            <option value="follow-up">Follow-up</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadActivities}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
          >
            Riprova
          </button>
        </div>
      )}

      {/* Activities Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {activities.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Nessuna attività trovata
            </li>
          ) : (
            activities.map((activity) => (
              <li key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {activity.description}
                          </p>
                        )}
                        {activity.customer && (
                          <p className="text-sm text-gray-500">
                            Cliente: {activity.customer.name}
                          </p>
                        )}
                        {activity.assignedTo && (
                          <p className="text-sm text-gray-500">
                            Assegnato a: {activity.assignedTo.firstName} {activity.assignedTo.lastName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(activity.priority)}`}>
                          {getPriorityLabel(activity.priority)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getTypeLabel(activity.type)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(activity.status)}`}>
                          {getStatusLabel(activity.status)}
                        </span>
                        {activity.dueDate && (
                          <span className="text-sm text-gray-500">
                            Scadenza: {new Date(activity.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {activity.status !== 'completed' && activity.status !== 'cancelled' && (
                          <button
                            onClick={() => activity.id && handleMarkCompleted(activity.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Marca come completata"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
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

export default Activities;