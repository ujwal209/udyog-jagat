// components/landing/roles.tsx
import { Search, Users, Building2 } from "lucide-react";

const roles = [
  {
    title: "Seekers",
    desc: "Get referred by insiders to bypass the automated resume filters.",
    icon: Search,
  },
  {
    title: "Referrers",
    desc: "Help your company find elite talent and earn referral bonuses.",
    icon: Users,
  },
  {
    title: "Posters",
    desc: "Post jobs and manage high-quality candidates vetted by your employees.",
    icon: Building2,
  },
];

export default function Roles() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10">
          {roles.map((role) => (
            <div key={role.title} className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-[#1C3FA4]/10 rounded-lg flex items-center justify-center mb-6">
                <role.icon className="text-[#1C3FA4]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{role.title}</h3>
              <p className="text-slate-600 leading-relaxed">{role.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}