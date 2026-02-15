import { getReferrerProfileAction } from "@/app/actions/referrer-profile-actions"
import { ReferrerProfileForm } from "@/components/referrer-profile-form"
import { redirect } from "next/navigation"

export default async function ReferrerProfilePage() {
  const profile = await getReferrerProfileAction()

  if (!profile) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-white p-6 lg:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-2 border-b border-slate-100 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            My <span className="text-[#1C3FA4]">Profile</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Manage your personal details and public presence.
          </p>
        </div>

        {/* Client Form */}
        <ReferrerProfileForm initialData={profile} />
      </div>
    </div>
  )
}