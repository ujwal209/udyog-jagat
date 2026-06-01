import Link from "next/link";
import { ArrowRight, Building2, Users, Briefcase, Search, FileText, CheckCircle, MapPin, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const categories = [
    { name: "Software Engineering", count: "12k+ Jobs", icon: <Briefcase className="w-6 h-6" /> },
    { name: "Product Management", count: "4k+ Jobs", icon: <Target className="w-6 h-6" /> },
    { name: "Data Science & AI", count: "8k+ Jobs", icon: <TrendingUp className="w-6 h-6" /> },
    { name: "Design & UX", count: "5k+ Jobs", icon: <FileText className="w-6 h-6" /> },
    { name: "Sales & Marketing", count: "15k+ Jobs", icon: <Users className="w-6 h-6" /> },
    { name: "Finance & Legal", count: "3k+ Jobs", icon: <Building2 className="w-6 h-6" /> },
  ];

  const featuredJobs = [
    { title: "Senior Full Stack Engineer", company: "TechNova", location: "Remote, US", salary: "$140k - $180k", type: "Full-time" },
    { title: "Product Marketing Manager", company: "GlobalScale", location: "New York, NY", salary: "$110k - $130k", type: "Full-time" },
    { title: "Lead UX Designer", company: "CreativeDash", location: "San Francisco, CA", salary: "$130k - $160k", type: "Contract" },
  ];

  return (
    <div className="relative overflow-hidden w-full">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none -z-10 flex justify-center">
        <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] dark:bg-primary/10 opacity-70 animate-in fade-in duration-1000" />
      </div>

      <main className="pt-24 md:pt-32 pb-24 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="px-6 max-w-7xl mx-auto text-center w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700 shadow-sm border border-border/50">
            <Search className="w-4 h-4 text-primary" />
            <span>Over 100,000 active job listings</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground max-w-5xl mx-auto leading-[1.05] animate-in slide-in-from-bottom-6 fade-in duration-1000 delay-150">
            Find Your Dream Job. <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/50">Hire Elite Talent.</span>
          </h1>

          <p className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300 font-medium">
            The most advanced professional network and hiring platform. We connect ambitious professionals with industry-leading companies through intelligent matching.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-10 h-14 text-lg font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-transform group">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-10 h-14 text-lg font-bold hover:bg-accent transition-colors border-2">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="mt-24 w-full border-y border-border/40 bg-card/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-12 px-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-4xl font-black text-foreground">5,000+</h3>
              <p className="text-muted-foreground font-medium">Companies Hiring</p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-y md:border-y-0 md:border-x border-border/40 py-8 md:py-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-4xl font-black text-foreground">500k+</h3>
              <p className="text-muted-foreground font-medium">Active Candidates</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-4xl font-black text-foreground">120k+</h3>
              <p className="text-muted-foreground font-medium">Jobs Posted</p>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mt-32 w-full max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Explore Categories</h2>
              <p className="text-lg text-muted-foreground">Browse opportunities across various industries and specialties.</p>
            </div>
            <Link href="/auth/login" className="text-primary font-semibold hidden md:flex items-center gap-1 hover:underline">
              View all categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <div key={i} className="flex items-center p-6 bg-card border border-border/50 rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-xl bg-primary/5 text-primary flex items-center justify-center mr-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{cat.name}</h3>
                  <p className="text-muted-foreground text-sm">{cat.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dual Value Prop */}
        <div className="mt-32 w-full max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <h2 className="text-3xl font-bold mb-4">For Candidates</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed max-w-md">
              Build your professional profile in seconds with our intelligent resume parser. Get matched with jobs that fit your exact skills and experience. Apply with a single click.
            </p>
            <ul className="space-y-4 mb-10">
              {["Automated skill extraction", "Direct chat with recruiters", "Salary transparency"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium">
                  <CheckCircle className="w-5 h-5 text-primary" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup">
              <Button className="rounded-full px-8">Find a Job</Button>
            </Link>
          </div>
          <div className="bg-card border border-border/50 rounded-3xl p-10 md:p-14 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-3xl font-bold mb-4">For Employers</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed max-w-md">
              Streamline your hiring funnel. Post jobs, review ranked candidates automatically, and schedule interviews—all within a single secure ecosystem.
            </p>
            <ul className="space-y-4 mb-10">
              {["Algorithm-based candidate matching", "Integrated applicant tracking", "Actionable hiring analytics"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium">
                  <CheckCircle className="w-5 h-5 text-primary" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/auth/login">
              <Button variant="outline" className="rounded-full px-8">Start Hiring</Button>
            </Link>
          </div>
        </div>

        {/* Featured Jobs Preview */}
        <div className="mt-32 w-full max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Latest Opportunities</h2>
            <p className="text-lg text-muted-foreground">Apply to the most recent roles added to our platform.</p>
          </div>
          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            {featuredJobs.map((job, i) => (
              <div key={i} className="bg-card border border-border/50 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/50 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-secondary-foreground font-bold text-xl">
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Building2 className="w-4 h-4"/> {job.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {job.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                  <div className="font-semibold text-foreground bg-primary/5 px-3 py-1 rounded-full text-sm border border-primary/10">
                    {job.salary}
                  </div>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="hidden md:flex rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="rounded-full px-10">
                Browse All Jobs
              </Button>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
