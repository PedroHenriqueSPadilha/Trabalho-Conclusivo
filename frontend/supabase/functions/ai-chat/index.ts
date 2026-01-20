import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, initialEmotion, initialMessage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Received request with', messages?.length, 'messages');

    const systemPrompt = `Você é um assistente de apoio emocional acolhedor e empático. Você está conversando com alguém que está passando por um momento difícil e está aguardando atendimento de um psicólogo.

Seu papel é:
- Acolher e validar os sentimentos da pessoa
- Oferecer suporte emocional inicial
- Fazer perguntas gentis para entender melhor como a pessoa está se sentindo
- Lembrar que um psicólogo profissional irá atendê-la em breve
- NUNCA dar diagnósticos ou conselhos médicos
- Manter respostas breves e empáticas (máximo 3-4 frases)

${initialEmotion ? `A pessoa indicou que está se sentindo: ${initialEmotion}` : ''}
${initialMessage ? `Mensagem inicial: ${initialMessage}` : ''}

Lembre-se: você é um suporte temporário enquanto o psicólogo não está disponível. Seja gentil, acolhedor e mantenha a conversa leve.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    console.log('AI response received');

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
