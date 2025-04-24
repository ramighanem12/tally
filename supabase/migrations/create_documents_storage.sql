-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND 
    (storage.foldername(name))[1] = 'uploads' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow authenticated users to read their own files
CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[2]
  ); 