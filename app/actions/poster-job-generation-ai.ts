"use server"

import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateJobDetailsWithAIAction(prompt: string) {
  try {
    if (!prompt) return { success: false, error: "Prompt is required" }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert HR recruiter. Generate a professional job posting based on the user's prompt. 
          Return ONLY a valid JSON object with the following fields:
          - title: A professional job title.
          - category: One of "it", "marketing", "sales", "operations", "human_resources".
          - type: One of "Full-time", "Part-time", "Contract", "Internship".
          - description: A detailed, engaging job description (at least 150 words).
          - requirements: A bulleted list of 5-7 key skills and qualifications.
          
          Do not include markdown formatting or extra text. Just the JSON.`
        },
        {
          role: "user",
          content: `Create a job posting for: ${prompt}`
        }
      ],
      // UPDATED MODEL HERE
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error("No content generated")

    // Clean and parse JSON
    const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim()
    
    let jobData;
    try {
      jobData = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      throw new Error("AI returned invalid data format")
    }

    return { success: true, data: jobData }

  } catch (error: any) {
    console.error("AI Generation Error:", error)
    return { success: false, error: "Failed to generate content. Please try again." }
  }
}