import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  useSelector((state) => state.auth);

  return (
    <div className="font-[Inter,sans-serif] min-h-screen text-gray-400" style={{ background: '#050505' }}>

      {/* ── Nav ── */}
      <nav>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-8 flex-wrap">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg no-underline">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Audicle
            </Link>
            <ul className="hidden sm:flex gap-7 list-none m-0 p-0">
              <li><a href="#features" className="text-sm font-medium text-gray-500 hover:text-white transition-colors no-underline">Features</a></li>
              <li><a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-white transition-colors no-underline">How it Works</a></li>
              <li><a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-white transition-colors no-underline">Pricing</a></li>
              <li><a href="#faq" className="text-sm font-medium text-gray-500 hover:text-white transition-colors no-underline">FAQ</a></li>
            </ul>
          </div>
          <Link to="/register" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold tracking-widest transition-colors no-underline whitespace-nowrap">
            TRY NOW
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="text-center md:text-left">
          <span className="inline-block px-4 py-1.5 rounded-full text-[0.68rem] font-bold tracking-[0.12em] uppercase text-blue-400 border border-blue-500/25 bg-blue-500/10 mb-6">
            AI-Powered Meeting Intelligence
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Your meetings,&nbsp;<br />
            <em style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: '#9ca3af' }}>
              captured with intelligence.
            </em>
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-md leading-relaxed mb-9 mx-auto md:mx-0">
            Audicle transforms every conversation into a searchable, actionable library.
            Curating wisdom from the noise of daily operations.
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Link to="/register" className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold tracking-widest transition-colors no-underline">
              TRY NOW
            </Link>
            <button className="px-7 py-3 bg-transparent text-white border border-white/10 hover:bg-white/5 rounded-md text-xs font-bold tracking-widest transition-colors cursor-pointer">
              VIEW METHODOLOGY
            </button>
          </div>
        </div>

        {/* Visual */}
        <div className="relative flex justify-center items-end h-[26rem] md:h-[30rem] mt-12 md:mt-0">
          <div
            className="absolute -top-6 md:top-8 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-[90%] md:w-64 p-5 z-10"
            style={{ background: '#1c1f26', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
          >
            <div className="text-[0.62rem] font-bold tracking-[0.14em] uppercase text-blue-400 mb-3">Fun Fact</div>
            <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.65' }}>
              "The average professional spends 31 hours a month in unproductive meetings. I'm here to fix that."
            </p>
            <div
              className="absolute"
              style={{ bottom: '-10px', right: '28px', width: '20px', height: '20px', background: '#1c1f26', clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
            />
          </div>
          <div className="mb-6">
            <BotSVG />
          </div>
        </div>
      </header>

      {/* ── Metrics ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <Metric number="1.2M+" label="Minutes Transcribed" />
        <Metric number="98.4%" label="Accuracy Rating" />
        <Metric number="4,000+" label="Teams Onboarded" />
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">Crafted for Clarity</h2>
        <p className="text-gray-500 text-sm mb-10">Tools that turn chaotic audio into structured intelligence.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FeatureCard
            icon={<SearchIcon />}
            title="Semantic Analysis"
            desc="Go beyond words. Our AI understands context, intent, and technical nuances specific to your domain."
          />
          <FeatureCard
            icon={<ZapIcon />}
            title="Instant Summaries"
            desc="Turn 60-minute syncs into 2-minute executive briefs automatically, delivered the moment the call ends."
          />
          <FeatureCard
            icon={<GlobeIcon />}
            title="Universal Search"
            desc="Search through every meeting across your entire organization instantly — by keyword, topic, or speaker."
          />
          <FeatureCard
            icon={<CheckCircleIcon />}
            title="Action Item Tracking"
            desc="Audicle detects commitments and follow-ups automatically, turning them into assignable tasks."
          />
          <FeatureCard
            icon={<MicIcon />}
            title="Speaker Identification"
            desc="Know who said what. Audicle learns voices and labels transcripts by speaker automatically."
          />
          <FeatureCard
            icon={<ShareIcon />}
            title="One-click Sharing"
            desc="Share a clean, branded summary with stakeholders — no login required on their end."
          />
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="border-t border-b border-white/5 py-20 px-6" style={{ background: '#080808' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2
              className="italic text-3xl md:text-4xl font-bold text-white tracking-tight mb-10"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              The Flow of Intelligence
            </h2>
            <div className="flex flex-col gap-8">
              <Step num="1" title="Connect Your Calendar" desc="Sync Google or Outlook. We'll automatically identify upcoming syncs and join at the right time." />
              <Step num="2" title="The Bot Joins" desc="A silent, non-intrusive participant records and transcribes in real-time with 98%+ accuracy." />
              <Step num="3" title="Editorial Summary" desc="Within minutes of ending, receive a curated digest of key decisions, action items, and highlights." />
              <Step num="4" title="Archive & Search" desc="Every meeting becomes a searchable asset in your company's institutional memory." />
            </div>
          </div>
          <div
            className="rounded-2xl border border-white/5 flex items-center justify-center"
            style={{ background: '#111', aspectRatio: '16/10' }}
          >
            <PlayIcon />
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-6" style={{ background: '#050505' }}>
        <div className="max-w-7xl mx-auto">
          <SectionLabel>Testimonials</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">Trusted by teams that move fast</h2>
          <p className="text-gray-500 text-sm mb-10">Real feedback from real users across industries.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <TestimonialCard
              quote="We cut our post-meeting note-taking time by 80%. Audicle just handles it — and the summaries are shockingly accurate."
              name="Sarah R."
              role="Head of Product, Finstack"
              initials="SR"
              color="#1e3a8a"
            />
            <TestimonialCard
              quote="The semantic search is a game changer. I found a decision from six months ago in under 10 seconds. Nothing else comes close."
              name="Marcus K."
              role="Engineering Lead, Orbital"
              initials="MK"
              color="#064e3b"
            />
            <TestimonialCard
              quote="Our investors love the transparency. Every alignment call is archived, searchable, and summarized in a way that actually makes sense."
              name="Anika J."
              role="CEO, Veloform"
              initials="AJ"
              color="#3b1e6a"
            />
          </div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="border-t border-white/5 py-20 px-6" style={{ background: '#080808' }}>
        <div className="max-w-7xl mx-auto text-center">
          <SectionLabel>Integrations</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">Works with your stack</h2>
          <p className="text-gray-500 text-sm mb-10">Connects in seconds. No API keys, no engineers required.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: 'Google Meet', color: '#34a853' },
              { label: 'Zoom', color: '#2684ff' },
              { label: 'Microsoft Teams', color: '#7b5ea7' },
              { label: 'Webex', color: '#00bcd4' },
              { label: 'Google Calendar', color: '#f77f00' },
              { label: 'Outlook', color: '#0072c6' },
              { label: 'Slack', color: '#4a154b' },
              { label: 'Notion', color: '#ffffff' },
              { label: 'Jira', color: '#e84855' },
              { label: 'GitHub', color: '#2ea44f' },
            ].map(({ label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2.5 border border-white/5 rounded-full text-xs font-medium text-gray-400 hover:border-blue-500/30 hover:text-white transition-all cursor-default"
                style={{ background: '#0a0a0a' }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-6" style={{ background: '#050505' }}>
        <div className="max-w-7xl mx-auto">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">Simple, transparent pricing</h2>
          <p className="text-gray-500 text-sm mb-10">Start free. Scale when you're ready. Cancel anytime.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PricingCard
              name="Starter"
              price="$0"
              period="/mo"
              desc="For individuals getting started with meeting intelligence."
              features={['5 meetings / month', 'Basic AI summaries', '7-day archive', '1 calendar sync']}
              ctaLabel="Get started free"
              ctaTo="/register"
            />
            <PricingCard
              name="Pro"
              price="$19"
              period="/mo"
              desc="For professionals who live in meetings and need full power."
              features={['Unlimited meetings', 'Semantic AI search', 'Unlimited archive', 'Action item tracking', 'Slack & Notion export', 'Speaker identification']}
              ctaLabel="Try now"
              ctaTo="/register"
              featured
            />
            <PricingCard
              name="Team"
              price="$49"
              period="/mo"
              desc="For teams that need shared intelligence and admin controls."
              features={['Everything in Pro', 'Up to 20 members', 'Shared meeting library', 'Admin dashboard', 'SSO & SAML', 'Priority support']}
              ctaLabel="Contact sales"
              ctaTo="/contact"
            />
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section className="border-t border-white/5 py-20 px-6" style={{ background: '#080808' }}>
        <div className="max-w-7xl mx-auto">
          <SectionLabel>Security & Compliance</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">Built for enterprise trust</h2>
          <p className="text-gray-500 text-sm mb-10">Your conversations stay yours. Always.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <SecurityCard
              icon={<ShieldIcon />}
              title="SOC 2 Type II"
              desc="Independently audited security controls across all infrastructure and processes."
            />
            <SecurityCard
              icon={<LockIcon />}
              title="AES-256 Encryption"
              desc="All audio, transcripts, and summaries are encrypted at rest and in transit."
            />
            <SecurityCard
              icon={<GdprIcon />}
              title="GDPR Compliant"
              desc="Full data residency control. Delete your data anytime, instantly, with no recovery."
            />
            <SecurityCard
              icon={<UsersIcon />}
              title="Zero Data Sharing"
              desc="Your transcripts are never used to train any AI model. Not ours, not anyone's."
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-6" style={{ background: '#050505' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Common questions</h2>
          </div>
          <div className="flex flex-col divide-y divide-white/5">
            <FAQItem
              q="Does the bot notify meeting participants?"
              a="Yes — transparency is important to us. Audicle announces itself when joining and participants see a recording indicator. You can configure custom join messages per workspace."
            />
            <FAQItem
              q="What languages are supported?"
              a="Audicle currently supports 28 languages including English, Spanish, French, German, Mandarin, Japanese, Hindi, and Arabic, with more being added monthly."
            />
            <FAQItem
              q="How accurate is the transcription?"
              a="We average 98.4% accuracy across standard meeting conditions. Accuracy increases over time as Audicle learns your team's vocabulary, names, and internal terminology."
            />
            <FAQItem
              q="Can I use Audicle without a calendar sync?"
              a="Absolutely. You can invite the bot directly via a meeting link, or upload audio and video recordings for post-processing — no calendar connection required."
            />
            <FAQItem
              q="Is there a free trial for the Pro plan?"
              a="Yes. Every new account gets a 14-day free trial of Pro with no credit card required. Downgrade, upgrade, or cancel anytime from your dashboard."
            />
            <FAQItem
              q="Where is my data stored?"
              a="Data is stored in SOC 2-certified data centers in the US and EU. Enterprise customers can choose their region and opt for dedicated storage."
            />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="border-t border-white/5 py-24 px-6 text-center" style={{ background: '#080808' }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight mb-5">
            Stop losing what<br />
            <em style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400, color: '#9ca3af' }}>
              matters in your meetings.
            </em>
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-9 max-w-md mx-auto">
            Join 4,000+ teams already using Audicle to build a searchable memory of every decision, idea, and commitment.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold tracking-widest transition-colors no-underline"
          >
            TRY NOW — IT'S FREE
          </Link>
          <p className="text-xs text-white/15 mt-4">No credit card required · 14-day Pro trial · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Audicle
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-white/20 hover:text-white/50 transition-colors no-underline">Privacy</a>
            <a href="#" className="text-xs text-white/20 hover:text-white/50 transition-colors no-underline">Terms</a>
            <a href="#" className="text-xs text-white/20 hover:text-white/50 transition-colors no-underline">Security</a>
            <a href="#" className="text-xs text-white/20 hover:text-white/50 transition-colors no-underline">Contact</a>
          </div>
          <p className="text-xs text-white/15">© {new Date().getFullYear()} Audicle. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400;1,600&display=swap');
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
        }
        .bot-floating { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

/* ── Helpers ── */

const SectionLabel = ({ children }) => (
  <div className="text-[0.65rem] font-bold tracking-[0.16em] uppercase text-blue-400 mb-3">{children}</div>
);

/* ── Sub-components ── */

const Metric = ({ number, label }) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-1">{number}</div>
    <div className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-gray-600">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div
    className="group p-7 rounded-xl border border-white/5 hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 cursor-default"
    style={{ background: '#0a0a0a' }}
  >
    <div className="inline-flex items-center justify-center p-2.5 rounded-lg bg-blue-500/10 text-blue-400 mb-5 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-white mb-2.5">{title}</h3>
    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ num, title, desc }) => (
  <div className="flex gap-5 items-start">
    <div className="shrink-0 w-8 h-8 rounded-full border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center">
      {num}
    </div>
    <div>
      <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const TestimonialCard = ({ quote, name, role, initials, color }) => (
  <div
    className="p-6 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300"
    style={{ background: '#0a0a0a' }}
  >
    {/* Quote marks */}
    <div className="text-3xl text-blue-500/30 leading-none mb-3 font-serif">"</div>
    <p className="text-xs text-gray-500 leading-relaxed mb-6 italic">{quote}</p>
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
        style={{ background: color }}
      >
        {initials}
      </div>
      <div>
        <div className="text-xs font-bold text-white">{name}</div>
        <div className="text-[10px] text-gray-600">{role}</div>
      </div>
    </div>
  </div>
);

const PricingCard = ({ name, price, period, desc, features, ctaLabel, ctaTo, featured }) => (
  <div
    className={`p-7 rounded-2xl border flex flex-col transition-all duration-300 ${
      featured
        ? 'border-blue-500/40 relative'
        : 'border-white/5 hover:border-white/10'
    }`}
    style={{ background: featured ? '#0d1525' : '#0a0a0a' }}
  >
    {featured && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 rounded-full text-[10px] font-bold tracking-widest text-white uppercase whitespace-nowrap">
        Most Popular
      </div>
    )}
    <div>
      <div className="text-xs font-bold text-white mb-1">{name}</div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-bold text-white tracking-tight">{price}</span>
        <span className="text-xs text-gray-600">{period}</span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed mb-6">{desc}</p>
      <ul className="flex flex-col gap-2.5 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-xs text-gray-500">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <CheckMiniIcon />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </div>
    <Link
      to={ctaTo}
      className={`mt-auto block text-center py-2.5 rounded-lg text-[11px] font-bold tracking-widest uppercase no-underline transition-colors ${
        featured
          ? 'bg-blue-600 hover:bg-blue-500 text-white'
          : 'border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white'
      }`}
    >
      {ctaLabel}
    </Link>
  </div>
);

const SecurityCard = ({ icon, title, desc }) => (
  <div
    className="p-6 rounded-xl border border-white/5 hover:border-blue-500/20 transition-all duration-300 group"
    style={{ background: '#0a0a0a' }}
  >
    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-xs font-bold text-white mb-2">{title}</h4>
    <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5 cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-semibold text-white">{q}</h4>
        <span
          className={`text-blue-400 text-lg font-light flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </div>
      {open && (
        <p className="text-xs text-gray-500 leading-relaxed mt-3 pr-8">{a}</p>
      )}
    </div>
  );
};

/* ── Icons ── */

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
    stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const CheckMiniIcon = () => (
  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
    <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const GdprIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BotSVG = () => (
  <svg className="bot-floating w-full max-w-[280px] md:max-w-none h-auto" viewBox="0 0 240 240" fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="120" cy="225" rx="50" ry="8" fill="white" opacity="0.1" />
    <line x1="120" y1="50" x2="120" y2="30" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
    <circle cx="120" cy="25" r="6" fill="#3b82f6" />
    <rect x="60" y="50" width="120" height="95" rx="28" fill="white" />
    <circle cx="95" cy="90" r="10" fill="#1e3a8a" />
    <circle cx="145" cy="90" r="10" fill="#1e3a8a" />
    <path d="M100 115 Q120 125 140 115" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
    <rect x="80" y="155" width="80" height="50" rx="20" fill="#3b82f6" />
    <rect x="100" y="170" width="40" height="12" rx="6" fill="white" fillOpacity="0.4" />
    <path d="M75 170 Q50 170 50 190" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
    <path d="M165 170 Q190 170 190 190" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

export default LandingPage;