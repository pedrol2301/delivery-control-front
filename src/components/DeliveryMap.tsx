import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L, { LatLngBounds } from 'leaflet';
import type { Delivery } from '../types';
import { optimizeRoute } from '../utils/routeOptimizer';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet no Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface DeliveryMapProps {
  deliveries: Delivery[];
}

const statusColors: Record<string, string> = {
  pending: '#6B7280',
  assigned: '#3B82F6',
  in_transit: '#EAB308',
  delivered: '#10B981',
  failed: '#EF4444',
  cancelled: '#9CA3AF',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  assigned: 'Atribuída',
  in_transit: 'Em trânsito',
  delivered: 'Entregue',
  failed: 'Falhou',
  cancelled: 'Cancelada',
};

// Componente para ajustar bounds automaticamente
function FitBoundsComponent({ deliveries }: { deliveries: Delivery[] }) {
  const map = useMap();

  useEffect(() => {
    if (deliveries.length > 0) {
      const bounds = new LatLngBounds(
        deliveries.map((d) => [d.latitude!, d.longitude!])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [deliveries, map]);

  return null;
}

// Cria ícone numerado personalizado
const createNumberedIcon = (number: number, status: string) => {
  const color = statusColors[status] || '#2563eb';

  return L.divIcon({
    className: 'numbered-marker',
    html: `<div style="background-color: ${color}; border: 3px solid white; border-radius: 50%; color: white; font-weight: bold; text-align: center; line-height: 30px; width: 30px; height: 30px;">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

export default function DeliveryMap({ deliveries }: DeliveryMapProps) {
  // Otimiza a rota usando algoritmo Greedy Nearest Neighbor
  const optimizedDeliveries = useMemo(() => {
    return optimizeRoute(deliveries);
  }, [deliveries]);

  // Cria array de coordenadas para a polyline
  const routeCoordinates = useMemo(() => {
    return optimizedDeliveries.map((d) => [d.latitude!, d.longitude!] as [number, number]);
  }, [optimizedDeliveries]);

  // Centro padrão (São Paulo)
  const defaultCenter: [number, number] = [-23.5505, -46.6333];
  const center: [number, number] =
    optimizedDeliveries.length > 0
      ? [optimizedDeliveries[0].latitude!, optimizedDeliveries[0].longitude!]
      : defaultCenter;

  if (deliveries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ajusta bounds automaticamente */}
        <FitBoundsComponent deliveries={optimizedDeliveries} />

        {/* Linha da rota otimizada */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#2563eb"
            weight={3}
            opacity={0.7}
            dashArray="10, 5"
          />
        )}

        {/* Marcadores numerados para cada entrega */}
        {optimizedDeliveries.map((delivery, index) => (
          <Marker
            key={delivery.id}
            position={[delivery.latitude!, delivery.longitude!]}
            icon={createNumberedIcon(index + 1, delivery.status)}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">Entrega #{index + 1}</h3>
                  <span
                    className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor:
                        delivery.status === 'assigned'
                          ? '#DBEAFE'
                          : delivery.status === 'in_transit'
                          ? '#FEF3C7'
                          : delivery.status === 'delivered'
                          ? '#D1FAE5'
                          : delivery.status === 'failed'
                          ? '#FEE2E2'
                          : '#F3F4F6',
                      color:
                        delivery.status === 'assigned'
                          ? '#1E40AF'
                          : delivery.status === 'in_transit'
                          ? '#92400E'
                          : delivery.status === 'delivered'
                          ? '#065F46'
                          : delivery.status === 'failed'
                          ? '#991B1B'
                          : '#374151',
                    }}
                  >
                    {statusLabels[delivery.status]}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Cliente:</span>
                    <br />
                    {delivery.customer_name}
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Endereço:</span>
                    <br />
                    {delivery.delivery_address}
                    <br />
                    {delivery.delivery_city} - {delivery.delivery_state}
                  </div>

                  {delivery.address_reference && (
                    <div>
                      <span className="font-semibold text-gray-700">Referência:</span>
                      <br />
                      {delivery.address_reference}
                    </div>
                  )}

                  <div>
                    <span className="font-semibold text-gray-700">Telefone:</span>
                    <br />
                    {delivery.customer_phone}
                  </div>

                  {delivery.order_number && (
                    <div>
                      <span className="font-semibold text-gray-700">Pedido:</span>{' '}
                      {delivery.order_number}
                    </div>
                  )}

                  {delivery.description && (
                    <div>
                      <span className="font-semibold text-gray-700">Descrição:</span>
                      <br />
                      {delivery.description}
                    </div>
                  )}

                  {delivery.notes && (
                    <div className="border-t pt-2 mt-2">
                      <span className="font-semibold text-gray-700">Observações:</span>
                      <br />
                      {delivery.notes}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
