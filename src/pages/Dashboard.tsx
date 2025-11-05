import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { deliveryService } from '../services/delivery.service';
import type { Delivery } from '../types';
import Calendar from '../components/Calendar';
import { LogOut, Plus, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, []);

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

  const handleEventClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowModal(true);
  };

  const handleDateClick = (date: Date) => {
    console.log('Data clicada:', date);
    // Aqui você pode abrir um modal para criar uma nova entrega nesta data
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
              <h1 className="text-2xl font-bold text-gray-900">Delivery Control</h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, {user?.name} | {user?.company.name}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => alert('Funcionalidade em desenvolvimento')}
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
      {showModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Detalhes da Entrega</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
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
                  onClick={() => setShowModal(false)}
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
    </div>
  );
}
