export const metadata = {
  title: "Privacy Policy — Memoize",
  description: "Privacy policy for the Memoize extension and web app.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-[var(--text-muted)] mb-10">Last updated: March 2026</p>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">What is Memoize?</h2>
        <p className="text-[var(--text-secondary)]">
          Memoize is a developer productivity tool that auto-captures your LeetCode and
          Codeforces submissions and schedules spaced-repetition reviews to help you
          retain what you've learned. It consists of a Chrome extension and a web app.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Data we collect</h2>
        <p className="text-[var(--text-secondary)] mb-3">
          When you use Memoize, we collect and store the following:
        </p>
        <ul className="space-y-2 text-[var(--text-secondary)]">
          <li className="flex gap-2">
            <span className="text-[var(--text-muted)] mt-0.5">—</span>
            <span><strong className="font-medium text-[var(--text-primary)]">Account information:</strong> Your email address and authentication details via Google OAuth, stored securely in Supabase.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--text-muted)] mt-0.5">—</span>
            <span><strong className="font-medium text-[var(--text-primary)]">Submission data:</strong> Problem names, platforms (LeetCode / Codeforces), difficulty, tags, your verdict (Accepted / Attempted), and optional notes you add.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--text-muted)] mt-0.5">—</span>
            <span><strong className="font-medium text-[var(--text-primary)]">Codeforces group data:</strong> Contest and problem metadata scraped from your Codeforces groups page when you trigger a sync.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--text-muted)] mt-0.5">—</span>
            <span><strong className="font-medium text-[var(--text-primary)]">Your Codeforces handle:</strong> Stored locally in the extension to identify your submissions.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--text-muted)] mt-0.5">—</span>
            <span><strong className="font-medium text-[var(--text-primary)]">Session cookies:</strong> The extension reads your Memoize login session cookie solely to authenticate API requests on your behalf. Cookies are never sent to any third party.</span>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">What we do NOT collect</h2>
        <ul className="space-y-2 text-[var(--text-secondary)]">
          <li className="flex gap-2"><span className="text-[var(--text-muted)] mt-0.5">—</span><span>Your actual code or solution content</span></li>
          <li className="flex gap-2"><span className="text-[var(--text-muted)] mt-0.5">—</span><span>Browsing history outside of LeetCode and Codeforces</span></li>
          <li className="flex gap-2"><span className="text-[var(--text-muted)] mt-0.5">—</span><span>Any data from pages other than leetcode.com and codeforces.com</span></li>
          <li className="flex gap-2"><span className="text-[var(--text-muted)] mt-0.5">—</span><span>Passwords or payment information of any kind</span></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">How we use your data</h2>
        <p className="text-[var(--text-secondary)]">
          Your data is used exclusively to power the Memoize experience — displaying your
          problem history, scheduling spaced-repetition reviews, and showing your progress
          across Codeforces groups. We do not sell your data, share it with advertisers,
          or use it for any purpose outside the product.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Data storage and security</h2>
        <p className="text-[var(--text-secondary)]">
          All data is stored in Supabase with row-level security — you can only access
          your own data. Data is transmitted over HTTPS. Authentication is handled via
          Google OAuth; we never store passwords.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Permissions used by the extension</h2>
        <ul className="space-y-2 text-[var(--text-secondary)]">
          <li className="flex gap-2"><span className="text-[var(--text-muted)] mt-0.5">—</span><span><strong className="font-medium text-[var(--text-primary)]">cookies:</strong> To read your Memoize login session for authentication.</span></li>
          <li className="flex gap-2"><span className="text-[var(--text-muted)] mt-0.5">—</span><span><strong className="font-medium text-[var(--text-primary)]">tabs:</strong> To detect when you're on LeetCode or Codeforces and open the popup after an accepted submission.</span></li>
          <li className="flex gap-2"><span className="text-[var(--text-muted)] mt-0.5">—</span><span><strong className="font-medium text-[var(--text-primary)]">scripting:</strong> To inject the submission detector on LeetCode pages and scrape group data from Codeforces.</span></li>
          <li className="flex gap-2"><span className="text-[var(--text-muted)] mt-0.5">—</span><span><strong className="font-medium text-[var(--text-primary)]">storage:</strong> To cache your handle, auth token, and last sync time locally.</span></li>
          <li className="flex gap-2"><span className="text-[var(--text-muted)] mt-0.5">—</span><span><strong className="font-medium text-[var(--text-primary)]">alarms:</strong> To keep the service worker alive during long Codeforces group syncs.</span></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Your rights</h2>
        <p className="text-[var(--text-secondary)]">
          You can delete your account and all associated data at any time by contacting
          us. We will permanently remove your data from our database within 7 days of
          your request.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Changes to this policy</h2>
        <p className="text-[var(--text-secondary)]">
          If we make material changes to this policy, we will update the date at the top
          of this page. Continued use of Memoize after changes constitutes acceptance of
          the updated policy.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3">Contact</h2>
        <p className="text-[var(--text-secondary)]">
          Questions about this policy? Reach out at{" "}
          <a
            href="mailto:nk05661@email.com"
            className="underline underline-offset-2 text-[var(--text-primary)]"
          >
            nk05661@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}