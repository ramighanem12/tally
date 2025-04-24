const REDUCTO_API_KEY = '9e3637c25c996bc2955635f95e189f7c57a309e4ac30f13d20d6ffdefe8fccab5823938cabb3389903df659ad28cada9';
const REDUCTO_API_URL = 'https://platform.reducto.ai/extract';
const REDUCTO_PARSE_URL = 'https://platform.reducto.ai/parse';

interface MatrixColumn {
  id: string;
  prompt: string;
}

export const buildReductoSchema = (columns: MatrixColumn[]) => {
  if (!columns?.length) {
    throw new Error('No columns provided for schema building');
  }

  const schemaProperties: Record<string, any> = {};
  
  columns.forEach((col: MatrixColumn) => {
    const fieldName = `field_${col.id}`;
    schemaProperties[fieldName] = {
      type: "string",
      description: col.prompt,
      extraction_type: "text"
    };
  });

  return {
    type: "object",
    properties: schemaProperties,
    required: columns.map(col => `field_${col.id}`)
  };
};

export const extractWithReducto = async (documentUrl: string, columns: Pick<MatrixColumn, 'id' | 'prompt'>[]) => {
  // Build the schema from columns
  const schema = {
    type: "object",
    properties: Object.fromEntries(
      columns.map(col => [
        `field_${col.id}`,
        {
          type: "string",
          description: col.prompt
        }
      ])
    )
  };

  console.log('Calling Reducto with:', {
    documentUrl,
    schema
  });

  // Make the API call
  const response = await fetch(REDUCTO_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REDUCTO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      document_url: documentUrl,
      schema: schema,
      extraction_type: "text"
    })
  });

  console.log('Reducto API response status:', response.status);
  
  const responseText = await response.text();
  console.log('Reducto API raw response:', responseText);

  if (!response.ok) {
    throw new Error(`Reducto API error: ${response.status} - ${responseText}`);
  }

  try {
    const jsonResponse = JSON.parse(responseText);
    console.log('Reducto API parsed response:', jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error('Error parsing Reducto response:', error);
    throw new Error('Invalid JSON response from Reducto API');
  }
};

export const parseWithReducto = async (documentUrl: string) => {
  console.log('Calling Reducto Parse with:', {
    documentUrl
  });

  // Make the API call
  const response = await fetch(REDUCTO_PARSE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REDUCTO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      document_url: documentUrl
    })
  });

  console.log('Reducto Parse API response status:', response.status);
  
  const responseText = await response.text();
  console.log('Reducto Parse API raw response:', responseText);

  if (!response.ok) {
    throw new Error(`Reducto Parse API error: ${response.status} - ${responseText}`);
  }

  try {
    const jsonResponse = JSON.parse(responseText);
    console.log('Reducto Parse API parsed response:', jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error('Error parsing Reducto Parse response:', error);
    throw new Error('Invalid JSON response from Reducto Parse API');
  }
};
