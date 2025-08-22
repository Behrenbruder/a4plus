import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { blockWebDatabaseAccess } from '@/lib/security'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Block web access for security
  const securityCheck = blockWebDatabaseAccess(request)
  if (securityCheck) return securityCheck

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('installers')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Installer not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Block web access for security
  const securityCheck = blockWebDatabaseAccess(request)
  if (securityCheck) return securityCheck

  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('installers')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Block web access for security
  const securityCheck = blockWebDatabaseAccess(request)
  if (securityCheck) return securityCheck

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
      .from('installers')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Installer deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
