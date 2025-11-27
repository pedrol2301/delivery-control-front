import { AlertTriangle, MapPin, Phone, Package } from 'lucide-react';
import type { Delivery } from '../types';

interface DeliveryListWithoutCoordinatesProps {
  deliveries: Delivery[];
}

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

export default function DeliveryListWithoutCoordinates({
  deliveries,
}: DeliveryListWithoutCoordinatesProps) {
  if (deliveries.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-6 w-6 text-yellow-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Entregas sem localização GPS ({deliveries.length})
        </h2>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
        <p className="text-sm text-yellow-800">
          As entregas abaixo não possuem coordenadas GPS cadastradas e não podem ser exibidas no
          mapa. Complete os endereços no sistema para visualização no mapa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">{delivery.customer_name}</h3>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  statusColors[delivery.status]
                }`}
              >
                {statusLabels[delivery.status]}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-gray-600">
                  <p>{delivery.delivery_address}</p>
                  <p>
                    {delivery.delivery_city} - {delivery.delivery_state}
                  </p>
                  <p>CEP: {delivery.delivery_zip_code}</p>
                  {delivery.address_reference && (
                    <p className="italic">Ref: {delivery.address_reference}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <p className="text-gray-600">{delivery.customer_phone}</p>
              </div>

              {delivery.order_number && (
                <div className="text-gray-600">
                  <span className="font-medium">Pedido:</span> {delivery.order_number}
                </div>
              )}

              {delivery.description && (
                <div className="text-gray-600 border-t pt-2 mt-2">
                  <span className="font-medium">Descrição:</span> {delivery.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
