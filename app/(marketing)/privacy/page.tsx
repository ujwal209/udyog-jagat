export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-32 max-w-3xl mx-auto px-6">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">Privacy Policy</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
        <p className="font-medium text-foreground">Last updated: June 2026</p>
        
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">1. Introduction</h2>
        <p>
          Welcome to Udyog Jagat. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">2. Data We Collect</h2>
        <p>
          We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
          <li><strong>Professional Data</strong> includes resumes, work history, skills, and education details.</li>
          <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3. How We Use Your Data</h2>
        <p>
          We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>To register you as a new user (Candidate or Employer).</li>
          <li>To match your profile with relevant job opportunities using our AI algorithms.</li>
          <li>To facilitate communication between candidates and employers via our chat system.</li>
          <li>To improve our website, products/services, marketing, customer relationships and experiences.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">4. Data Security</h2>
        <p>
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. We use passwordless authentication (email OTPs) to eliminate the risk of password breaches.
        </p>
      </div>
    </div>
  );
}
