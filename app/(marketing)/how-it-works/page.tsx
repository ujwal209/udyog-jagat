export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      title: "Instant Authentication",
      desc: "Enter your email to receive a secure OTP. No passwords needed. If you have an exclusive referral code from a partner, enter it now to unlock priority status and verified badges."
    },
    {
      number: "02",
      title: "Role-Specific Onboarding",
      desc: "Job Seekers simply upload their PDF resume; our AI parses it instantly to build your profile. Employers input their department details, company verification, and billing info. Zero wasted time."
    },
    {
      number: "03",
      title: "Intelligent Matching",
      desc: "Employers post roles with specific criteria. Our algorithm immediately scans the talent pool and presents a ranked shortlist of candidates. Seekers are notified of high-match opportunities."
    },
    {
      number: "04",
      title: "Connect & Hire",
      desc: "Skip the emails. Use our built-in real-time chat to conduct preliminary screenings, schedule interviews, and negotiate offers securely on the platform."
    }
  ];

  return (
    <div className="pt-24 pb-32 max-w-4xl mx-auto px-6">
      <div className="text-center mb-24 space-y-6">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
          Optimized for speed <br className="hidden md:block" />
          <span className="text-primary">and precision.</span>
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          We have stripped away the bloated processes of legacy job boards to deliver a streamlined experience for both sides of the market.
        </p>
      </div>

      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-[2.25rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {step.number}
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border border-border/50 p-8 rounded-3xl shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all">
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
