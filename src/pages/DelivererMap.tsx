import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { delivererDeliveryService } from '../services/deliverer-delivery.service';
import type { Delivery } from '../types';
import DeliveryMap from '../components/DeliveryMap';
import DateSelector from '../components/DateSelector';
import DeliveryListWithoutCoordinates from '../components/DeliveryListWithoutCoordinates';
import { LogOut, Package, List, MapIcon, CheckCircle } from 'lucide-react';

export default function DelivererMap() {
  const navigate = useNavigate();
  const { deliverer, logout } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadDeliveries();
  }, [selectedDate]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await delivererDeliveryService.getMyDeliveries({
        start_date: dateStr,
        end_date: dateStr,
        per_page: 100,
      });
      setDeliveries(response.data);
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
    } finally {
      setLoading(false);
    }
  };

  const { withCoordinates, withoutCoordinates } = useMemo(() => {
    const withCoords = deliveries.filter((d) => d.latitude && d.longitude);
    const withoutCoords = deliveries.filter((d) => !d.latitude || !d.longitude);
    return { withCoordinates: withCoords, withoutCoordinates: withoutCoords };
  }, [deliveries]);

  const handleLogout = async () => {
    await logout();
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
                  <MapIcon className="h-8 w-8 text-primary-600 mb-1" />
                  Mapa de Entregas
                </div>
              </h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, {deliverer?.name} | {deliverer?.company?.name}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/deliverer/deliveries')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <List className="h-4 w-4 mr-2" />
                Ver Lista
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
        {/* Date Selector */}
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Entregas</p>
                <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Com Localização GPS</p>
                <p className="text-2xl font-bold text-green-600">{withCoordinates.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sem Localização GPS</p>
                <p className="text-2xl font-bold text-yellow-600">{withoutCoordinates.length}</p>
              </div>
              <MapIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando entregas...</p>
          </div>
        ) : deliveries.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma entrega encontrada</h3>
            <p className="text-gray-600">
              Não há entregas agendadas para {format(selectedDate, 'dd/MM/yyyy')}
            </p>
          </div>
        ) : (
          <>
            {/* Map Section */}
            {withCoordinates.length > 0 ? (
              <div className="mb-6">
                <div className="bg-white rounded-lg shadow p-4 mb-2">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Rota Otimizada ({withCoordinates.length}{' '}
                    {withCoordinates.length === 1 ? 'entrega' : 'entregas'})
                  </h2>
                  <p className="text-sm text-gray-600">
                    A rota foi calculada para minimizar a distância total percorrida. Siga a ordem
                    dos números nos marcadores.
                  </p>
                </div>
                <DeliveryMap deliveries={withCoordinates} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center mb-6">
                <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma entrega pode ser mapeada
                </h3>
                <p className="text-gray-600">
                  As entregas do dia selecionado não possuem coordenadas GPS cadastradas.
                </p>
              </div>
            )}

            {/* List of Deliveries Without Coordinates */}
            <DeliveryListWithoutCoordinates deliveries={withoutCoordinates} />
          </>
        )}
      </main>
    </div>
  );
}
