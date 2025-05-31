import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export async function uploadDocuments(files: File[], projectId?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user found')

    const uploadPromises = files.map(async (file) => {
      // Create unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `uploads/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      // Upload file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      // Insert document record into documents table
      const { data: documentData, error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: file.name,
          url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          tags: [] // Add tags functionality later
        })
        .select()
        .single()

      if (insertError) throw insertError

      // If projectId is provided, create project association
      if (projectId) {
        const { error: projectAssocError } = await supabase
          .from('project_documents')
          .insert({
            project_id: projectId,
            document_id: documentData.id,
            created_by: user.id
          })

        if (projectAssocError) throw projectAssocError
      }

      return publicUrl
    })

    await Promise.all(uploadPromises)
    toast.success('Documents uploaded successfully')
    return true
  } catch (error) {
    console.error('Error uploading documents:', error)
    toast.error('Failed to upload documents')
    return false
  }
} 