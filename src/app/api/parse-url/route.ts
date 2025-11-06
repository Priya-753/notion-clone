import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore - No type definitions available
import Parser from '@postlight/parser'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    console.log('Parsing URL on server:', url)
    
    // Parse the URL using the server-side parser
    const result = await Parser.parse(url)
    
    console.log('Parser result:', result)
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('Parser error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to parse URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

