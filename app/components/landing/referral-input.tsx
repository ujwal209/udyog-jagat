// components/landing/referral-input.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ReferralInput() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto bg-[#1C3FA4] rounded-[2rem] p-10 md:p-20 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Have an Access Code?</h2>
        <p className="text-blue-100 mb-10 max-w-xl mx-auto">
          Enter your admin-generated referral code below to unlock the portal. 
          Your access duration is set by the administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input 
            placeholder="Enter Code (e.g., ADM-XXXX)" 
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
          />
          <Button className="bg-white text-[#1C3FA4] hover:bg-slate-100 h-12 px-8 font-bold">
            Unlock Access
          </Button>
        </div>
      </div>
    </section>
  );
}