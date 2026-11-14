import { useQuery } from '@tanstack/react-query';
import { getOrderHistory } from '../api/analyses';

export const useOrderHistory = (orderId: string | null, limit = 50) =>
  useQuery({
    queryKey: ['order-history', orderId, limit],
    queryFn: () => getOrderHistory(orderId!, limit),
    enabled: !!orderId && orderId.length > 0,
  });
