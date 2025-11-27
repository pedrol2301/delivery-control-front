import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { delivererDeliveryService } from '../services/deliverer-delivery.service';
import type { Delivery } from '../types';
import { LogOut, Package, MapPin, Calendar, CheckCircle, Clock, Map } from 'lucide-react';

export default function DelivererDeliveries() {
  const navigate = useNavigate();
  const { deliverer, logout } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFormData, setStatusFormData] = useState({
    status: 'in_transit' as 'in_transit' | 'delivered' | 'failed',
    delivery_proof: '',
    failure_reason: '',
  });

  useEffect(() => {
    loadDeliveries();
  }, [statusFilter]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 100 };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await delivererDeliveryService.getMyDeliveries(params);
      setDeliveries(response.data);
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    assigned: 'Atribuída',
    in_transit: 'Em trânsito',
    delivered: 'Entregue',
    failed: 'Falhou',
    cancelled: 'Cancelada',
  };

  const handleUpdateStatus = async () => {
    if (!selectedDelivery) return;

    try {
      setUpdatingStatus(true);
      await delivererDeliveryService.updateStatus(selectedDelivery.id, statusFormData);
      await loadDeliveries();
      setShowModal(false);
      setSelectedDelivery(null);
      setStatusFormData({
        status: 'in_transit',
        delivery_proof: '',
        failure_reason: '',
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da entrega');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openStatusModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setStatusFormData({
      status: delivery.status === 'assigned' ? 'in_transit' : delivery.status === 'in_transit' ? 'delivered' : 'in_transit',
      delivery_proof: '',
      failure_reason: '',
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <div className="flex space-x-2 gap-2 items-center text-primary-600">
                  <Package className="h-8 w-8 text-primary-600 mb-1" />
                  Minhas Entregas
                </div>
              </h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, {deliverer?.name} | {deliverer?.company?.name}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/deliverer/map')}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary-700"
              >
                <Map className="h-4 w-4 mr-2" />
                Ver Mapa
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atribuídas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {deliveries.filter((d) => d.status === 'assigned').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em trânsito</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {deliveries.filter((d) => d.status === 'in_transit').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entregues</p>
                <p className="text-2xl font-bold text-green-600">
                  {deliveries.filter((d) => d.status === 'delivered').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filtrar por status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="assigned">Atribuídas</option>
              <option value="in_transit">Em trânsito</option>
              <option value="delivered">Entregues</option>
              <option value="failed">Falhadas</option>
            </select>
          </div>
        </div>

        {/* Deliveries List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando entregas...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma entrega encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {delivery.customer_name}
                      </h3>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          statusColors[delivery.status]
                        }`}
                      >
                        {statusLabels[delivery.status]}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {delivery.delivery_address}, {delivery.delivery_city} - {delivery.delivery_state}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Data: {new Date(delivery.scheduled_date).toLocaleDateString('pt-BR')}
                      </div>
                      {delivery.description && (
                        <p className="text-sm text-gray-600">Descrição: {delivery.description}</p>
                      )}
                      {delivery.notes && (
                        <p className="text-sm text-gray-600">Observações: {delivery.notes}</p>
                      )}
                    </div>
                  </div>
                  {(delivery.status === 'assigned' || delivery.status === 'in_transit') && (
                    <button
                      onClick={() => openStatusModal(delivery)}
                      className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                    >
                      Atualizar Status
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Atualização de Status */}
      {showModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Atualizar Status</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Entrega para:</p>
                <p className="font-medium">{selectedDelivery.customer_name}</p>
                <p className="text-sm text-gray-600">{selectedDelivery.delivery_address}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Novo Status
                  </label>
                  <select
                    value={statusFormData.status}
                    onChange={(e) =>
                      setStatusFormData({
                        ...statusFormData,
                        status: e.target.value as 'in_transit' | 'delivered' | 'failed',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="in_transit">Em trânsito</option>
                    <option value="delivered">Entregue</option>
                    <option value="failed">Falhou</option>
                  </select>
                </div>

                {statusFormData.status === 'delivered' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comprovante de Entrega (opcional)
                    </label>
                    <textarea
                      value={statusFormData.delivery_proof}
                      onChange={(e) =>
                        setStatusFormData({ ...statusFormData, delivery_proof: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                      placeholder="Descreva o comprovante ou adicione observações"
                    />
                  </div>
                )}

                {statusFormData.status === 'failed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivo da Falha
                    </label>
                    <textarea
                      value={statusFormData.failure_reason}
                      onChange={(e) =>
                        setStatusFormData({ ...statusFormData, failure_reason: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                      placeholder="Descreva o motivo da falha"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={updatingStatus}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Atualizando...' : 'Atualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
