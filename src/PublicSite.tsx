import { useEffect, useState } from 'react';
import { ArrowRight, Menu, Wallet, X, Linkedin, Mail } from 'lucide-react';
import './public-home.css';

type PublicPage = 'home' | 'about' | 'contact' | 'terms' | 'privacy' | 'legal';
const pages: Record<Exclude<PublicPage, 'home'>, { title: string; intro: string }> = {
  about: { title: 'A clearer way to manage money, together and on your own.', intro: 'Soma brings personal money planning and shared-expense tracking into one thoughtful, practical tool.' },
  contact: { title: 'Tell us what would make Soma better.', intro: 'Questions, feedback or a problem with Soma? Send a message. Product feedback is welcome.' },
  terms: { title: 'Terms of Service', intro: 'The terms that apply when you use Soma’s personal and shared money-planning tools.' },
  privacy: { title: 'Privacy Policy', intro: 'A clear explanation of the information you enter into Soma and how it is handled.' },
  legal: { title: 'Legal information', intro: 'Important information about Soma, its scope and how to use it responsibly.' }
};

const productShots = [
  { src: '/soma-overview.svg', alt: 'Illustrated view of the Soma personal money dashboard', title: 'Your money, in one view', text: 'See your recorded balance, monthly spending, budget progress and recent activity together.' },
  { src: '/soma-shared-expenses.svg', alt: 'Illustrated view of a Soma shared-expense space with balances and group costs', title: 'Shared costs, made clearer', text: 'Keep a record of who paid, each person’s share and the balances still to settle.' }
];

function Brand() {
  return <a className="site-brand" href="/" aria-label="Soma home"><span className="site-brand-mark"><Wallet size={20} /></span>soma<span className="brand-dot">.</span></a>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="site-footer-main">
      <div className="footer-brand-col"><Brand /><p>Make sense of your money. Keep shared costs clear.</p></div>
      <div className="footer-col"><h4>Explore</h4><a href="/#how-it-works">How it works</a><a href="/about">About Soma</a><a href="/app">Open Soma</a></div>
      <div className="footer-col"><h4>Information</h4><a href="/contact">Contact</a><a href="/terms">Terms of Service</a><a href="/privacy">Privacy Policy</a><a href="/legal">Legal information</a></div>
    </div>
    <div className="site-footer-bottom"><span>© {new Date().getFullYear()} Soma. All rights reserved.</span><span>A money-planning tool, not a bank or financial adviser.</span></div>
  </footer>;
}
function Header() {
  const [menu, setMenu] = useState(false);
  return <header className="site-header"><div className="site-header-inner"><Brand />
    <nav className={menu ? 'site-nav is-open' : 'site-nav'} aria-label="Main navigation">
      <a href="/#how-it-works" onClick={() => setMenu(false)}>How it works</a><a href="/about" onClick={() => setMenu(false)}>About Soma</a><a className="site-login" href="/app">Open Soma <ArrowRight size={15} /></a>
    </nav>
    <div className="header-actions"><a className="header-login" href="/app">Open Soma <ArrowRight size={15} /></a><button className="site-menu-btn" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={21} /> : <Menu size={21} />}</button></div>
  </div></header>;
}

type Currency = { code: string; label: string; min: number; max: number; step: number; start: number };
const currencies: Currency[] = [
  { code: 'USD', label: '$ USD', min: 10, max: 300, step: 5, start: 90 },
  { code: 'EUR', label: '€ EUR', min: 10, max: 300, step: 5, start: 90 },
  { code: 'GBP', label: '£ GBP', min: 10, max: 300, step: 5, start: 75 },
  { code: 'NGN', label: '₦ NGN', min: 10000, max: 300000, step: 5000, start: 60000 },
  { code: 'GHS', label: 'GH₵ GHS', min: 100, max: 3000, step: 50, start: 900 },
  { code: 'KES', label: 'KSh KES', min: 1000, max: 30000, step: 500, start: 9000 }
];
const splitCents = (total: number, n: number) => {
  const base = Math.floor(total / n);
  const extra = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i >= n - extra ? 1 : 0));
};

function SplitDemo() {
  const [code, setCode] = useState('USD');
  const [amount, setAmount] = useState(90);
  const [people, setPeople] = useState(3);
  const cur = currencies.find(c => c.code === code) ?? currencies[0];
  const total = Math.round(amount * 100);
  const shares = splitCents(total, people);
  const whole = total % 100 === 0 && shares.every(s => s % 100 === 0);
  const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol', minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 }).format(cents / 100);
  const fill = ((amount - cur.min) / (cur.max - cur.min)) * 100;
  const pickCurrency = (next: string) => { const c = currencies.find(x => x.code === next) ?? currencies[0]; setCode(c.code); setAmount(c.start); };
  return <div className="hm-demo" role="group" aria-labelledby="hm-demo-title">
    <div className="hm-demo-head"><h2 id="hm-demo-title">Try a sample split</h2><label className="hm-select"><span className="sr-only">Currency</span><select value={code} onChange={e => pickCurrency(e.target.value)}>{currencies.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}</select></label></div>
    <div className="hm-field"><div className="hm-field-row"><label htmlFor="hm-bill">Bill total</label><output htmlFor="hm-bill" className="hm-amount">{money(total)}</output></div><input id="hm-bill" className="hm-range" type="range" min={cur.min} max={cur.max} step={cur.step} value={amount} onChange={e => setAmount(Number(e.target.value))} style={{ ['--fill' as string]: fill + '%' }} aria-valuetext={money(total)} /></div>
    <fieldset className="hm-people"><legend>Split between</legend><div className="hm-people-buttons">{[2, 3, 4, 5, 6].map(n => <button key={n} type="button" aria-pressed={people === n} onClick={() => setPeople(n)}>{n}</button>)}</div></fieldset>
    <div className="hm-result" aria-live="polite"><p className="hm-result-lead">You paid the bill. The others owe you their share.</p><ul className="hm-rows">
      <li className="hm-row hm-row-payer"><span className="hm-dot hm-dot-violet" aria-hidden="true" /><span className="hm-row-name">You<small>Gets back</small></span><b>{money(total - shares[0])}</b></li>
      {shares.slice(1).map((s, i) => <li key={i} className="hm-row"><span className={'hm-dot hm-dot-' + ['coral', 'lime', 'lilac', 'coral', 'lime'][i]} aria-hidden="true" /><span className="hm-row-name">{['Sam', 'Jo', 'Ari', 'Kai', 'Rue'][i]}<small>Owes you</small></span><b>{money(s)}</b></li>)}
    </ul></div>
    <p className="hm-demo-note">A sample calculation. In Soma, you can record shared expenses and see the resulting balances.</p>
  </div>;
}

function Home() {
  return <>
    <section className="hm-hero"><div className="hm-wrap hm-hero-grid"><div className="hm-hero-copy">
      <h1>Money is easier to manage when <span>everything has its place.</span></h1>
      <p className="hm-lead">Manage your spending, bills, savings goals and shared expenses in one place.</p>
      <div className="hm-actions"><a className="site-cta" href="/app">Explore Soma <ArrowRight size={17} /></a></div>
    </div><SplitDemo /></div></section>

    <section className="hm-section" id="how-it-works"><div className="hm-wrap">
      <p className="hm-eyebrow">Two sides of everyday money</p><h2 className="hm-h2">Your money is yours. Shared costs are a separate conversation.</h2>
      <div className="hm-modes">
        <article className="hm-mode"><span className="hm-mode-number">01 / PERSONAL</span><h3>Make a plan for your own money.</h3><p>Record income and everyday spending, set budgets, keep bill due dates visible and work towards savings goals. Your personal plan stays separate from shared expenses.</p><ul className="hm-check-list"><li>Income and expense tracking</li><li>Monthly budgets and spending categories</li><li>Bills, due dates and payment status</li><li>Savings goals and progress</li></ul><a href="/app" className="hm-text-link">Explore the planner <ArrowRight size={16}/></a></article>
        <article className="hm-mode"><span className="hm-mode-number">02 / SHARED</span><h3>Keep track of what you share.</h3><p>Set up a space for a household, couple, trip or group. Record who paid, split expenses between selected people, review balances and log settlements.</p><ul className="hm-check-list"><li>Separate spaces for different groups</li><li>Expense records and equal splits</li><li>Member balances and suggested settlements</li><li>Settlement history and shareable reports</li></ul><a href="/app#shared" className="hm-text-link">Explore shared expenses <ArrowRight size={16}/></a></article>
      </div>
    </div></section>

    <section className="hm-product-section" id="product"><div className="hm-wrap"><div className="hm-product-heading"><div><p className="hm-eyebrow">A look inside Soma</p><h2 className="hm-h2">One place for your money and the costs you share.</h2></div><p>A closer look at the product experience. Figures shown in these visual examples are illustrative.</p></div>
      <div className="hm-screenshot-grid">{productShots.map((shot, i) => <figure className="hm-shot" key={shot.src}><div className="hm-shot-image"><img src={shot.src} alt={shot.alt} loading="lazy" /></div><figcaption><span>0{i + 1}</span><div><h3>{shot.title}</h3><p>{shot.text}</p></div></figcaption></figure>)}</div>
    </div></section>
    <section className="hm-section hm-dark"><div className="hm-wrap"><p className="hm-eyebrow">Designed for everyday decisions</p><h2 className="hm-h2">Less mental arithmetic. More clarity.</h2><p className="hm-sub">A money plan should help you understand where things stand, not make managing money feel like another job.</p><div className="hm-features">
      <div><h3>Know what is going out</h3><p>Keep income, expenses and recurring bills in one organised view.</p></div><div><h3>See the shared picture</h3><p>Understand who covered a cost and what each person’s share comes to.</p></div><div><h3>Keep goals visible</h3><p>Give savings goals and spending priorities a place in your plan.</p></div><div><h3>Take your records with you</h3><p>Create clear reports you can print or save for your own reference.</p></div>
    </div></div></section>


    <section className="hm-section" id="faq"><div className="hm-wrap hm-faq-wrap"><div><p className="hm-eyebrow">Good to know</p><h2 className="hm-h2">A few things people ask.</h2></div><div className="hm-faq">
      <details><summary>Does Soma connect to my bank?</summary><p>No. You enter the income, expenses and bills you want to keep track of. Soma does not connect to bank accounts or import transactions.</p></details>
      <details><summary>Can Soma make payments for me?</summary><p>No. Soma helps you record shared costs, calculate balances and log settlements. Any actual payment happens separately.</p></details>
      <details><summary>Can other people access my shared space?</summary><p>Shared spaces currently help you record expenses for a group and calculate what each person owes. Other people do not yet sign in or access the same space from their own devices.</p></details>
      <details><summary>Can I use different currencies?</summary><p>You can choose a currency for your plan or shared space. Soma does not convert between currencies.</p></details>
      <details><summary>What happens to the information I enter?</summary><p>Your planner and shared-space records stay in the browser you use. They are not attached to a Soma account or synchronised between devices. See the <a href="/privacy">Privacy Policy</a> for details.</p></details>
    </div></div></section>

    <section className="hm-cta"><div className="hm-wrap"><h2>Give your money a clearer place to land.</h2><p>Explore the planner and see how Soma brings personal and shared money together.</p><div className="hm-actions hm-actions-center"><a className="site-cta site-cta-dark" href="/app">Open Soma <ArrowRight size={17}/></a><a className="hm-link hm-link-light" href="/about">About the product</a></div></div></section>
  </>;
}

function Founder() {
  return <section className="about-founder" aria-labelledby="about-founder-title">
    <div className="about-founder-photo"><img src="/Wuraola's%20Image.jpg" alt="Wuraola Eunice Adebisi" /></div>
    <div className="about-founder-copy"><p className="hm-eyebrow">A note from the founder</p><h2 id="about-founder-title">Wuraola Eunice Adebisi</h2><p className="about-founder-role">Founder and Product Developer</p><p>I’m building Soma independently, with a focus on making personal money planning and shared expenses simpler to keep up with.</p><div className="founder-links"><a href="https://www.linkedin.com/in/wuraola-adebisi/" target="_blank" rel="noreferrer"><Linkedin size={17}/> LinkedIn</a><a href="mailto:hello@trackwithsoma.com"><Mail size={17}/> Get in touch</a></div></div>
  </section>;
}
function InfoPage({ page }: { page: Exclude<PublicPage, 'home'> }) {
  const [sent, setSent] = useState(false);
  const info = pages[page];
  return <main className="info-page"><div className="info-page-top"><a href="/">Home</a><span>/</span><span>{info.title}</span></div><div className="info-hero"><h1>{info.title}</h1><p>{info.intro}</p></div>
    {page === 'about' && <div className="about-page-content">
      <section className="about-story"><p className="hm-eyebrow">The idea behind Soma</p><h2>Personal finances and shared expenses belong in the same picture, but they need their own space.</h2><p>Most people are managing more than one kind of money responsibility. There is the money coming in, the everyday spending, bills and savings goals. Then there are the costs shared with a partner, a household, friends or a group. Keeping track of both can quickly become scattered across notes, chats and spreadsheets.</p><p>Soma brings those routines together in one money-planning tool, while keeping personal plans separate from group expenses.</p></section>
      <section className="about-product-grid">
        <article><span>01 / YOUR MONEY</span><h2>Plan for yourself.</h2><p>Record income and spending, organise expenses into categories, set monthly budgets, keep bill dates in view and track progress towards savings goals.</p></article>
        <article><span>02 / SHARED COSTS</span><h2>Keep group expenses clear.</h2><p>Create separate spaces for the people or activities you share costs with. Record who paid, split expenses, review balances, and log settlements as they happen.</p></article>
      </section>
      <section className="about-direction"><h2>Where Soma is today</h2><p>Soma is a working early-stage product, independently built and developed. The current version focuses on the core experience: personal money planning and a shared-expense ledger. The next stage of the product is focused on making shared spaces more collaborative and making it easier to access your information across devices. Those capabilities are being planned; they are not available yet.</p><p>Soma is designed as a digital product for individuals and households. Its commercial model is still being evaluated, and there is no paid plan at present.</p><a className="site-cta" href="/app">Explore Soma <ArrowRight size={16}/></a></section>
      <Founder />
    </div>}
    {page === 'contact' && <div className="info-content contact-layout"><div><h2>Tell us what’s on your mind.</h2><p>Use the form to share product feedback, report an issue or suggest something that would make Soma more useful.</p><div className="contact-detail"><span>✳</span><div><strong>Product feedback</strong><small>Ideas, improvements and the details that matter.</small></div></div><div className="contact-detail"><span>↗</span><div><strong>Help with the planner</strong><small>Tell us what you were trying to do and what happened.</small></div></div><p className="contact-direct">Prefer email? <a href="mailto:hello@trackwithsoma.com">hello@trackwithsoma.com</a></p></div>
      <form className="contact-form" id="feedback" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); const subject = encodeURIComponent(String(f.get('subject') || 'Soma enquiry')); const body = encodeURIComponent('Name: ' + f.get('name') + '\nEmail: ' + f.get('email') + '\n\n' + f.get('message')); window.location.href = 'mailto:hello@trackwithsoma.com?subject=' + subject + '&body=' + body; setSent(true); }}>
        <label>Your name<input name="name" required autoComplete="name" placeholder="What should we call you?" /></label><label>Email address<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label><label>What is this about?<select name="subject"><option>Product feedback</option><option>Something isn’t working</option><option>General question</option><option>Partnership enquiry</option></select></label><label>Your message<textarea name="message" rows={5} required placeholder="Tell us a little more..." /></label><button className="site-cta" type="submit">{sent ? 'Open your email app again' : 'Prepare your message'} <ArrowRight size={16}/></button><small className="form-note">Your email app will open so you can review and send the message.</small>
      </form></div>}
    {page === 'terms' && <div className="info-content legal-copy"><p className="legal-updated">Last updated: 7 November 2026</p><h2>1. What Soma provides</h2><p>Soma provides personal money-planning tools and a shared-expense ledger for households, partners, flatmates and other groups who share costs. It does not connect to bank accounts, initiate payments or verify your financial records.</p><h2>2. Your use of Soma</h2><p>You are responsible for the information you enter and for checking important amounts, balances and payment obligations. Shared spaces help you record group expenses and calculate balances; they do not invite other people to access the same space from their own devices.</p><h2>3. Not financial advice</h2><p>Soma is not a bank, lender, payment processor, accountant or financial adviser. Calculations depend on the information you enter and may not reflect your full financial position. Nothing in the product is individualised financial, tax, legal, investment or debt advice. Check important figures and obligations independently.</p><h2>4. Your information</h2><p>Your personal and shared records are kept in the browser you use. They are not connected to a Soma account or synchronised across devices. Protect access to your device and keep separate copies of important records.</p><h2>5. Availability and acceptable use</h2><p>We may update, suspend or discontinue parts of the service. Do not attempt to disrupt Soma, access systems without permission or use the service unlawfully or in a way that infringes another person’s rights.</p><h2>6. Limitation of liability</h2><p>To the extent permitted by applicable law, Soma is provided on an “as available” basis. We do not guarantee uninterrupted access, error-free calculations or that the planner will prevent missed payments or financial loss. Nothing here excludes liability that cannot legally be excluded.</p><h2>7. Contact and governing law</h2><p>For questions about these terms, email <a href="mailto:hello@trackwithsoma.com">hello@trackwithsoma.com</a>. These terms are subject to applicable law and any mandatory consumer protections that apply where you live.</p></div>}
    {page === 'privacy' && <div className="info-content legal-copy"><p className="legal-updated">Last updated: 7 November 2026</p><h2>1. Information you enter</h2><p>You may enter income amounts, spending records, bill details, savings goals, dates, categories, names and notes. Soma does not connect to bank accounts or retrieve transactions. Do not enter bank credentials, card security codes or passwords.</p><h2>2. How your information is used</h2><p>The information you enter is used to display your plans, organise expenses, split costs and calculate balances. Personal plans and shared-expense records are kept separate.</p><h2>3. Where your records are kept</h2><p>Your planner and shared-space records are kept in the browser you use. They are not uploaded to a Soma account and will not appear on another device. Anyone with access to your unlocked device or browser profile may be able to view them. Clearing browser data may permanently remove these records, so keep separate copies of information that matters.</p><h2>4. Website providers</h2><p>The website may load hosting, font and image resources from third-party providers, including Vercel, Google Fonts and Unsplash where configured. Those providers may process standard technical request information under their own policies.</p><h2>5. Your choices</h2><p>You can edit or remove entries within the planner. You can also create reports for your own records. Exported reports are saved separately and are not synchronised with Soma.</p><h2>6. Security and children</h2><p>No website or storage method can be guaranteed completely secure. Protect access to your device and browser profile. Soma is not designed to solicit personal financial information from children.</p><h2>7. Privacy questions</h2><p>For a privacy question or request, email <a href="mailto:hello@trackwithsoma.com">hello@trackwithsoma.com</a>. This notice will be updated if the way Soma handles information changes.</p></div>}
    {page === 'legal' && <div className="info-content legal-copy"><h2>What Soma is</h2><p>Soma combines personal money-planning tools with a shared-expense ledger for households, partners, flatmates and other groups who share costs. It is not a bank, lender, payment processor, credit-scoring service or investment platform. It does not connect to bank accounts or independently verify your financial information.</p><h2>Accuracy matters</h2><p>Summaries and estimates depend on the records, dates and amounts entered. A displayed balance or spending guide is based on your inputs, not a statement from a financial institution. Confirm actual balances and payment status with the relevant provider.</p><h2>External content</h2><p>The website may use third-party image and font services. Links to external websites are provided for convenience; their content and privacy practices are controlled by their respective operators.</p><h2>Brand and ownership</h2><p>Soma is an independently developed software product created by Wuraola Eunice Adebisi. All rights not expressly granted remain reserved to the applicable rights holder.</p></div>}
  </main>;
}

export default function PublicSite() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const page = (path === '/about' ? 'about' : path === '/contact' ? 'contact' : path === '/terms' ? 'terms' : path === '/privacy' ? 'privacy' : path === '/legal' ? 'legal' : 'home') as PublicPage;
  useEffect(() => {
    const metadata: Record<PublicPage, { title: string; description: string }> = {
      home: { title: 'Soma | Personal money and shared expenses, in one place', description: 'Plan your own spending, keep bills and savings goals in view, and organise the costs you share with other people.' },
      about: { title: 'About Soma | Personal money and shared expenses', description: 'Learn what Soma does, why it exists and how it brings personal money planning and shared-expense tracking together.' },
      contact: { title: 'Contact Soma | Questions and feedback', description: 'Contact Soma with product feedback, questions or help with the money planner.' },
      terms: { title: 'Terms of Service | Soma', description: 'Read the terms for using Soma personal money planning and shared-expense tools.' },
      privacy: { title: 'Privacy Policy | Soma', description: 'Learn what information you enter into Soma and how your planner records are handled.' },
      legal: { title: 'Legal information | Soma', description: 'Important information about Soma and its intended use.' }
    };
    const data = metadata[page];
    const canonical = 'https://www.trackwithsoma.com' + (path === '/' ? '/' : path);
    document.title = data.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', data.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', data.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', data.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', data.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', data.description);
  }, [page, path]);
  return <div className="public-site"><Header />{page === 'home' ? <Home /> : <InfoPage page={page as Exclude<PublicPage, 'home'>} />}<Footer /></div>;
}
