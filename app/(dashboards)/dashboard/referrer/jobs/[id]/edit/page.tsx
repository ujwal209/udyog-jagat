import { getJobByIdAction } from "@/app/actions/job-posting-actions"
import { EditJobForm } from "@/components/edit-job-form"
import { redirect } from "next/navigation"

interface PageProps {
  params: { id: string }
}

export default async function EditJobPage({ params }: PageProps) {
  // Await params first (Next.js 15+ requirement or good practice)
  const { id } = await params
  
  const job = await getJobByIdAction(id)

  if (!job) {
    redirect("/dashboard/referrer/jobs")
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20 animate-in fade-in duration-700">
      <EditJobForm job={job} />
    </div>
  )
}