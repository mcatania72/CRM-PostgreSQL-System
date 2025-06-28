import React, { useState, useEffect } from 'react';
import { customerService, Customer } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    company: '',
    industry: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    state: '',
    country: '',
    status: 'prospect',
    notes: '',
    estimatedValue: undefined,
    website: '',
    employeeCount: undefined
  });

  const statusOptions = [
    { value: 'prospect', label: 'Prospect', color: 'yellow' },
    { value: 'active', label: 'Attivo', color: 'green' },
    { value: 'inactive', label: 'Inattivo', color: 'gray' },
    { value: 'lost', label: 'Perso', color: 'red' },
  ];

  useEffect(() => {
    loadCustomers();
  }, [searchTerm, statusFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      const response = await customerService.getAll(params);
      setCustomers(response.customers || response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore nel caricamento clienti');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer?: Customer) => {
    setEditingCustomer(customer || null);
    if (customer) {
      setFormData({
        name: customer.name || '',
        company: customer.company || '',
        industry: customer.industry || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        postalCode: customer.postalCode || '',
        state: customer.state || '',
        country: customer.country || '',
        status: customer.status || 'prospect',
        notes: customer.notes || '',
        estimatedValue: customer.estimatedValue || undefined,
        website: customer.website || '',
        employeeCount: customer.employeeCount || undefined
      });
    } else {
      setFormData({
        name: '',
        company: '',
        industry: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        state: '',
        country: '',
        status: 'prospect',
        notes: '',
        estimatedValue: undefined,
        website: '',
        employeeCount: undefined
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      company: '',
      industry: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      state: '',
      country: '',
      status: 'prospect',
      notes: '',
      estimatedValue: undefined,
      website: '',
      employeeCount: undefined
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Il nome è obbligatorio');
      return;
    }

    try {
      // Pulisci campi vuoti
      const cleanedData = Object.keys(formData).reduce((acc, key) => {
        const value = formData[key as keyof Customer];
        if (value === '' || value === undefined) {
          acc[key as keyof Customer] = undefined;
        } else {
          acc[key as keyof Customer] = value;
        }
        return acc;
      }, {} as any);

      if (editingCustomer) {
        await customerService.update(editingCustomer.id!, cleanedData);
      } else {
        await customerService.create(cleanedData);
      }
      
      handleCloseModal();
      loadCustomers();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore nel salvataggio cliente');
    }
  };

  const handleDelete = async (customer: Customer) => {
    const confirmMessage = `Sei sicuro di voler eliminare il cliente "${customer.name}"?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await customerService.delete(customer.id!);
      loadCustomers();
      setError('');
    } catch (err: any) {
      if (err.response?.status === 409) {
        const errorData = err.response.data;
        const dependencyMessage = `Impossibile eliminare il cliente "${errorData.details?.customerName}".\n\nIl cliente ha i seguenti dati collegati:\n• ${errorData.dependencies}\n\n${errorData.suggestion}`;
        setError(dependencyMessage);
      } else {
        setError(err.response?.data?.message || 'Errore nell\'eliminazione cliente');
      }
    }
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsViewModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[statusOption?.color as keyof typeof colors] || colors.gray;
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.label || status;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clienti</h1>
            <p className="text-gray-600">Gestisci i tuoi clienti e le loro informazioni</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuovo Cliente
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex justify-between items-start">
            <p className="text-red-800 whitespace-pre-line">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cerca clienti..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tutti gli stati</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            Totale: {customers.length} clienti
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contatto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Settore
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valore Stimato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nessun cliente trovato
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        {customer.company && (
                          <div className="text-sm text-gray-500">
                            {customer.company}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {customer.email && (
                          <div className="text-sm text-gray-900">
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="text-sm text-gray-500">
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.industry || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(customer.status)}`}>
                        {getStatusLabel(customer.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.estimatedValue ? formatCurrency(customer.estimatedValue) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleView(customer)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Visualizza"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(customer)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="Modifica"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="text-red-600 hover:text-red-800"
                        title="Elimina"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCustomer ? 'Modifica Cliente' : 'Nuovo Cliente'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome *</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Azienda</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.company || ''}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefono</label>
                    <input
                      type="tel"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Settore</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.industry || ''}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status *</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.status || 'prospect'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Customer['status'] })}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="url"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valore Stimato (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.estimatedValue || ''}
                      onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Numero Dipendenti</label>
                    <input
                      type="number"
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.employeeCount || ''}
                      onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Città</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CAP</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.postalCode || ''}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stato/Provincia</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Paese</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.country || ''}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Indirizzo</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Note</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    {editingCustomer ? 'Aggiorna' : 'Crea'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Dettagli Cliente
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{viewingCustomer.name}</h4>
                  {viewingCustomer.company && (
                    <p className="text-gray-600">{viewingCustomer.company}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-gray-900">{viewingCustomer.email || 'Non specificato'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Telefono:</span>
                    <p className="text-gray-900">{viewingCustomer.phone || 'Non specificato'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Settore:</span>
                    <p className="text-gray-900">{viewingCustomer.industry || 'Non specificato'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(viewingCustomer.status)}`}>
                      {getStatusLabel(viewingCustomer.status)}
                    </span>
                  </div>
                  {viewingCustomer.website && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Website:</span>
                      <p className="text-blue-600 hover:text-blue-800">
                        <a href={viewingCustomer.website} target="_blank" rel="noopener noreferrer">
                          {viewingCustomer.website}
                        </a>
                      </p>
                    </div>
                  )}
                  {viewingCustomer.estimatedValue && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Valore Stimato:</span>
                      <p className="text-gray-900">{formatCurrency(viewingCustomer.estimatedValue)}</p>
                    </div>
                  )}
                  {viewingCustomer.employeeCount && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Dipendenti:</span>
                      <p className="text-gray-900">{viewingCustomer.employeeCount}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Città:</span>
                    <p className="text-gray-900">{viewingCustomer.city || 'Non specificato'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Paese:</span>
                    <p className="text-gray-900">{viewingCustomer.country || 'Non specificato'}</p>
                  </div>
                </div>
                
                {viewingCustomer.address && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Indirizzo:</span>
                    <p className="text-gray-900">{viewingCustomer.address}</p>
                  </div>
                )}
                
                {viewingCustomer.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Note:</span>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingCustomer.notes}</p>
                  </div>
                )}
                
                {viewingCustomer.createdAt && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Data creazione:</span>
                    <p className="text-gray-900">
                      {new Date(viewingCustomer.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                >
                  Chiudi
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenModal(viewingCustomer);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Modifica
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;