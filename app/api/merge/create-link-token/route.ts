import { NextResponse } from 'next/server';

const MERGE_API_KEY = 'AsAEJYkKMtbQFPpPiNfqvGe7RqEKbLhYLNr9WuhOry09u6zgH3Ugsw';

export const runtime = 'edge'; // Use edge runtime for better performance

export async function POST(req: Request) {
  try {
    const { userId, integration } = await req.json();
    console.log('Creating link token for:', { userId, integration });

    if (!userId || !integration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Create a link token
    const linkTokenResponse = await fetch('https://api.merge.dev/api/filestorage/v1/link-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        end_user_organization_name: 'Tally',
        end_user_origin_id: userId,
        end_user_email_address: userId,
        categories: ['filestorage']
      })
    });

    const linkTokenText = await linkTokenResponse.text();
    console.log('Raw link token response:', linkTokenText);

    if (!linkTokenResponse.ok) {
      console.error('Merge API error (link token):', {
        status: linkTokenResponse.status,
        statusText: linkTokenResponse.statusText,
        body: linkTokenText
      });
      return NextResponse.json(
        { error: `Merge API error: ${linkTokenText}` },
        { status: linkTokenResponse.status }
      );
    }

    let linkTokenData;
    try {
      linkTokenData = JSON.parse(linkTokenText);
    } catch (e) {
      console.error('Failed to parse link token response:', e);
      return NextResponse.json(
        { error: 'Invalid JSON response from Merge API' },
        { status: 500 }
      );
    }

    console.log('Parsed link token response:', linkTokenData);

    if (!linkTokenData.link_token) {
      console.error('No link_token in response:', linkTokenData);
      return NextResponse.json(
        { error: 'Invalid response from Merge API - missing link_token' },
        { status: 500 }
      );
    }

    // Step 2: Create the account token
    const linkResponse = await fetch('https://api.merge.dev/api/filestorage/v1/account-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        end_user_organization_name: 'Tally',
        end_user_origin_id: userId,
        end_user_email_address: userId,
        link_token: linkTokenData.link_token
      })
    });

    const linkText = await linkResponse.text();
    console.log('Raw link response:', linkText);

    if (!linkResponse.ok) {
      console.error('Merge API error (create link):', {
        status: linkResponse.status,
        statusText: linkResponse.statusText,
        body: linkText
      });
      return NextResponse.json(
        { error: `Merge API error: ${linkText}` },
        { status: linkResponse.status }
      );
    }

    let linkData;
    try {
      linkData = JSON.parse(linkText);
    } catch (e) {
      console.error('Failed to parse link response:', e);
      return NextResponse.json(
        { error: 'Invalid JSON response from Merge API' },
        { status: 500 }
      );
    }

    console.log('Parsed link response:', linkData);

    if (!linkData.account_token) {
      console.error('No account_token in response:', linkData);
      return NextResponse.json(
        { error: 'Invalid response from Merge API - missing account_token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      account_token: linkData.account_token
    });

  } catch (error) {
    console.error('Error creating Merge link:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 