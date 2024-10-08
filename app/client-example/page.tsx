import { auth } from "auth"
import ClientExample from "@/components/client-example"
import { SessionProvider } from "next-auth/react"

export default async function ClientPage() {
  const session = await auth()

  return (
    <SessionProvider 
      basePath={"/auth"} 
      session={session}          
    >
      <ClientExample />
    </SessionProvider>
  )
}
