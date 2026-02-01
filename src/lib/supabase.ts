/**
 * Supabase Client Configuration
 *
 * For Familie-modus (shared shopping lists)
 *
 * Setup instructions:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Add these environment variables to .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=your-project-url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 * 3. Run the SQL in supabase-schema.sql to create the tables
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types for shared shopping lists
export interface SharedList {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  items: SharedListItem[];
  share_code: string;
}

export interface SharedListItem {
  id: string;
  name: string;
  checked: boolean;
  barcode?: string;
  imageUrl?: string;
  addedBy?: string;
  addedAt: string;
}

// Supabase client singleton
let supabase: SupabaseClient | null = null;

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Get the Supabase client (lazy initialization)
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return supabase;
}

/**
 * Generate a random share code (6 characters)
 */
export function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new shared list
 */
export async function createSharedList(name: string, items: SharedListItem[]): Promise<SharedList | null> {
  const client = getSupabase();
  if (!client) return null;

  const shareCode = generateShareCode();

  const { data, error } = await client
    .from('shared_lists')
    .insert({
      name,
      items,
      share_code: shareCode,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating shared list:', error);
    return null;
  }

  return data;
}

/**
 * Get a shared list by share code
 */
export async function getSharedListByCode(shareCode: string): Promise<SharedList | null> {
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('shared_lists')
    .select('*')
    .eq('share_code', shareCode.toUpperCase())
    .single();

  if (error) {
    console.error('Error getting shared list:', error);
    return null;
  }

  return data;
}

/**
 * Update a shared list's items
 */
export async function updateSharedList(listId: string, items: SharedListItem[]): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const { error } = await client
    .from('shared_lists')
    .update({
      items,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listId);

  if (error) {
    console.error('Error updating shared list:', error);
    return false;
  }

  return true;
}

/**
 * Subscribe to real-time changes on a shared list
 */
export function subscribeToSharedList(
  listId: string,
  callback: (list: SharedList) => void
): (() => void) | null {
  const client = getSupabase();
  if (!client) return null;

  const subscription = client
    .channel(`shared_list_${listId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'shared_lists',
        filter: `id=eq.${listId}`,
      },
      (payload) => {
        callback(payload.new as SharedList);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Delete a shared list
 */
export async function deleteSharedList(listId: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const { error } = await client
    .from('shared_lists')
    .delete()
    .eq('id', listId);

  if (error) {
    console.error('Error deleting shared list:', error);
    return false;
  }

  return true;
}
