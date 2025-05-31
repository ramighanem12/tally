import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { jsPDF } from 'jspdf'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('runId')
    const format = searchParams.get('format') || 'pdf'

    if (!runId) {
      return NextResponse.json({ error: 'Run ID required' }, { status: 400 })
    }

    // Get the workflow run with deliverable
    const { data: workflowRun, error } = await supabase
      .from('workflow_runs')
      .select(`
        *,
        workflow:workflows (
          title,
          description
        )
      `)
      .eq('id', runId)
      .single()

    if (error || !workflowRun) {
      return NextResponse.json({ error: 'Workflow run not found' }, { status: 404 })
    }

    if (!workflowRun.deliverable) {
      return NextResponse.json({ error: 'No deliverable available' }, { status: 404 })
    }

    const deliverable = workflowRun.deliverable

    if (format === 'pdf') {
      // Generate PDF
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20

      // Title
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(deliverable.title || 'Workflow Deliverable', margin, 30)

      // Workflow info
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Workflow: ${workflowRun.workflow.title}`, margin, 50)
      doc.text(`Completed: ${new Date(workflowRun.completed_at).toLocaleDateString()}`, margin, 60)

      // Summary
      if (deliverable.summary) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Executive Summary', margin, 80)
        
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        const summaryLines = doc.splitTextToSize(deliverable.summary, pageWidth - 2 * margin)
        doc.text(summaryLines, margin, 95)
      }

      // Content
      let yPosition = 120
      if (deliverable.content) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Detailed Analysis', margin, yPosition)
        yPosition += 15

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        const contentLines = doc.splitTextToSize(deliverable.content, pageWidth - 2 * margin)
        
        contentLines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
          doc.text(line, margin, yPosition)
          yPosition += 6
        })
      }

      // Recommendations
      if (deliverable.recommendations && deliverable.recommendations.length > 0) {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        yPosition += 10
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Recommendations', margin, yPosition)
        yPosition += 15

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        deliverable.recommendations.forEach((rec: string, index: number) => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
          doc.text(`${index + 1}. ${rec}`, margin, yPosition)
          yPosition += 8
        })
      }

      const pdfBuffer = doc.output('arraybuffer')
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${deliverable.title || 'workflow-deliverable'}.pdf"`
        }
      })
    }

    // Return JSON format as fallback
    return NextResponse.json(deliverable)

  } catch (error) {
    console.error('Error generating deliverable:', error)
    return NextResponse.json({ 
      error: 'Failed to generate deliverable',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 