import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="pt-24 pb-32 max-w-4xl mx-auto px-6">
      <div className="text-center mb-16 space-y-6">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
          The Vision Behind <span className="text-primary">Udyog Jagat</span>
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Redefining how the world connects with opportunity.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
        <p className="text-xl leading-relaxed text-foreground/80 font-medium">
          We believe that the future of work should be accessible, secure, and highly intuitive. Udyog Jagat was forged to bridge the gap between incredible talent and forward-thinking enterprises.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 my-12">
          <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-muted-foreground">
              To eliminate the friction of traditional job portals—like redundant applications, biased screening, and slow communication—empowering individuals to build their careers, and organizations to scale their operations with unparalleled efficiency.
            </p>
          </div>
          <div className="bg-card border border-border p-8 rounded-3xl">
            <h3 className="text-2xl font-bold mb-4">Our Approach</h3>
            <p className="text-muted-foreground">
              By leveraging cutting-edge AI for parsing and matching, paired with a real-time communication infrastructure, we are replacing the antiquated "post and pray" model with a dynamic, proactive marketplace.
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Why We Built This</h2>
        <p className="text-muted-foreground leading-relaxed">
          The recruitment industry is broken. Candidates spend hours tailoring resumes and filling out repetitive forms, only to be met with silence. Employers sift through thousands of irrelevant applications, struggling to find the signal in the noise. We built Udyog Jagat because we experienced this pain firsthand. We realized that by applying modern software engineering principles, AI, and a design-first philosophy, we could create an ecosystem where talent is recognized instantly and companies can hire with conviction.
        </p>
      </div>
    </div>
  );
}
