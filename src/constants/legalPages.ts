// Centralized legal pages for the public website
// NOTE: These pages are informational templates. Review with counsel before production.

function basePage(title: string, body: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Clearsight IP</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style> body { font-family: 'Inter', sans-serif; } </style>
</head>
<body class="bg-slate-900 text-gray-200">
  <nav class="bg-slate-800 border-b border-slate-700">
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <a href="/" class="text-primary font-bold">Clearsight IP</a>
      <div class="text-sm space-x-4">
        <a href="/privacy" class="hover:text-primary">Privacy</a>
        <a href="/terms" class="hover:text-primary">Terms</a>
        <a href="/dpa" class="hover:text-primary">DPA</a>
        <a href="/data-retention" class="hover:text-primary">Data Retention</a>
        <a href="/dsr" class="hover:text-primary">Privacy Requests</a>
        <a href="/status" class="hover:text-primary">Status</a>
      </div>
    </div>
  </nav>

  <main class="max-w-5xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold text-white mb-2">${title}</h1>
    <p class="text-gray-400 text-sm mb-8">Last updated: ${today}</p>
    ${body}
    <div class="mt-10 text-sm text-gray-400">
      <button id="cookieSettingsLink" class="underline hover:text-primary" type="button">Cookie Settings</button>
      <span class="mx-2">•</span>
      <a href="/" class="underline hover:text-primary">Back to Home</a>
    </div>
  </main>

  <script>
  // Simple opener to show the cookie settings on the home page
  document.getElementById('cookieSettingsLink')?.addEventListener('click', function(){
    window.location.href='/?cookies=open';
  });
  </script>
</body>
</html>`;
}

export const PRIVACY_POLICY_HTML = basePage('Privacy Policy', `
  <div class="space-y-6">
    <p>
      This Privacy Policy explains how Clearsight IP ("we", "us") collects, uses, and protects personal information when you use our website and services.
    </p>

    <h2 class="text-2xl font-semibold text-white">Information We Process</h2>
    <ul class="list-disc ml-6 space-y-1 text-gray-300">
      <li>Account data (email, name) to create and secure your account</li>
      <li>Content you submit (e.g., resume/CV text, job descriptions) to perform analysis</li>
      <li>Usage and diagnostics data to improve reliability and performance</li>
      <li>Payment/credit events (non-sensitive, via our provider) for billing</li>
    </ul>

    <h2 class="text-2xl font-semibold text-white">Lawful Bases</h2>
    <ul class="list-disc ml-6 space-y-1 text-gray-300">
      <li>Contract: to provide the service you request (e.g., account, analyses)</li>
      <li>Legitimate interests: ensuring security, preventing fraud, service improvement</li>
      <li>Consent: non-essential cookies/analytics/marketing where applicable</li>
      <li>Legal obligation: compliance and audit logs where required</li>
    </ul>

    <h2 class="text-2xl font-semibold text-white">Cookies and Similar Technologies</h2>
    <p>
      We use strictly necessary cookies to operate the site. With your consent, we may use analytics, functional, and marketing cookies. You can manage preferences using the Cookie Settings link or banner. See also our Cookie section below.
    </p>
    <div class="bg-slate-800 border border-slate-700 rounded p-4">
      <h3 class="font-semibold text-white mb-2">Cookie Categories and Lawful Bases</h3>
      <ul class="list-disc ml-6 space-y-1 text-gray-300">
        <li>Strictly necessary – lawful basis: contract/legitimate interests (always on)</li>
        <li>Analytics – lawful basis: consent</li>
        <li>Functional – lawful basis: consent</li>
        <li>Marketing – lawful basis: consent</li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold text-white">Data Retention</h2>
    <p>We follow retention limits consistent with our <a class="underline text-primary" href="/data-retention">Data Retention Policy</a>.</p>

    <h2 class="text-2xl font-semibold text-white">Your Rights</h2>
    <p>
      Depending on your location, you may have rights of access, deletion, correction, restriction, portability, and objection. You can submit a request via our <a class="underline text-primary" href="/dsr">Privacy Requests (DSR)</a> page or by contacting support.
    </p>

    <h2 class="text-2xl font-semibold text-white">Contact</h2>
    <p>Email: privacy@clearsight-ip.com</p>
  </div>
`);

export const TERMS_HTML = basePage('Terms of Service', `
  <div class="space-y-6">
    <p>
      These Terms govern your use of the Clearsight IP services. By using our services, you agree to these Terms.
    </p>

    <h2 class="text-2xl font-semibold text-white">Accounts</h2>
    <p>You are responsible for maintaining the confidentiality of your account and for all activities under it.</p>

    <h2 class="text-2xl font-semibold text-white">Acceptable Use</h2>
    <ul class="list-disc ml-6 space-y-1 text-gray-300">
      <li>No illegal, harmful, or abusive use of the service</li>
      <li>No security testing or scraping without authorization</li>
      <li>No infringement of third-party rights</li>
    </ul>

    <h2 class="text-2xl font-semibold text-white">Payments</h2>
    <p>Credits and purchases are processed by our payment provider. Taxes may apply based on your location.</p>

    <h2 class="text-2xl font-semibold text-white">Disclaimers</h2>
    <p>
      Our analyses are informational. We do not guarantee specific outcomes. To the maximum extent permitted by law, we disclaim implied warranties.
    </p>

    <h2 class="text-2xl font-semibold text-white">Limitation of Liability</h2>
    <p>
      To the extent permitted by law, our liability is limited to the amounts you paid in the 12 months preceding the claim.
    </p>

    <h2 class="text-2xl font-semibold text-white">Contact</h2>
    <p>Email: legal@clearsight-ip.com</p>
  </div>
`);

export const DPA_HTML = basePage('Data Processing Addendum (DPA)', `
  <div class="space-y-6">
    <p>
      This DPA applies where we process personal data on your behalf as a processor. It forms part of our agreement with you.
    </p>

    <h2 class="text-2xl font-semibold text-white">Roles</h2>
    <p>You are the controller; Clearsight IP is the processor. Subprocessors may assist (e.g., hosting, payments).
    </p>

    <h2 class="text-2xl font-semibold text-white">Processor Obligations</h2>
    <ul class="list-disc ml-6 space-y-1 text-gray-300">
      <li>Process personal data only on documented instructions</li>
      <li>Implement appropriate technical and organizational measures</li>
      <li>Assist with data subject requests and security incidents</li>
      <li>Maintain records and enable audits subject to confidentiality</li>
      <li>Use subprocessors under written agreements and remain liable</li>
    </ul>

    <h2 class="text-2xl font-semibold text-white">International Transfers</h2>
    <p>
      Transfers will rely on appropriate safeguards (e.g., SCCs) where required.
    </p>

    <h2 class="text-2xl font-semibold text-white">Data Subject Requests</h2>
    <p>
      We will notify and support you in responding to requests. See <a href="/dsr" class="underline text-primary">Privacy Requests</a>.
    </p>
  </div>
`);

export const DATA_RETENTION_HTML = basePage('Data Retention Policy', `
  <div class="space-y-6">
    <p>We retain personal data only as long as necessary for the purposes described and to meet legal obligations. Representative limits:</p>
    <ul class="list-disc ml-6 space-y-1 text-gray-300">
      <li>Skill assessments: 12 months</li>
      <li>Gap analysis results: 6 months</li>
      <li>User profiles: up to 24 months after last activity</li>
      <li>Error tracking logs: 3 months</li>
      <li>General application logs: 1 month</li>
      <li>Analytics data: 12 months</li>
      <li>Cache data: 7 days</li>
      <li>Audit logs (security/compliance): up to 7 years</li>
    </ul>
    <p>
      We also provide account-level deletion with a short grace period. See our <a href="/privacy" class="underline text-primary">Privacy Policy</a> for details.
    </p>
  </div>
`);

export const DSR_HTML = basePage('Privacy Requests (DSR)', `
  <div class="space-y-6">
    <p>
      Use this form to request: access/export of your data, deletion, or correction. If you have an account, using the email tied to your account will help us verify your identity.
    </p>

    <form id="dsrForm" class="bg-slate-800 border border-slate-700 rounded p-6 space-y-4 max-w-xl">
      <div>
        <label class="block text-sm text-gray-300 mb-1">Request Type</label>
        <select id="requestType" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
          <option value="access">Access / Copy</option>
          <option value="export">Export (portable copy)</option>
          <option value="delete">Delete Account & Data</option>
          <option value="rectify">Correct Data</option>
          <option value="opt_out">Opt-out (marketing)</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-300 mb-1">Email</label>
        <input id="email" type="email" required class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" placeholder="you@example.com" />
      </div>
      <div>
        <label class="block text-sm text-gray-300 mb-1">Details (optional)</label>
        <textarea id="details" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" rows="4" placeholder="Add any specifics that help us process your request..."></textarea>
      </div>
      <button type="submit" class="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded">Submit Request</button>
      <p id="dsrMsg" class="text-sm text-gray-400 mt-2"></p>
    </form>

    <p class="text-sm text-gray-400">If you are signed in, you may also use in-app privacy tools in your account.</p>
  </div>

  <script>
  (function(){
    const form = document.getElementById('dsrForm');
    const msg = document.getElementById('dsrMsg');
    form?.addEventListener('submit', async function(e){
      e.preventDefault();
      msg.textContent = '';
      var typeEl = document.getElementById('requestType');
      var type = (typeEl && (typeEl).value) ? (typeEl).value : 'access';
      var emailEl = document.getElementById('email');
      var email = (emailEl && (emailEl).value) ? (emailEl).value : '';
      var detailsEl = document.getElementById('details');
      var details = (detailsEl && (detailsEl).value) ? (detailsEl).value : '';
      try {
        const res = await fetch('/api/v1/privacy/dsr-public', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, email, details })
        });
        const data = await res.json().catch(()=>({}));
        if (res.ok) {
          msg.textContent = 'Request submitted. We will follow up via email.';
          msg.className = 'text-sm text-green-400';
          form.reset();
        } else {
          msg.textContent = data?.error?.message || 'Submission failed. Please try again later.';
          msg.className = 'text-sm text-red-400';
        }
      } catch (err) {
        msg.textContent = 'Network error. Please try again later.';
        msg.className = 'text-sm text-red-400';
      }
    });
    document.getElementById('cookieSettingsLink')?.addEventListener('click', function(){
      window.location.href='/?cookies=open';
    });
  })();
  </script>
`);

export const STATUS_HTML = basePage('System Status', `
  <div id="statusWrap" class="space-y-6">
    <div class="bg-slate-800 border border-slate-700 rounded p-6">
      <h2 class="text-xl font-semibold text-white mb-2">Overall</h2>
      <div id="overall" class="text-gray-300">Loading...</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded p-6">
      <h2 class="text-xl font-semibold text-white mb-2">Details</h2>
      <pre id="details" class="text-xs text-gray-300 whitespace-pre-wrap"></pre>
    </div>
  </div>
  <script>
    (async function(){
      try {
        const health = await fetch('/health').then(r=>r.json());
        const detailed = await fetch('/health/detailed').then(r=>r.json());
        const overall = document.getElementById('overall');
        const details = document.getElementById('details');
        overall.textContent = 'Status: ' + (health?.status || 'unknown') + ' • env=' + (health?.environment || 'n/a');
        details.textContent = JSON.stringify(detailed, null, 2);
      } catch (e) {
        document.getElementById('overall').textContent = 'Unable to fetch status';
      }
    })();
  </script>
`);

