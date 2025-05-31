import { supabase } from '@/lib/supabase';
import { FileItem } from '@/app/components/DocumentsCard';
import { uploadDocuments } from '@/app/utils/uploadDocuments';

interface FileWithData extends FileItem {
  file?: File;  // The actual File object
}

export async function handleWorkflowDocuments(files: FileWithData[], workflowRunId: string) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const documentIds = [];
    
    for (const fileItem of files) {
      if (fileItem.type === 'file') {
        if (fileItem.file) {
          // Handle uploaded file
          await uploadDocuments([fileItem.file]);
          
          // Get the document ID from the recently uploaded document
          const { data: document, error: docError } = await supabase
            .from('documents')
            .select('id')
            .eq('name', fileItem.name)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (docError) {
            console.error('Error getting document ID:', docError);
            throw docError;
          }

          documentIds.push(document.id);
        } else {
          // Handle vault document (already exists)
          documentIds.push(fileItem.id);
        }
      } else if (fileItem.type === 'project') {
        // Get all documents in the project
        const { data: projectDocs, error } = await supabase
          .from('project_documents')
          .select('document_id')
          .eq('project_id', fileItem.id);

        if (error) {
          console.error('Error fetching project documents:', error);
          continue;
        }

        documentIds.push(...projectDocs.map(pd => pd.document_id));
      }
    }

    // Associate all documents with the workflow run
    if (documentIds.length > 0) {
      const associations = documentIds.map(docId => ({
        workflow_run_id: workflowRunId,
        document_id: docId
      }));

      const { error: assocError } = await supabase
        .from('workflow_documents')
        .insert(associations);

      if (assocError) {
        console.error('Workflow document association error:', assocError);
        throw assocError;
      }
    }

    return documentIds;
  } catch (error) {
    console.error('Error handling workflow documents:', error);
    throw error;
  }
} 