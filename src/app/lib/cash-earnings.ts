import { createClient } from './supabase/client';
import type { CashEarning } from '@/types/database';

export interface CashEarningsEvent {
  dateISO: string;
  amountEur: number;
  note?: string | null;
}

export async function getProviderCashEarnings(providerId: string): Promise<CashEarning[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cash_earnings')
    .select('*')
    .eq('provider_id', providerId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching cash earnings:', error);
    return [];
  }

  return (data || []) as CashEarning[];
}

export async function getProviderCashEarningsEvents(providerId: string): Promise<CashEarningsEvent[]> {
  const rows = await getProviderCashEarnings(providerId);
  return rows.map((r) => ({
    dateISO: r.earned_at,
    amountEur: Number(r.amount_eur || 0),
    note: r.note,
  }));
}

export async function addProviderCashEarning(input: {
  providerId: string;
  amountEur: number;
  earnedAtISO: string;
  note?: string;
}): Promise<CashEarning | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cash_earnings')
    .insert({
      provider_id: input.providerId,
      amount_eur: input.amountEur,
      earned_at: input.earnedAtISO,
      note: input.note || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting cash earning:', error);
    return null;
  }

  return data as CashEarning;
}


