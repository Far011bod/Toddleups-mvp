import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  user_id: string;
}

interface LevelThreshold {
  level: number;
  xpRequired: number;
  rankTitle: string;
}

// Define XP thresholds and rank titles
const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, xpRequired: 0, rankTitle: 'آموزنده تازه‌کار' },
  { level: 2, xpRequired: 100, rankTitle: 'ابزارشناس' },
  { level: 3, xpRequired: 250, rankTitle: 'مهارت‌جوی حرفه‌ای' },
  { level: 4, xpRequired: 500, rankTitle: 'استاد نرم‌افزار' },
  { level: 5, xpRequired: 1000, rankTitle: 'افسانه دیجیتال' },
];

function calculateLevelFromXP(xp: number): { level: number; rankTitle: string } {
  // Find the highest level the user qualifies for
  let currentLevel = 1;
  let currentRankTitle = 'آموزنده تازه‌کار';
  
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.xpRequired) {
      currentLevel = threshold.level;
      currentRankTitle = threshold.rankTitle;
    } else {
      break;
    }
  }
  
  return { level: currentLevel, rankTitle: currentRankTitle };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { user_id }: RequestBody = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Ensure user can only update their own level
    if (user.id !== user_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to update this user' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch user's current data
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('xp, level, rank_title')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate new level based on current XP
    const { level: newLevel, rankTitle: newRankTitle } = calculateLevelFromXP(profile.xp);
    
    // Check if user leveled up
    const leveledUp = newLevel > profile.level;
    
    if (leveledUp) {
      // Update user's level and rank title
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ 
          level: newLevel,
          rank_title: newRankTitle
        })
        .eq('id', user_id);

      if (updateError) {
        console.error('Error updating user level:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update user level' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          leveledUp: true,
          oldLevel: profile.level,
          newLevel: newLevel,
          newRankTitle: newRankTitle
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          leveledUp: false,
          currentLevel: profile.level,
          currentRankTitle: profile.rank_title
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});