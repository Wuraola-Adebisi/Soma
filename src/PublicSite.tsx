import { useState } from 'react';
import { ArrowRight, Menu, Wallet, X, Instagram, Linkedin, Github, Mail } from 'lucide-react';
import './public-home.css';

type PublicPage = 'home' | 'about' | 'contact' | 'terms' | 'privacy' | 'legal';
const pages: Record<Exclude<PublicPage, 'home'>, { title: string; intro: string }> = {
  about: { title: 'Money is personal. Your plan should be too.', intro: 'Soma is being built to make everyday money decisions easier to organise, whether you are planning on your own or keeping track of costs you share with other people.' },
  contact: { title: 'Tell us what would make Soma better.', intro: 'Questions, feedback or a problem with Soma? Send a message. Product feedback is welcome.' },
  terms: { title: 'Terms of Service', intro: 'The terms that apply when you use Soma’s personal and shared money-planning tools.' },
  privacy: { title: 'Privacy Policy', intro: 'A clear explanation of the information you enter into Soma and how it is handled.' },
  legal: { title: 'Legal information', intro: 'Important information about Soma, its scope and how to use it responsibly.' }
};

const productShots = [
  { src: '/Overview.png', alt: 'Soma personal money overview showing a summary of the user’s finances', title: 'A clearer view of your money', text: 'See your money at a glance, with the figures and activity you have recorded.' },
  { src: '/Expenses Dashboard.png', alt: 'Soma expenses dashboard with spending categories and summaries', title: 'Understand your spending', text: 'Review spending patterns and keep everyday expenses organised.' },
  { src: '/Expenses Tracker.png', alt: 'Soma expense tracker showing recorded transactions', title: 'Keep track of the details', text: 'Record income and expenses so your plan reflects what is actually happening.' },
  { src: '/Bills and Calendar.png', alt: 'Soma bills and calendar view showing upcoming due dates', title: 'Keep upcoming bills in view', text: 'Bring bills, due dates and payment status into one place.' },
  { src: '/Salary Plan.png', alt: 'Soma salary planning view', title: 'Give your income a plan', text: 'Plan how your income should be allocated across your priorities.' },
  { src: '/Insights.png', alt: 'Soma money insights and summaries screen', title: 'Review your progress', text: 'Use your recorded information to reflect on your spending and plans.' }
];

function Brand() {
  return <a className="site-brand" href="/" aria-label="Soma home"><span className="site-brand-mark"><Wallet size={20} /></span>soma<span className="brand-dot">.</span></a>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="site-footer-main">
      <div className="footer-brand-col"><Brand /><p>Make sense of your money. Keep shared costs clear.</p><a className="footer-email" href="mailto:hello@trackwithsoma.com"><Mail size={15} /> hello@trackwithsoma.com</a></div>
      <div className="footer-col"><h4>Explore</h4><a href="/#how-it-works">How it works</a><a href="/#product">The product</a><a href="/about">About Soma</a><a href="/app">Open Soma</a></div>
      <div className="footer-col"><h4>Get in touch</h4><a href="/contact">Contact</a><a href="https://www.linkedin.com/in/wuraola-adebisi/" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://github.com/Wuraola-Adebisi" target="_blank" rel="noreferrer">GitHub</a></div>
      <div className="footer-col"><h4>Information</h4><a href="/terms">Terms of Service</a><a href="/privacy">Privacy Policy</a><a href="/legal">Legal information</a></div>
    </div>
    <div className="site-footer-bottom"><span>© {new Date().getFullYear()} Soma. All rights reserved.</span><span>A money-planning tool, not a bank or financial adviser.</span></div>
  </footer>;
}

function Header() {
  const [menu, setMenu] = useState(false);
  return <header className="site-header"><div className="site-header-inner"><Brand />
    <nav className={menu ? 'site-nav is-open' : 'site-nav'} aria-label="Main navigation">
      <a href="/#how-it-works" onClick={() => setMenu(false)}>How it works</a><a href="/#product" onClick={() => setMenu(false)}>The product</a><a href="/about" onClick={() => setMenu(false)}>About</a><a href="/contact" onClick={() => setMenu(false)}>Contact</a><a className="site-login" href="/app">Open Soma <ArrowRight size={15} /></a>
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
      <p className="hm-eyebrow">Personal money. Shared responsibilities.</p>
      <h1>Money is easier to manage when <span>everything has its place.</span></h1>
      <p className="hm-lead">Plan your own spending, keep bills and savings goals in view, and organise the costs you share with other people. Soma brings the moving parts together without mixing your personal money with shared expenses.</p>
      <div className="hm-actions"><a className="site-cta" href="/app">Explore Soma <ArrowRight size={17} /></a><a className="hm-link" href="#product">See the product</a></div>
      <p className="hm-hero-note">A practical money-planning tool for everyday life.</p>
    </div><SplitDemo /></div></section>

    <section className="hm-section" id="how-it-works"><div className="hm-wrap">
      <p className="hm-eyebrow">Two sides of everyday money</p><h2 className="hm-h2">Your money is yours. Shared costs are a separate conversation.</h2>
      <div className="hm-modes">
        <article className="hm-mode"><span className="hm-mode-number">01 / PERSONAL</span><h3>Make a plan for your own money.</h3><p>Record income and everyday spending, set budgets, keep bill due dates visible and work towards savings goals. Your personal plan stays separate from shared expenses.</p><ul className="hm-check-list"><li>Income and expense tracking</li><li>Monthly budgets and spending categories</li><li>Bills, due dates and payment status</li><li>Savings goals and progress</li></ul><a href="/app" className="hm-text-link">Explore the planner <ArrowRight size={16}/></a></article>
        <article className="hm-mode"><span className="hm-mode-number">02 / SHARED</span><h3>Keep track of what you share.</h3><p>Set up a space for a household, couple, trip or group. Record who paid, split expenses between selected people, review balances and log settlements.</p><ul className="hm-check-list"><li>Separate spaces for different groups</li><li>Expense records and equal splits</li><li>Member balances and suggested settlements</li><li>Settlement history and shareable reports</li></ul><a href="/app#shared" className="hm-text-link">Explore shared expenses <ArrowRight size={16}/></a></article>
      </div>
    </div></section>

    <section className="hm-product-section" id="product"><div className="hm-wrap"><div className="hm-product-heading"><div><p className="hm-eyebrow">A look inside Soma</p><h2 className="hm-h2">Built around the details that make up real life.</h2></div><p>Explore the working product: from everyday transactions and monthly plans to bills, income and progress.</p></div>
      <div className="hm-screenshot-grid">{productShots.map((shot, i) => <figure className={'hm-shot hm-shot-' + i} key={shot.src}><div className="hm-shot-image"><img src={shot.src} alt={shot.alt} loading={i < 2 ? 'eager' : 'lazy'} /></div><figcaption><span>0{i + 1}</span><div><h3>{shot.title}</h3><p>{shot.text}</p></div></figcaption></figure>)}</div>
    </div></section>

    <section className="hm-section hm-dark"><div className="hm-wrap"><p className="hm-eyebrow">Designed for everyday decisions</p><h2 className="hm-h2">Less mental arithmetic. More clarity.</h2><p className="hm-sub">A money plan should help you understand where things stand, not make managing money feel like another job.</p><div className="hm-features">
      <div><h3>Know what is going out</h3><p>Keep income, expenses and recurring bills in one organised view.</p></div><div><h3>See the shared picture</h3><p>Understand who covered a cost and what each person’s share comes to.</p></div><div><h3>Keep goals visible</h3><p>Give savings goals and spending priorities a place in your plan.</p></div><div><h3>Take your records with you</h3><p>Create clear reports you can print or save for your own reference.</p></div>
    </div></div></section>

    <section className="hm-section hm-stage"><div className="hm-wrap hm-stage-grid"><div><p className="hm-eyebrow">Where Soma is today</p><h2 className="hm-h2">A working product, built one useful step at a time.</h2></div><div><p>Soma is an early-stage software product currently being built and developed by its founder. The working version brings personal money planning and shared-expense tracking into one place. The focus is on making the core experience useful, clear and dependable before expanding what it can do.</p><p>As Soma grows, the product roadmap includes making it easier for people to manage shared spaces together and access their information across devices.</p><a className="hm-text-link" href="/about">Meet the founder <ArrowRight size={16}/></a></div></div></section>

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
  return <section className="founder-section"><div className="founder-photo-wrap"><img src="/Wuraola's%20Image.jpg" alt="Wuraola Eunice Adebisi, founder and developer of Soma" /></div><div className="founder-copy"><p className="hm-eyebrow">The person building Soma</p><h2>Wuraola Eunice Adebisi</h2><p className="founder-role">Founder &amp; Product Developer</p><p>I’m building Soma to make the everyday work of managing money feel more organised and less fragmented. I lead the product direction and build the experience, from the way the tools work to the details of the interface.</p><p>Soma is currently an independent, founder-built product. I’m developing its core features around the real routines people have with their own money and the costs they share.</p><div className="founder-links"><a href="https://www.linkedin.com/in/wuraola-adebisi/" target="_blank" rel="noreferrer"><Linkedin size={17}/> LinkedIn</a><a href="https://github.com/Wuraola-Adebisi" target="_blank" rel="noreferrer"><Github size={17}/> GitHub</a><a href="mailto:hello@trackwithsoma.com"><Mail size={17}/> Email</a></div></div></section>;
}

function InfoPage({ page }: { page: Exclude<PublicPage, 'home'> }) {
  const [sent, setSent] = useState(false);
  const info = pages[page];
  return <main className="info-page"><div className="info-page-top"><a href="/">Home</a><span>/</span><span>{info.title}</span></div><div className="info-hero"><h1>{info.title}</h1><p>{info.intro}</p></div>
    {page === 'about' && <><div className="info-content about-content"><h2>Why Soma exists</h2><p>Money is rarely managed in just one way. You might have a personal budget to keep on top of, while also sharing rent, groceries, subscriptions or travel costs with other people. Those two sides of life are connected, but they are not the same. Soma gives each one its own space.</p><p>With the personal planner, you can record income and spending, organise bills, set budgets and track savings goals. With shared spaces, you can record group expenses, see each person’s balance, review suggested settlements and keep a history of what has been settled.</p><h2>What Soma is building towards</h2><p>The current product is a working early version focused on the core planning and expense-tracking experience. The longer-term direction is to make shared money management more collaborative, with individual access and a consistent experience across devices. Those capabilities are part of the roadmap, not features currently available.</p><h2>What guides the product</h2><ul><li><strong>Clarity without judgement.</strong> Money information should help people make sense of their situation, not shame them.</li><li><strong>Useful over complicated.</strong> The tools should make everyday decisions easier to organise.</li><li><strong>Personal and shared are different.</strong> Your own financial plan should not disappear into group expenses.</li><li><strong>Build with care.</strong> New capabilities should solve real problems and be clear about what they do.</li></ul><a className="site-cta" href="/app">Explore Soma <ArrowRight size={16}/></a></div><Founder /></>}
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
  return <div className="public-site"><Header />{page === 'home' ? <Home /> : <InfoPage page={page as Exclude<PublicPage, 'home'>} />}<Footer /></div>;
}
