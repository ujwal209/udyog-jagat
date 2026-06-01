"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, User, Building, Briefcase, MapPin, Phone } from "lucide-react"

export default function OnboardingClient({ role, userId }: { role: string; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // State for Candidate
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [age, setAge] = useState("")
  const [address, setAddress] = useState("")
  const [skills, setSkills] = useState("") // Not in DB schema exactly, but we can store if added or ignore

  // State for Job Poster
  const [department, setDepartment] = useState("")
  const [vibhaaga, setVibhaaga] = useState("") // from schema

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          fullName,
          phone,
          age: parseInt(age),
          address,
          vibhaaga
        })
      })
      if (!res.ok) throw new Error("Failed to save profile")
      router.push("/dashboard") // assuming this exists
    } catch (error) {
      console.error(error)
      alert("Failed to save profile")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Complete your profile
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Tell us a little bit more about yourself to get started.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md h-10 border outline-none px-3"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {role === "job_seeker" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md h-10 border outline-none px-3"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md h-10 border outline-none px-3"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Address / City</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md h-10 border outline-none px-3"
                      placeholder="New York, NY"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Department / Domain (Vibhaaga)</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={vibhaaga}
                      onChange={e => setVibhaaga(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md h-10 border outline-none px-3"
                      placeholder="HR, Engineering, etc."
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-950 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
