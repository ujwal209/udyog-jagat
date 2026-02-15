// components/layout/navbar.tsx
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-50">
      <div className="text-2xl font-bold text-[#1C3FA4]">JobPortal</div>
      <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
        <a href="#" className="hover:text-[#1C3FA4]">Find Jobs</a>
        <a href="#" className="hover:text-[#1C3FA4]">For Referrers</a>
        <a href="#" className="hover:text-[#1C3FA4]">Pricing</a>
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" className="text-[#1C3FA4]">Login</Button>
        <Button className="bg-[#1C3FA4] hover:bg-[#1C3FA4]/90">Post a Job</Button>
      </div>
    </nav>
  );
}