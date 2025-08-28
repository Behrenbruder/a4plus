import { NextRequest, NextResponse } from 'next/server'
import foerderungen from '@/data/foerderungen.json'

interface FoerderungChange {
  id: string
  name: string
  url: string
  currentStatus: 'available' | 'unavailable' | 'unknown'
  newStatus: 'available' | 'unavailable' | 'unknown'
  changeType: 'new' | 'status_change' | 'no_change'
  lastChecked?: string
}

async function checkUrlAvailability(url: string): Promise<'available' | 'unavailable'> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    clearTimeout(timeoutId)
    return response.ok ? 'available' : 'unavailable'
  } catch (error) {
    console.error(`Error checking URL ${url}:`, error)
    return 'unavailable'
  }
}

// Mock function to get current status from database/storage
async function getCurrentStatus(foerderungId: string): Promise<'available' | 'unavailable' | 'unknown'> {
  // In a real implementation, this would query your database
  // For now, we'll simulate some existing data
  const mockCurrentStatuses: Record<string, 'available' | 'unavailable' | 'unknown'> = {
    'bafa-heizung': 'available',
    'kfw-261': 'unavailable',
    'kfw-270': 'available',
    // Add more mock data as needed
  }
  
  return mockCurrentStatuses[foerderungId] || 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting förderung preview scan...')
    
    const changes: FoerderungChange[] = []
    
    // Check each förderung program
    for (const foerderung of foerderungen) {
      console.log(`Checking ${foerderung.name}...`)
      
      const currentStatus = await getCurrentStatus(foerderung.id)
      const newStatus = await checkUrlAvailability(foerderung.url)
      
      let changeType: 'new' | 'status_change' | 'no_change' = 'no_change'
      
      if (currentStatus === 'unknown') {
        changeType = 'new'
      } else if (currentStatus !== newStatus) {
        changeType = 'status_change'
      }
      
      changes.push({
        id: foerderung.id,
        name: foerderung.name,
        url: foerderung.url,
        currentStatus,
        newStatus,
        changeType,
        lastChecked: new Date().toISOString()
      })
    }
    
    // Group changes by type
    const newEntries = changes.filter(c => c.changeType === 'new')
    const statusChanges = changes.filter(c => c.changeType === 'status_change')
    const noChanges = changes.filter(c => c.changeType === 'no_change')
    
    const summary = {
      totalChecked: changes.length,
      newEntries: newEntries.length,
      statusChanges: statusChanges.length,
      noChanges: noChanges.length,
      availablePrograms: changes.filter(c => c.newStatus === 'available').length,
      unavailablePrograms: changes.filter(c => c.newStatus === 'unavailable').length
    }
    
    console.log('Preview scan completed:', summary)
    
    return NextResponse.json({
      success: true,
      summary,
      changes: {
        new: newEntries,
        statusChanges,
        noChanges
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in förderung preview scan:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform preview scan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
