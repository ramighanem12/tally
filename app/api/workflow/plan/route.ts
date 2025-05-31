import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { workflowDescription, workflowTitle } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a workflow planning expert. Break down workflows into clear, logical steps that an AI agent would perform.
          
Rules for steps:
- Write steps as ongoing actions using -ing verbs (e.g., "Analyzing", "Calculating", "Generating")
- Each step should describe an AI action, not user actions (no uploading/downloading)
- Steps should be concise but descriptive
- Steps should be in chronological order
- Include 3-7 steps total
- Focus on analysis, processing, and generation tasks

Good examples:
- "Analyzing financial statements"
- "Calculating tax implications"
- "Identifying compliance requirements"
- "Generating summary report"
- "Preparing final documentation"

Bad examples:
- "Upload documents" (user action)
- "Download report" (user action)
- "Review" (too vague)
- "Complete analysis" (not -ing form)

Return a JSON object with a 'steps' array containing step objects. Example:
{
  "steps": [
    { "name": "Analyzing financial statements" },
    { "name": "Calculating tax implications" },
    { "name": "Preparing compliance documentation" }
  ]
}`
        },
        {
          role: "user",
          content: `Create steps for this workflow:
Title: ${workflowTitle}
Description: ${workflowDescription}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const steps = JSON.parse(response).steps || [];

    // Add IDs and status to steps
    const stepsWithIds = steps.map((step: any, index: number) => ({
      id: `step-${index + 1}`,
      name: step.name,
      status: 'pending',
      order_index: index
    }));

    return NextResponse.json({ steps: stepsWithIds });

  } catch (error) {
    console.error('Error in workflow planning:', error);
    return NextResponse.json(
      { error: 'Failed to plan workflow steps' },
      { status: 500 }
    );
  }
} 