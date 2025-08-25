import { NextRequest, NextResponse } from 'next/server'
import { blockWebDatabaseAccess } from '@/lib/security'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  // Block web access for security
  const securityCheck = blockWebDatabaseAccess(request)
  if (securityCheck) return securityCheck

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status) {
      where.status = status
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where })
    ])

    // Convert Prisma data to match expected format
    const convertedData = data.map((customer: any) => ({
      id: customer.id,
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postal_code: customer.postalCode,
      status: customer.status,
      notes: customer.notes,
      created_at: customer.createdAt,
      updated_at: customer.updatedAt
    }))

    return NextResponse.json({
      data: convertedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('Customers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }
}

export async function POST(request: NextRequest) {
  // Block web access for security
  const securityCheck = blockWebDatabaseAccess(request)
  if (securityCheck) return securityCheck

  try {
    const body = await request.json()

    // Convert from snake_case to camelCase for Prisma
    const customerData = {
      firstName: body.first_name || body.firstName,
      lastName: body.last_name || body.lastName,
      email: body.email,
      phone: body.phone || null,
      address: body.address || null,
      city: body.city || null,
      postalCode: body.postal_code || body.postalCode || null,
      status: body.status || 'lead',
      notes: body.notes || null
    }

    const data = await prisma.customer.create({
      data: customerData
    })

    // Convert back to snake_case for response
    const convertedData = {
      id: data.id,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postal_code: data.postalCode,
      status: data.status,
      notes: data.notes,
      created_at: data.createdAt,
      updated_at: data.updatedAt
    }

    return NextResponse.json({ data: convertedData }, { 
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('Customer creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }
}

// OPTIONS Handler für CORS Preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
