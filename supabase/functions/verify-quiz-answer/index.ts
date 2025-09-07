import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  lesson_id: string;
  user_answer_index: number;
  question_index: number;
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
    const { lesson_id, user_answer_index, question_index }: RequestBody = await req.json();

    if (!lesson_id || user_answer_index === undefined || question_index === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch lesson data
    const { data: lesson, error: lessonError } = await supabaseClient
      .from('lessons')
      .select('quiz_questions, xp_reward')
      .eq('id', lesson_id)
      .single();

    if (lessonError || !lesson) {
      return new Response(
        JSON.stringify({ error: 'Lesson not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the specific question
    const questions = lesson.quiz_questions as Array<{ correct: number }>;
    if (question_index >= questions.length) {
      return new Response(
        JSON.stringify({ error: 'Invalid question index' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const question = questions[question_index];
    const isCorrect = user_answer_index === question.correct;

    if (isCorrect) {
      // Calculate XP reward (divide total lesson XP by number of questions)
      const xpPerQuestion = Math.floor(lesson.xp_reward / questions.length);
      
      // Increment user XP
      const { error: xpError } = await supabaseClient
        .from('profiles')
        .update({ 
          xp: supabaseClient.sql`xp + ${xpPerQuestion}`
        })
        .eq('id', user.id);

      if (xpError) {
        console.error('Error updating XP:', xpError);
        return new Response(
          JSON.stringify({ error: 'Failed to update XP' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check for level up after XP update
      try {
        const { data: levelData } = await supabaseClient.functions.invoke('update-user-level', {
          body: { user_id: user.id }
        });
        
        return new Response(
          JSON.stringify({ 
            correct: true, 
            xp_reward: xpPerQuestion,
            levelUp: levelData?.leveledUp || false,
            newLevel: levelData?.newLevel,
            newRankTitle: levelData?.newRankTitle
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (levelError) {
        console.error('Error checking level up:', levelError);
        // Still return success for XP, even if level check fails
        return new Response(
          JSON.stringify({ 
            correct: true, 
            xp_reward: xpPerQuestion,
            levelUp: false
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ correct: false }),
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