const MERGE_API_URL = 'https://api.merge.dev/api/filestorage/v1';
const MERGE_API_KEY = 'AsAEJYkKMtbQFPpPiNfqvGe7RqEKbLhYLNr9WuhOry09u6zgH3Ugsw';

// Store account token after successful connection
let accountToken: string | null = null;

export const setAccountToken = (token: string) => {
  accountToken = token;
};

export interface MergeFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  modified_at: string;
}

export interface MergeFolder {
  id: string;
  name: string;
  path: string;
}

export const connectDropbox = async (userId: string): Promise<string> => {
  try {
    console.log('Initiating Dropbox connection for user:', userId);
    
    const response = await fetch('/api/merge/create-link-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        integration: 'dropbox'
      })
    });

    const data = await response.json();
    console.log('Merge API response:', data);

    if (!response.ok) {
      console.error('Failed to connect to Dropbox:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error
      });
      throw new Error(data.error || 'Failed to connect to Dropbox');
    }
    
    if (!data.account_token) {
      console.error('No account token in response:', data);
      throw new Error('No account token received from Merge');
    }
    
    // Store the account token
    console.log('Setting account token');
    setAccountToken(data.account_token);
    
    // Return success
    return 'Connected to Dropbox successfully';
  } catch (error) {
    console.error('Error creating Merge link request:', error);
    throw error;
  }
};

export const listDropboxFiles = async (userId: string, folderId?: string): Promise<{
  files: MergeFile[];
  folders: MergeFolder[];
}> => {
  if (!accountToken) {
    throw new Error('No account token available. Please connect to Dropbox first.');
  }

  try {
    const url = new URL(`${MERGE_API_URL}/files`);
    if (folderId) {
      url.searchParams.append('folder_id', folderId);
    }
    url.searchParams.append('end_user_origin_id', userId);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${MERGE_API_KEY}`,
        'X-Account-Token': accountToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const files: MergeFile[] = [];
    const folders: MergeFolder[] = [];

    data.results?.forEach((item: any) => {
      if (item.type === 'FOLDER') {
        folders.push({
          id: item.id || '',
          name: item.name || '',
          path: item.path || ''
        });
      } else {
        files.push({
          id: item.id || '',
          name: item.name || '',
          path: item.path || '',
          size: item.size || 0,
          type: item.type || '',
          modified_at: item.modified_at || ''
        });
      }
    });

    return { files, folders };
  } catch (error) {
    console.error('Error listing Dropbox files:', error);
    throw error;
  }
};

export const downloadDropboxFile = async (userId: string, fileId: string): Promise<Blob> => {
  if (!accountToken) {
    throw new Error('No account token available. Please connect to Dropbox first.');
  }

  try {
    const response = await fetch(`${MERGE_API_URL}/files/${fileId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERGE_API_KEY}`,
        'X-Account-Token': accountToken
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${error}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error downloading Dropbox file:', error);
    throw error;
  }
}; 
