import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="pt-24 pb-32 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter">Get in Touch</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Whether you're an enterprise looking to scale your hiring or a candidate with a support question, we're here to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Email Us</h3>
              <p className="text-muted-foreground mb-2">Our team usually responds within 2 hours.</p>
              <a href="mailto:support@udyogjagat.com" className="text-primary font-semibold hover:underline">support@udyogjagat.com</a>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Visit Us</h3>
              <p className="text-muted-foreground">
                Udyog Jagat Headquarters<br/>
                Tech Park, Sector 45<br/>
                Gurugram, Haryana 122003
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Call Us</h3>
              <p className="text-muted-foreground mb-2">Mon-Fri from 9am to 6pm IST.</p>
              <a href="tel:+9118001234567" className="text-primary font-semibold hover:underline">+91 1800 123 4567</a>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/50 p-8 rounded-3xl shadow-sm">
          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <input 
                id="name" 
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <input 
                id="email" 
                type="email"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="john@company.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">Message</label>
              <textarea 
                id="message" 
                className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="How can we help you?"
              />
            </div>
            <Button size="lg" className="w-full rounded-xl font-bold">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
