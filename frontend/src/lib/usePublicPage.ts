import { useQuery } from '@tanstack/react-query';
import api from './api';

export type PublicPage = { id: string; slug: string; title: string; content: any; status: string } | null;

export function usePublicPage(slug: string) {
  return useQuery({
    queryKey: ['public-page', slug],
    queryFn: async () => {
      try {
        const res = await api.get('/public/page', { params: { slug } });
        return (res.data ?? null) as PublicPage;
      } catch {
        return null;
      }
    },
    staleTime: 30_000,
    retry: false,
  });
}
