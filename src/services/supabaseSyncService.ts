import { supabase, isSupabaseConfigured } from './supabaseConfig';
import { CommunityPrayer, PrayerCircle } from '../store/useSpiritualStore';

/**
 * Subscribes to real-time changes in the 'community_prayers' table via Supabase Realtime.
 * Calls onUpdate whenever a prayer is added, updated, or when prayer count increments.
 */
export function subscribeToSupabaseCommunityPrayers(
  onUpdate: (prayers: CommunityPrayer[]) => void
): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }
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
  if (!isSupabaseConfigured()) return null;
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
          is_reported: false,
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
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.rpc('increment_prayer_count', { row_id: prayerId });
    if (error) {
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
 * Atomically increments the standing_count in Supabase.
 */
export async function incrementSupabaseStandingCount(prayerId: string) {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.rpc('increment_standing_count', { row_id: prayerId });
    if (error) {
      const { data } = await supabase.from('community_prayers').select('standing_count').eq('id', prayerId).single();
      if (data) {
        await supabase
          .from('community_prayers')
          .update({ standing_count: (data.standing_count || 0) + 1 })
          .eq('id', prayerId);
      }
    }
  } catch (e) {
    console.warn('Failed to update Supabase standing count:', e);
  }
}

/**
 * Creates a new private prayer circle in Supabase.
 */
export async function createCircleInSupabase(circle: Omit<PrayerCircle, 'id'>) {
  if (!isSupabaseConfigured()) return null;
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

/**
 * Queries Supabase for a prayer circle by its unique invite code.
 * Enables users on different phones to join circles created by friends.
 */
export async function findCircleByInviteCode(inviteCode: string): Promise<PrayerCircle | null> {
  if (!isSupabaseConfigured() || !inviteCode) return null;
  try {
    // 1. Try RPC lookup
    const { data: rpcData, error: rpcError } = await supabase.rpc('find_prayer_circle_by_code', {
      code_str: inviteCode.trim().toUpperCase(),
    });

    if (!rpcError && rpcData && rpcData.length > 0) {
      const row = rpcData[0];
      return mapSupabaseToPrayerCircle(row);
    }

    // 2. Direct query fallback
    const { data, error } = await supabase
      .from('prayer_circles')
      .select('*')
      .ilike('invite_code', inviteCode.trim())
      .single();

    if (!error && data) {
      return mapSupabaseToPrayerCircle(data);
    }
    return null;
  } catch (e) {
    console.warn('Failed to query circle by code in Supabase:', e);
    return null;
  }
}

/**
 * Increments the member count of a prayer circle when a user joins.
 */
export async function incrementCircleMemberCount(circleId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.rpc('increment_circle_member_count', { circle_id: circleId });
    if (error) {
      const { data } = await supabase.from('prayer_circles').select('member_count').eq('id', circleId).single();
      if (data) {
        await supabase
          .from('prayer_circles')
          .update({ member_count: (data.member_count || 1) + 1 })
          .eq('id', circleId);
      }
    }
  } catch (e) {
    console.warn('Failed to increment circle member count:', e);
  }
}

/**
 * Reports a prayer burden for community moderation.
 */
export async function reportPrayerToSupabase(prayerId: string, reason: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.rpc('report_prayer_burden', {
      prayer_id: prayerId,
      reason_str: reason,
    });
    if (error) {
      await supabase
        .from('community_prayers')
        .update({ is_reported: true, report_reason: reason })
        .eq('id', prayerId);
    }
    return true;
  } catch (e) {
    console.warn('Failed to report prayer to Supabase:', e);
    return false;
  }
}

/**
 * Fetches reported prayers for admin review.
 */
export async function fetchReportedPrayersFromSupabase(): Promise<CommunityPrayer[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('community_prayers')
      .select('*')
      .eq('is_reported', true)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      return data.map(mapSupabaseToCommunityPrayer);
    }
    return [];
  } catch (e) {
    console.warn('Failed to fetch reported prayers from Supabase:', e);
    return [];
  }
}

/**
 * Approves and unflags a reported prayer.
 */
export async function approveReportedPrayerInSupabase(prayerId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('community_prayers')
      .update({ is_reported: false, report_reason: null })
      .eq('id', prayerId);
    return !error;
  } catch (e) {
    return false;
  }
}

/**
 * Deletes an inappropriate prayer from Supabase.
 */
export async function deletePrayerFromSupabase(prayerId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('community_prayers').delete().eq('id', prayerId);
    return !error;
  } catch (e) {
    return false;
  }
}

// Mapper Helpers
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
    isReported: !!row.is_reported,
    reportReason: row.report_reason || undefined,
  };
}

function mapSupabaseToPrayerCircle(row: any): PrayerCircle {
  return {
    id: String(row.id),
    name: row.name || 'Prayer Circle',
    category: row.category || 'family',
    inviteCode: row.invite_code || '',
    memberCount: row.member_count || 1,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    description: row.description || '',
    isPrivate: !!row.is_private,
  };
}
