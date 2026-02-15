// components/landing/hero.tsx
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="py-20 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-[#1C3FA4] uppercase bg-[#1C3FA4]/10 rounded-full">
          The Future of Hiring
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Land your dream job through <span className="text-[#1C3FA4]">Direct Referrals.</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          Connecting ambitious Seekers with internal Referrers and Job Posters. 
          Use your unique access code to enter the exclusive talent ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="bg-[#1C3FA4] hover:bg-[#1C3FA4]/90 w-full sm:w-auto px-10 h-14 text-lg">
            I am a Seeker
          </Button>
          <Button size="lg" variant="outline" className="border-[#1C3FA4] text-[#1C3FA4] hover:bg-[#1C3FA4]/5 w-full sm:w-auto px-10 h-14 text-lg">
            I am a Referrer
          </Button>
        </div>
      </div>
    </section>
  );
}