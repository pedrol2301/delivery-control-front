export interface Coordinate {
  latitude?: number;
  longitude?: number;
}

/**
 * Calcula a distância haversine entre dois pontos geográficos
 * @param coord1 Primeira coordenada
 * @param coord2 Segunda coordenada
 * @returns Distância em quilômetros
 */
function haversineDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(coord2.latitude! - coord1.latitude!);
  const dLon = toRad(coord2.longitude! - coord1.longitude!);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude!)) *
      Math.cos(toRad(coord2.latitude!)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converte graus para radianos
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Otimiza a rota de entregas usando o algoritmo Greedy Nearest Neighbor
 * Complexidade: O(n²), eficiente para até ~200 entregas
 *
 * @param deliveries Array de entregas com coordenadas
 * @returns Array de entregas ordenadas na rota otimizada
 */
export function optimizeRoute<T extends Coordinate>(deliveries: T[]): T[] {
  if (deliveries.length <= 1) return deliveries;

  const unvisited = [...deliveries];
  const route: T[] = [];

  // Inicia com a primeira entrega
  let current = unvisited.shift()!;
  route.push(current);

  // Sempre escolhe a próxima entrega mais próxima não visitada
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    unvisited.forEach((delivery, index) => {
      const distance = haversineDistance(current, delivery);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    current = unvisited.splice(nearestIndex, 1)[0];
    route.push(current);
  }

  return route;
}
