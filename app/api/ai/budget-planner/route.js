import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || !prompt) {
      return NextResponse.json({ reply: "Gemini API key or prompt is missing." }, { status: 400 });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ reply: data?.error?.message || "Gemini request failed." }, { status: 500 });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json({ reply: "Gemini request failed." }, { status: 500 });
  }
}
