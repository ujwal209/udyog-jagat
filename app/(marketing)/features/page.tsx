import { Cpu, MessageSquare, ShieldCheck, FileSearch, LineChart, MousePointerClick, CheckCircle2 } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "AI Resume Parsing",
      description: "Automatically extract key skills, experience, and education from PDF resumes to instantly build comprehensive candidate profiles. Our NLP models understand context, not just keywords.",
      benefits: ["Saves 90% of manual entry time", "Standardizes candidate data", "Highlights hidden skills"]
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Real-Time Chat Ecosystem",
      description: "Cut through the noise. Employers and candidates can communicate instantly through our built-in secure messaging system. Negotiate offers, ask screening questions, and schedule interviews without leaving the platform.",
      benefits: ["Instant notifications", "Secure and private", "Rich media sharing"]
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: "Deep Employer Analytics",
      description: "Job posters get real-time insights into application velocity, candidate demographics, and hiring funnel metrics. Make data-driven decisions on where to allocate your hiring budget.",
      benefits: ["Funnel conversion tracking", "Diversity metrics", "Time-to-hire analysis"]
    },
    {
      icon: <FileSearch className="w-8 h-8" />,
      title: "Smart Matching Algorithm",
      description: "Our proprietary algorithm matches candidates to job postings based on exact skill overlap, experience requirements, and cultural fit indicators. Stop scrolling through irrelevant applications.",
      benefits: ["Precision matching score", "Automated shortlisting", "Bias reduction"]
    },
    {
      icon: <MousePointerClick className="w-8 h-8" />,
      title: "Frictionless 1-Click Apply",
      description: "Say goodbye to redundant forms and account creations. Once your profile is verified and complete, apply to top-tier roles across the entire platform with a single click.",
      benefits: ["Higher application rates", "Better candidate experience", "Zero redundant data entry"]
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Passwordless Authentication",
      description: "Enterprise-grade security using secure Email OTPs. No passwords to remember, no accounts to compromise. Seamlessly and securely access your dashboard every time.",
      benefits: ["Zero password fatigue", "Enhanced security posture", "Instant access"]
    }
  ];

  return (
    <div className="pt-24 pb-32 max-w-7xl mx-auto px-6">
      <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
          Engineered for <span className="text-primary">Excellence.</span>
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Udyog Jagat provides a suite of powerful, natively built tools designed to completely remove friction from the hiring process.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-card border border-border/50 rounded-3xl p-10 hover:shadow-2xl hover:shadow-primary/5 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              {feature.icon}
            </div>
            <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {feature.description}
            </p>
            <ul className="space-y-3">
              {feature.benefits.map((benefit, bIdx) => (
                <li key={bIdx} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
