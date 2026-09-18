import { supabase } from './supabaseConfig';
import { CommunityPrayer, PrayerCircle } from '../store/useSpiritualStore';

/**
 * Subscribes to real-time changes in the 'community_prayers' table via Supabase Realtime.
 * Calls onUpdate whenever a prayer is added, updated, or when prayer count increments.
 */
export function subscribeToSupabaseCommunityPrayers(
  onUpdate: (prayers: CommunityPrayer[]) => void
): () => void {
  try {
    // 1. Initial Fetch
    supabase
      .from('community_prayers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!error && data) {
          const formatted: CommunityPrayer[] = data.map(mapSupabaseToCommunityPrayer);
          onUpdate(formatted);
        }
      });

    // 2. Realtime Postgres Changes Subscription
    const channel = supabase
      .channel('realtime:community_prayers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_prayers' },
        async () => {
          // Re-fetch latest prayers when any change occurs
          const { data } = await supabase
            .from('community_prayers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

          if (data) {
            onUpdate(data.map(mapSupabaseToCommunityPrayer));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Supabase subscription fallback offline:', e);
    return () => {};
  }
}

/**
 * Publishes a new community prayer burden to Supabase PostgreSQL table.
 */
export async function publishCommunityPrayerToSupabase(prayer: {
  authorName: string;
  isAnonymous: boolean;
  title: string;
  burdenText: string;
  category: string;
}) {
  try {
    const { data, error } = await supabase
      .from('community_prayers')
      .insert([
        {
          author_name: prayer.authorName,
          is_anonymous: prayer.isAnonymous,
          title: prayer.title,
          burden_text: prayer.burdenText,
          category: prayer.category,
          prayer_count: 1,
          standing_count: 0,
          support_count: 0,
          is_answered: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('Supabase insert error:', error.message);
      return null;
    }
    return data?.id;
  } catch (e) {
    console.warn('Failed to publish prayer to Supabase:', e);
    return null;
  }
}

/**
 * Atomically increments the prayer count in Supabase PostgreSQL using RPC or direct update.
 */
export async function incrementSupabaseIPrayedCount(prayerId: string) {
  try {
    // Attempt RPC increment
    const { error } = await supabase.rpc('increment_prayer_count', { row_id: prayerId });
    if (error) {
      // Fallback: fetch current count and update
      const { data } = await supabase.from('community_prayers').select('prayer_count').eq('id', prayerId).single();
      if (data) {
        await supabase
          .from('community_prayers')
          .update({ prayer_count: (data.prayer_count || 0) + 1 })
          .eq('id', prayerId);
      }
    }
  } catch (e) {
    console.warn('Failed to update Supabase prayer count:', e);
  }
}

/**
 * Creates a new private prayer circle in Supabase.
 */
export async function createCircleInSupabase(circle: Omit<PrayerCircle, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('prayer_circles')
      .insert([
        {
          name: circle.name,
          category: circle.category,
          invite_code: circle.inviteCode,
          member_count: circle.memberCount,
          description: circle.description,
          is_private: circle.isPrivate,
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('Supabase circle insert error:', error.message);
      return null;
    }
    return data?.id;
  } catch (e) {
    console.warn('Failed to create circle in Supabase:', e);
    return null;
  }
}

// Mapper Helper
function mapSupabaseToCommunityPrayer(row: any): CommunityPrayer {
  return {
    id: String(row.id),
    authorName: row.author_name || 'Believer',
    isAnonymous: !!row.is_anonymous,
    title: row.title || 'Prayer Request',
    burdenText: row.burden_text || '',
    category: row.category || 'family',
    prayerCount: row.prayer_count || 1,
    standingCount: row.standing_count || 0,
    supportCount: row.support_count || 0,
    userHasPrayed: false,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updates: row.updates || [],
    isAnswered: !!row.is_answered,
  };
}
