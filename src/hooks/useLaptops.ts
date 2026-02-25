/**
 * useLaptops — Laptop inventory management hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Laptop {
  id: string;
  label: string;
  make?: string;
  model?: string;
  serial_number?: string;
  condition: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined from active checkout
  current_checkout?: LaptopCheckout | null;
}

export interface LaptopCheckout {
  id: string;
  laptop_id: string;
  checked_out_to: string;
  checked_out_to_email?: string;
  event_id?: string;
  checked_out_at: string;
  checked_out_by?: string;
  returned_at?: string;
  returned_to?: string;
  condition_on_return?: string;
  notes?: string;
  created_at: string;
}

/** All laptops with their current checkout status */
export function useLaptops() {
  return useQuery({
    queryKey: ['laptops'],
    queryFn: async () => {
      const { data: laptops, error } = await supabase
        .from('laptops')
        .select('*')
        .order('label', { ascending: true });

      if (error) throw error;

      // Get active checkouts for all laptops
      const { data: activeCheckouts, error: checkoutError } = await supabase
        .from('laptop_checkouts')
        .select('*')
        .is('returned_at', null);

      if (checkoutError) throw checkoutError;

      const checkoutMap = new Map<string, LaptopCheckout>();
      (activeCheckouts || []).forEach((c: any) => {
        checkoutMap.set(c.laptop_id, c as LaptopCheckout);
      });

      return (laptops || []).map((laptop: any) => ({
        ...laptop,
        current_checkout: checkoutMap.get(laptop.id) || null,
      })) as Laptop[];
    },
    refetchInterval: 10000,
  });
}

/** Checkout history for a specific laptop */
export function useLaptopHistory(laptopId: string | undefined) {
  return useQuery({
    queryKey: ['laptop-history', laptopId],
    queryFn: async () => {
      if (!laptopId) return [];
      const { data, error } = await supabase
        .from('laptop_checkouts')
        .select('*')
        .eq('laptop_id', laptopId)
        .order('checked_out_at', { ascending: false });

      if (error) throw error;
      return (data || []) as LaptopCheckout[];
    },
    enabled: !!laptopId,
  });
}

/** Add a new laptop to inventory */
export function useCreateLaptop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (laptop: {
      label: string;
      make?: string;
      model?: string;
      serial_number?: string;
      condition?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('laptops')
        .insert(laptop)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laptops'] });
    },
  });
}

/** Check out a laptop to someone */
export function useCheckOutLaptop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      laptopId,
      checkedOutTo,
      email,
      eventId,
      userId,
    }: {
      laptopId: string;
      checkedOutTo: string;
      email?: string;
      eventId?: string;
      userId?: string;
    }) => {
      const { data, error } = await supabase
        .from('laptop_checkouts')
        .insert({
          laptop_id: laptopId,
          checked_out_to: checkedOutTo,
          checked_out_to_email: email || null,
          event_id: eventId || null,
          checked_out_by: userId || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as LaptopCheckout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laptops'] });
    },
  });
}

/** Return a laptop */
export function useReturnLaptop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      checkoutId,
      userId,
      conditionOnReturn,
      notes,
    }: {
      checkoutId: string;
      userId?: string;
      conditionOnReturn?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('laptop_checkouts')
        .update({
          returned_at: new Date().toISOString(),
          returned_to: userId || null,
          condition_on_return: conditionOnReturn || null,
          notes: notes || null,
        })
        .eq('id', checkoutId)
        .select()
        .single();
      if (error) throw error;
      return data as LaptopCheckout;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['laptops'] });
      queryClient.invalidateQueries({ queryKey: ['laptop-history'] });
    },
  });
}
