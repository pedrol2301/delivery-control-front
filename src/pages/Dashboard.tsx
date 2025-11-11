import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { deliveryService } from '../services/delivery.service';
import { delivererService } from '../services/deliverer.service';
import type { Delivery, Deliverer } from '../types';
import Calendar from '../components/Calendar';
import { LogOut, Plus, TrendingUp, Truck, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    deliverer_id: '',
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    delivery_city: '',
    delivery_state: '',
    delivery_zip_code: '',
    address_reference: '',
    order_number: '',
    description: '',
    value: '',
    delivery_fee: '',
    scheduled_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadDeliveries(), loadDeliverers()]);
  };

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveryService.getAll({ per_page: 1000 });
      setDeliveries(response.data);
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliverers = async () => {
    try {
      const response = await delivererService.getAll({ is_active: true, per_page: 1000 });
      setDeliverers(response.data);
    } catch (error) {
      console.error('Erro ao carregar entregadores:', error);
    }
  };

  const handleEventClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowDetailModal(true);
  };

  const handleDateClick = (date: Date) => {
    // Format date as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setFormData({
      deliverer_id: '',
      customer_name: '',
      customer_phone: '',
      delivery_address: '',
      delivery_city: '',
      delivery_state: '',
      delivery_zip_code: '',
      address_reference: '',
      order_number: '',
      description: '',
      value: '',
      delivery_fee: '',
      scheduled_date: formattedDate,
      notes: '',
    });
    setEditingDelivery(null);
    setError('');
    setShowFormModal(true);
  };

  const handleOpenFormModal = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    setFormData({
      deliverer_id: '',
      customer_name: '',
      customer_phone: '',
      delivery_address: '',
      delivery_city: '',
      delivery_state: '',
      delivery_zip_code: '',
      address_reference: '',
      order_number: '',
      description: '',
      value: '',
      delivery_fee: '',
      scheduled_date: `${year}-${month}-${day}`,
      notes: '',
    });
    setEditingDelivery(null);
    setError('');
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingDelivery(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const dataToSubmit = {
        deliverer_id: Number(formData.deliverer_id),
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        delivery_address: formData.delivery_address,
        delivery_city: formData.delivery_city,
        delivery_state: formData.delivery_state,
        delivery_zip_code: formData.delivery_zip_code,
        address_reference: formData.address_reference || undefined,
        order_number: formData.order_number || undefined,
        description: formData.description || undefined,
        value: formData.value ? Number(formData.value) : undefined,
        delivery_fee: formData.delivery_fee ? Number(formData.delivery_fee) : undefined,
        scheduled_date: formData.scheduled_date,
        notes: formData.notes || undefined,
      };

      if (editingDelivery) {
        await deliveryService.update(editingDelivery.id, dataToSubmit);
      } else {
        await deliveryService.create(dataToSubmit);
      }

      await loadDeliveries();
      handleCloseFormModal();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).flat().join(', ') ||
          'Erro ao salvar entrega'
      );
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <div className="flex space-x-2 gap-2 items-center text-primary-600">
                  <Truck className="h-8 w-8 text-primary-600 mb-1" />
                  Delivery Control
                </div>
              </h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, {user?.name} | {user?.company.name}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/deliverers"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Entregadores
              </Link>
              <button
                onClick={handleOpenFormModal}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Entrega
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
              <TrendingUp className="h-8 w-8 text-gray-400" />
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
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {deliveries.filter((d) => d.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando entregas...</p>
          </div>
        ) : (
          <Calendar
            deliveries={deliveries}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        )}
      </main>

      {/* Modal de Detalhes da Entrega */}
      {showDetailModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Detalhes da Entrega</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      statusColors[selectedDelivery.status]
                    }`}
                  >
                    {statusLabels[selectedDelivery.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-medium">{selectedDelivery.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium">{selectedDelivery.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Entregador</p>
                    <p className="font-medium">{selectedDelivery.deliverer?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pedido</p>
                    <p className="font-medium">{selectedDelivery.order_number || '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Endereço</p>
                  <p className="font-medium">
                    {selectedDelivery.delivery_address}, {selectedDelivery.delivery_city} -{' '}
                    {selectedDelivery.delivery_state}
                  </p>
                </div>

                {selectedDelivery.description && (
                  <div>
                    <p className="text-sm text-gray-600">Descrição</p>
                    <p className="font-medium">{selectedDelivery.description}</p>
                  </div>
                )}

                {selectedDelivery.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Observações</p>
                    <p className="font-medium">{selectedDelivery.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>
                <button
                  onClick={() => alert('Funcionalidade em desenvolvimento')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Editar Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulário de Entrega */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDelivery ? 'Editar Entrega' : 'Nova Entrega'}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseFormModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entregador *
                      </label>
                      <select
                        required
                        value={formData.deliverer_id}
                        onChange={(e) => setFormData({ ...formData, deliverer_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Selecione um entregador</option>
                        {deliverers.map((deliverer) => (
                          <option key={deliverer.id} value={deliverer.id}>
                            {deliverer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Agendada *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.scheduled_date}
                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número do Pedido
                      </label>
                      <input
                        type="text"
                        value={formData.order_number}
                        onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Informações do Cliente */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Cliente *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço de Entrega */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço de Entrega</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.delivery_address}
                        onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.delivery_city}
                        onChange={(e) => setFormData({ ...formData, delivery_city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={formData.delivery_state}
                        onChange={(e) =>
                          setFormData({ ...formData, delivery_state: e.target.value.toUpperCase() })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="SP"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP * (apenas números)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={8}
                        value={formData.delivery_zip_code}
                        onChange={(e) =>
                          setFormData({ ...formData, delivery_zip_code: e.target.value.replace(/\D/g, '') })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="00000000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referência
                      </label>
                      <input
                        type="text"
                        value={formData.address_reference}
                        onChange={(e) =>
                          setFormData({ ...formData, address_reference: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Próximo ao..."
                      />
                    </div>
                  </div>
                </div>

                {/* Valores */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Valores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor do Pedido
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taxa de Entrega
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.delivery_fee}
                        onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Descrição e Observações */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Observações</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Descrição do pedido..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Observações adicionais..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseFormModal}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Salvando...' : editingDelivery ? 'Atualizar' : 'Criar Entrega'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
