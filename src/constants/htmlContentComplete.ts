// Complete HTML content for the web-only experience
export const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clearsight IP - Skills Insight for Real People</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script nonce="__CSP_NONCE__">
    window.tailwind = window.tailwind || {};
    window.tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#14b8a6',
            accent: '#14b8a6',
            background: '#0f172a',
            text: '#e2e8f0'
          }
        }
      }
    };
    var tailwind = window.tailwind;
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      scroll-behavior: smooth;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
    .nav-link {
      position: relative;
      transition: color 0.3s ease;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 0;
      height: 2px;
      background-color: #14b8a6;
      transition: width 0.3s ease;
    }
    .nav-link:hover::after {
      width: 100%;
    }
    section {
      scroll-margin-top: 4rem;
    }
    button:focus,
    input:focus,
    a:focus {
      outline: 2px solid #14b8a6;
      outline-offset: 2px;
    }
  </style>
</head>
<body class="bg-slate-900 text-gray-200">
  <nav class="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <a href="/" class="text-xl font-bold text-primary">Clearsight IP</a>
        </div>
        <div class="hidden md:flex items-center space-x-8">
          <a href="#features" class="nav-link text-gray-300 hover:text-primary">Success Stories</a>
          <a href="#how-it-works" class="nav-link text-gray-300 hover:text-primary">How It Works</a>
          <a href="#pricing" class="nav-link text-gray-300 hover:text-primary">Pricing</a>
          <a href="#faq" class="nav-link text-gray-300 hover:text-primary">FAQ</a>
          <a href="#contact" class="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors">Contact</a>
        </div>
        <div class="md:hidden">
          <button id="mobileMenuBtn" class="text-gray-300 hover:text-primary" aria-label="Open menu">
            <span class="text-2xl">☰</span>
          </button>
        </div>
      </div>
    </div>
    <div id="mobileMenu" class="hidden md:hidden bg-slate-800 border-t border-slate-700">
      <div class="px-4 py-4 space-y-4">
        <a href="#features" class="block text-gray-300 hover:text-primary py-2">Success Stories</a>
        <a href="#how-it-works" class="block text-gray-300 hover:text-primary py-2">How It Works</a>
        <a href="#pricing" class="block text-gray-300 hover:text-primary py-2">Pricing</a>
        <a href="#faq" class="block text-gray-300 hover:text-primary py-2">FAQ</a>
        <a href="#contact" class="block text-primary py-2">Contact</a>
      </div>
    </div>
  </nav>

  <main>
    <section class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 class="text-4xl lg:text-6xl font-bold mb-6">
              Clear insight into the skills that move your career forward.
            </h1>
            <p class="text-xl text-gray-300 mb-8">
              Clearsight IP turns career uncertainty into a focused, practical path. Get clarity on what to build next and why it matters.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <a href="#contact" class="bg-primary hover:bg-primary/80 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors text-center">
                Talk to Us
              </a>
              <a href="#features" class="border border-gray-600 hover:border-primary text-gray-300 hover:text-primary px-8 py-4 rounded-lg text-lg font-semibold transition-colors text-center">
                See the Results
              </a>
            </div>
          </div>
          <div class="relative">
            <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 class="text-primary font-semibold mb-4">Career Progress, Simplified</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-300">Clarity on priorities</span>
                  <span class="text-green-400 font-bold">High</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-300">Actionable next steps</span>
                  <span class="text-green-400 font-bold">Clear</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-300">Confidence to act</span>
                  <span class="text-green-400 font-bold">Stronger</span>
                </div>
              </div>
              <div class="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
                <h4 class="text-primary font-semibold mb-2">What you gain:</h4>
                <ul class="text-gray-300 space-y-1">
                  <li>Focused skill roadmap</li>
                  <li>Competitive positioning</li>
                  <li>Clear learning priorities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="py-20 bg-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-white mb-4">Success Stories</h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Real professionals using clear, focused insight to move faster and smarter.
          </p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span class="text-white font-semibold">SM</span>
              </div>
              <div class="ml-4">
                <h3 class="font-semibold text-white">Sarah M.</h3>
                <p class="text-gray-400">Software Engineer</p>
              </div>
            </div>
            <p class="text-gray-300 mb-4">
              "I finally knew which skills mattered most for the next role and stopped wasting time on the wrong things."
            </p>
            <div class="text-primary font-semibold">Clear priorities</div>
          </div>

          <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span class="text-white font-semibold">MR</span>
              </div>
              <div class="ml-4">
                <h3 class="font-semibold text-white">Mike R.</h3>
                <p class="text-gray-400">Marketing Manager</p>
              </div>
            </div>
            <p class="text-gray-300 mb-4">
              "It gave me a focused roadmap and helped me communicate my value with confidence."
            </p>
            <div class="text-primary font-semibold">Stronger story</div>
          </div>

          <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span class="text-white font-semibold">LK</span>
              </div>
              <div class="ml-4">
                <h3 class="font-semibold text-white">Lisa K.</h3>
                <p class="text-gray-400">Recent Graduate</p>
              </div>
            </div>
            <p class="text-gray-300 mb-4">
              "I used the guidance to focus my learning and felt confident in interviews."
            </p>
            <div class="text-primary font-semibold">Faster momentum</div>
          </div>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="py-20 bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            A simple, guided path from uncertainty to focused action.
          </p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-white text-2xl font-bold">1</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Share your goals</h3>
            <p class="text-gray-300">
              Tell us the role you want and the experience you already have.
            </p>
          </div>
          <div class="text-center">
            <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-white text-2xl font-bold">2</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Get focused insight</h3>
            <p class="text-gray-300">
              We highlight the highest impact skills so you can prioritize with confidence.
            </p>
          </div>
          <div class="text-center">
            <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-white text-2xl font-bold">3</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Act with clarity</h3>
            <p class="text-gray-300">
              Use a clear, actionable roadmap that turns learning into career progress.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="pricing" class="py-20 bg-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-white mb-4">Pricing</h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Simple, transparent pricing for individuals and teams.
          </p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-slate-700 rounded-lg p-8 border border-slate-600">
            <h3 class="text-2xl font-bold text-white mb-2">Starter</h3>
            <p class="text-gray-400 mb-6">For individuals building momentum.</p>
            <div class="text-4xl font-bold text-white mb-6">$29</div>
            <ul class="text-gray-300 space-y-2 mb-6">
              <li>1 focused insight session</li>
              <li>Personal skill roadmap</li>
              <li>Priority recommendations</li>
            </ul>
            <a href="#contact" class="block text-center bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded">Contact Us</a>
          </div>

          <div class="bg-slate-700 rounded-lg p-8 border border-primary/60">
            <h3 class="text-2xl font-bold text-white mb-2">Pro</h3>
            <p class="text-gray-400 mb-6">For accelerated career movement.</p>
            <div class="text-4xl font-bold text-white mb-6">$59</div>
            <ul class="text-gray-300 space-y-2 mb-6">
              <li>3 insight sessions</li>
              <li>Roadmap updates</li>
              <li>Role fit guidance</li>
            </ul>
            <a href="#contact" class="block text-center bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded">Contact Us</a>
          </div>

          <div class="bg-slate-700 rounded-lg p-8 border border-slate-600">
            <h3 class="text-2xl font-bold text-white mb-2">Teams</h3>
            <p class="text-gray-400 mb-6">For managers and growing teams.</p>
            <div class="text-4xl font-bold text-white mb-6">Custom</div>
            <ul class="text-gray-300 space-y-2 mb-6">
              <li>Team-level insights</li>
              <li>Learning priorities</li>
              <li>Progress snapshots</li>
            </ul>
            <a href="#contact" class="block text-center bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded">Contact Us</a>
          </div>
        </div>
      </div>
    </section>

    <section id="faq" class="py-20 bg-slate-900">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-white mb-4">FAQ</h2>
          <p class="text-xl text-gray-300">A few quick answers.</p>
        </div>
        <div class="space-y-6">
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Is everything available on the website?</h3>
            <p class="text-gray-300">Yes. The experience is fully web-based.</p>
          </div>
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-2">How do I get started?</h3>
            <p class="text-gray-300">Use the contact section below to reach out and we will guide you.</p>
          </div>
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Do you support teams?</h3>
            <p class="text-gray-300">Yes, we provide team-level insights and planning support.</p>
          </div>
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Where can I find legal terms?</h3>
            <p class="text-gray-300">Use the links in the footer for privacy and terms.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="contact" class="py-20 bg-slate-800">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl font-bold text-white mb-4">Contact</h2>
        <p class="text-xl text-gray-300 mb-8">
          Reach out for availability, team plans, or general questions.
        </p>
        <div class="inline-flex items-center gap-3 bg-slate-700 border border-slate-600 rounded-lg px-6 py-4">
          <span class="text-gray-300">Email:</span>
          <a href="mailto:support@clearsight-ip.com" class="text-primary font-semibold hover:text-primary/80">support@clearsight-ip.com</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="bg-slate-900 border-t border-slate-800 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="text-gray-400 text-sm">Copyright 2026 Clearsight IP. All rights reserved.</div>
      <div class="flex items-center space-x-6 text-sm">
        <a href="/privacy" class="text-gray-400 hover:text-primary">Privacy</a>
        <a href="/terms" class="text-gray-400 hover:text-primary">Terms</a>
        <a href="/dpa" class="text-gray-400 hover:text-primary">DPA</a>
        <a href="/data-retention" class="text-gray-400 hover:text-primary">Data Retention</a>
        <a href="/dsr" class="text-gray-400 hover:text-primary">Privacy Requests</a>
      </div>
    </div>
  </footer>

  <script>
    (function() {
      var menuBtn = document.getElementById('mobileMenuBtn');
      var mobileMenu = document.getElementById('mobileMenu');
      if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
          mobileMenu.classList.toggle('hidden');
        });
      }
    })();
  </script>
</body>
</html>`;
