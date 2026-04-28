// app/client/[token]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientView from '@/components/Client/ClientView'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ClientPage({ params }: PageProps) {
  const { token } = await params
  const supabase = await createClient()

  const { data: content, error } = await supabase
    .from('content_pieces')
    .select('*')
    .eq('client_token', token)
    .single()

  if (error || !content) {
    notFound()
  }

  // Normalize video_urls
  let video_urls: string[] = []
  if (Array.isArray(content.video_urls) && content.video_urls.length > 0) {
    video_urls = content.video_urls
  } else if (content.video_url) {
    video_urls = [content.video_url]
  }

  // Fetch creator profile
  const { data: creatorProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', content.user_id)
    .single()

  // Fetch assignees
  const { data: assigneeRows } = await supabase
    .from('content_assignees')
    .select('*')
    .eq('content_id', content.id)

  const assignees = await Promise.all(
    (assigneeRows ?? []).map(async (row) => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', row.user_id)
        .single()
      return { ...row, profile: profile ?? null }
    })
  )

  const enrichedContent = {
    ...content,
    video_urls,
    view_count: content.view_count ?? 0,
    max_views: content.max_views ?? 3,
    expires_at: content.expires_at ?? null,
    creator: creatorProfile ?? null,
    assignees,
  }

  return <ClientView content={enrichedContent} />
}
