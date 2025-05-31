import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    const data = {
      title: $('title').text() || $('meta[property="og:title"]').attr('content'),
      description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      favicon: $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
    }

    // Handle relative favicon URLs
    if (data.favicon && !data.favicon.startsWith('http')) {
      const urlObj = new URL(url)
      data.favicon = `${urlObj.origin}${data.favicon}`
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching link preview:', error)
    return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 500 })
  }
} 