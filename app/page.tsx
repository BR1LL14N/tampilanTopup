import { createClient } from "@/lib/supabase/server"
import { HomeContent } from "@/components/home/home-content"

export default async function HomePage() {
  let user = null;
  
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      user = {
        name: data.user.user_metadata?.name || data.user.email || '',
        email: data.user.email || '',
        role: data.user.user_metadata?.role || 'user'
      }
    }
  } catch (e) {
    // Ignore error if Supabase client is not configured
  }

  return <HomeContent user={user} />
}