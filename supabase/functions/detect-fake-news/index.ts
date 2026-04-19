// XFake — fake news detection edge function
// Uses Lovable AI Gateway (Gemini vision) to analyze image + text and return verdict.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are XFake, a multilingual multimodal fake-news classifier inspired by a CrossLingualVision multi-encoder approach.

You are given a news claim (text, possibly non-English) and an associated image. You must judge whether the news item is most likely REAL or FAKE.

Consider:
- Internal consistency between the image and the text claim.
- Visual signs of manipulation, AI-generation, miscaptioning, or out-of-context reuse.
- Sensational, emotionally manipulative, or unverifiable language.
- Named entities, dates, and locations — do they plausibly fit?
- For non-English text, reason in that language internally but reply in English.

You MUST call the function 'submit_verdict' exactly once with your structured judgment. Never reply in plain text.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, imageBase64, imageMimeType } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Please provide news text (at least 3 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!imageBase64 || !imageMimeType) {
      return new Response(
        JSON.stringify({ error: "Please attach an image." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageDataUrl = `data:${imageMimeType};base64,${imageBase64}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: `News claim:\n"""${text}"""\n\nAnalyze the attached image alongside this claim and return your verdict.` },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_verdict",
              description: "Submit the fake news verdict.",
              parameters: {
                type: "object",
                properties: {
                  verdict: { type: "string", enum: ["REAL", "FAKE"], description: "Final classification." },
                  confidence: { type: "number", minimum: 0, maximum: 1, description: "Confidence 0-1." },
                  detected_language: { type: "string", description: "Language of the input text (e.g. English, Chinese, Hindi)." },
                  reasoning: { type: "string", description: "2-4 sentences explaining the verdict." },
                  red_flags: { type: "array", items: { type: "string" }, description: "Specific suspicious signals (empty if none)." },
                  image_text_consistency: {
                    type: "string",
                    enum: ["consistent", "partially_consistent", "inconsistent"],
                    description: "How well the image matches the textual claim.",
                  },
                },
                required: ["verdict", "confidence", "detected_language", "reasoning", "red_flags", "image_text_consistency"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_verdict" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      return new Response(JSON.stringify({ error: "AI service error." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call returned:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Could not parse AI response." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const verdict = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(verdict), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("detect-fake-news error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
