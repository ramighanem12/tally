import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  reasoning?: string;
  output?: any;
  startTime?: string;
  endTime?: string;
}

interface ExecuteWorkflowRequest {
  runId: string;
  workflowId: string;
  workflowTitle: string;
  workflowDescription: string;
  inputs: Record<string, any>;
  documents?: Array<{
    id: string;
    name: string;
    content?: string;
    type: 'file' | 'project';
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { runId, workflowId, workflowTitle, workflowDescription, inputs, documents } = body

    console.log('Starting workflow execution:', { runId, workflowId, documents: documents?.length })

    // Update workflow run status to 'running'
    const { error: updateError } = await supabase
      .from('workflow_runs')
      .update({ 
        status: 'running',
        last_updated: new Date().toISOString()
      })
      .eq('id', runId)

    if (updateError) {
      console.error('Error updating workflow run status:', updateError)
      throw new Error('Failed to update workflow run status')
    }

    // Simulate workflow execution steps
    const steps = [
      {
        id: '1',
        name: 'Document Analysis',
        description: 'Analyzing uploaded documents',
        status: 'completed',
        reasoning: `Analyzed ${documents?.length || 0} documents for workflow execution`,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Processing',
        description: 'Processing workflow logic',
        status: 'completed',
        reasoning: 'Applied workflow rules and logic to the input data',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Generate Output',
        description: 'Creating deliverable',
        status: 'completed',
        reasoning: 'Generated final deliverable based on workflow requirements',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString()
      }
    ]

    // Create a sample deliverable
    const deliverable = {
      title: `${workflowTitle} - Results`,
      content: `This is the result of executing the ${workflowTitle} workflow.\n\nWorkflow Description: ${workflowDescription}\n\nDocuments processed: ${documents?.length || 0}\n\nThe workflow has been completed successfully with the provided inputs and documents.`,
      summary: `Successfully executed ${workflowTitle} workflow`,
      recommendations: [
        'Review the generated output',
        'Validate the results against your requirements',
        'Consider next steps based on the workflow outcome'
      ],
      attachments: []
    }

    // Update workflow run with completion
    const { error: completeError } = await supabase
      .from('workflow_runs')
      .update({ 
        status: 'completed',
        steps: steps,
        deliverable: deliverable,
        completed_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      })
      .eq('id', runId)

    if (completeError) {
      console.error('Error completing workflow run:', completeError)
      throw new Error('Failed to complete workflow run')
    }

    return NextResponse.json({
      success: true,
      steps,
      deliverable,
      message: 'Workflow executed successfully'
    })

  } catch (error) {
    console.error('Workflow execution error:', error)
    
    // Update workflow run status to 'failed'
    if (body?.runId) {
      await supabase
        .from('workflow_runs')
        .update({ 
          status: 'failed',
          last_updated: new Date().toISOString()
        })
        .eq('id', body.runId)
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
} 