import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'

export default function ClerkSyncToStrapi() {
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    console.log("🧪 useEffect triggered")
    console.log("🧪 isSignedIn:", isSignedIn)
    console.log("🧪 user:", user)

    if (!isSignedIn || !user) {
      console.log("⏸️ Not signed in or user not loaded")
      return
    }

    console.log("✅ Signed in. Sending user.created to Strapi")

    fetch('https://1f75-86-124-126-204.ngrok-free.app/api/clerk-sync/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'user.created',
        data: {
          id: user.id,
          email_addresses: [
            { email_address: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress }
          ],
          public_metadata: user.publicMetadata || { role: 'user' },
        }
      }),
    })
      .then(res => res.json())
      .then(data => console.log("✅ Response from Strapi:", data))
      .catch(err => console.error("❌ Error sending to Strapi:", err))
  }, [isSignedIn, user])

  return null
}
