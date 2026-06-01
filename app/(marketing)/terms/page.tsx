export default function TermsPage() {
  return (
    <div className="pt-24 pb-32 max-w-3xl mx-auto px-6">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">Terms and Conditions</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
        <p className="font-medium text-foreground">Last updated: June 2026</p>
        
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">1. Agreement to Terms</h2>
        <p>
          By viewing or accessing Udyog Jagat, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the platform.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">2. User Accounts</h2>
        <p>
          When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our platform.
        </p>
        <p>
          You are responsible for safeguarding the OTPs or authentication links sent to your email and for any activities or actions under your account.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3. Acceptable Use</h2>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Candidates</strong> agree to provide truthful representations of their skills and experience.</li>
          <li><strong>Employers</strong> agree to post legitimate, available roles and not to use candidate data for purposes outside of the recruitment process.</li>
          <li>Scraping, automated data extraction, or reverse engineering of our matching algorithms is strictly prohibited.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">4. Intellectual Property</h2>
        <p>
          The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Udyog Jagat and its licensors.
        </p>
      </div>
    </div>
  );
}
