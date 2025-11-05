import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, latitude, longitude, radius = 3000 } = await req.json();
    const apiKey = Deno.env.get("FOURSQUARE_API_KEY");

    if (!apiKey) {
      throw new Error("FOURSQUARE_API_KEY not configured");
    }

    let url = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(query)}&limit=10`;
    
    if (latitude && longitude) {
      url += `&ll=${latitude},${longitude}&radius=${radius}`;
    }

    const response = await fetch(url, {
      headers: {
        "Authorization": apiKey,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Foursquare API error:", response.status, errorText);
      throw new Error(`Foursquare API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in search-places function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
