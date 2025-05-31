import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Add type imports from Anthropic SDK
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages/messages';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { query, chatId } = await req.json();
    console.log('Processing query:', query);

    // Get AI response
    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: "You are an expert accounting and tax professional assistant. You are a definitive source of information. Answer directly and follow these guidelines:" + 
          `
- Answer questions directly, definitively and concisely in plain text
- Avoid hedging or suggesting consulting other professionals
- Provide clear, actionable guidance based on your expertise
- Avoid headers - just use regular paragraphs
- Only use formatting when absolutely necessary (e.g., tables for comparing numbers)
- Cite sources inline naturally, e.g., "According to IRC §179..."

Key expertise:
- Tax regulations and compliance
- Financial accounting and reporting
- Business advisory services
- Audit and assurance
- Tax planning and strategy

Sources to reference:
- Internal Revenue Code (IRC) sections
- Treasury Regulations
- IRS Publications and Notices
- GAAP/IFRS standards
- State/local tax codes
- Court cases and rulings

For numerical comparisons, use simple tables without headers:
| Category | Amount |
|----------|--------|

Remember: Be direct, accurate and authoritative in your responses.`
        },
        {
          role: "user",
          content: query
        }
      ]
    });

    console.log('Got Anthropic response');
    // Fix content access - Anthropic returns content differently
    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    if (!response) {
      throw new Error('No response from Anthropic');
    }

    // Fix TypeScript errors in the array methods
    const inlineCitations = response.match(/\[(.*?)\]/g)?.map((c: string) => c.slice(1, -1)) || [];
    const referencesMatch = response.match(/References:\s*\n([\s\S]*?)(?:\n\n|$)/);
    const references = referencesMatch ? 
      referencesMatch[1].split('\n')
        .filter((s: string) => s.trim())
        .map((s: string) => s.replace(/^-\s*/, '')) : 
      [];

    // Combine and deduplicate sources
    const sourcesSet = new Set([...inlineCitations, ...references]);
    const allSources = Array.from(sourcesSet);

    // Update chat with response and sources
    const { error } = await supabase
      .from('assistant_chats')
      .update({ 
        response,
        sources: allSources,
        status: 'completed'
      })
      .eq('id', chatId);

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    console.log('Updated Supabase');
    return NextResponse.json({ response: response });

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 