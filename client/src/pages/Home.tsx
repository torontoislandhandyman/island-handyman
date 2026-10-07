import { ArrowLeft, ArrowRight, Check, Hammer, House, Leaf, Menu, MessageCircle, Ruler, Sparkles, X } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

const serviceCards = [
  { icon: House, title: "Home repairs", text: "Doors, windows, drywall, painting, caulking, tile, wood flooring, light fixtures, leaky faucets, toilets, switches and fans." },
  { icon: Ruler, title: "Mounting & assembly", text: "Picture hanging, shelves, TVs, speakers, appliance installation and household furniture assembly or rebuilding." },
  { icon: Leaf, title: "Outdoor work", text: "Yard work, brush cutting, hedge grooming, raking, power washing, decks, patios, fences, gutters and garden walkways." },
  { icon: Sparkles, title: "Improvements", text: "Carpentry, kitchen cabinets, restoration, eco-friendly upgrades, accessibility modifications, consultation and urgent repairs." },
];

const calendarStatus: Record<string, string> = { available: "Available", tentative: "Limited", booked: "Booked", closed: "Closed", off_island: "Off the island" };
function dateKey(date: Date) { return date.toISOString().slice(0, 10); }

function PublicCalendar({ calendar }: { calendar: Array<{ slotDate: string; startTime: string; endTime: string; status: string; publicNote?: string | null }> }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const days = useMemo(() => { const start = new Date(month.getFullYear(), month.getMonth(), 1); const offset = start.getDay(); return Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - offset + 1)); }, [month]);
  const byDate = useMemo(() => new Map(calendar.map((slot) => [slot.slotDate, slot])), [calendar]);
  const selectedDate = new Date(`${selected}T12:00:00`); const weekStart = new Date(selectedDate); weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
  const week = Array.from({ length: 7 }, (_, index) => { const day = new Date(weekStart); day.setDate(weekStart.getDate() + index); return day; });
  return <section className="ih-calendar-section ih-container"><div className="ih-section-head"><div><p className="ih-eyebrow">Public availability</p><h2>A quick look ahead.</h2></div><p className="ih-section-intro">Only public day-level availability is shown. Customer names, addresses and project details stay private.</p></div><div className="ih-calendar-layout"><div className="ih-month-card"><div className="ih-calendar-heading"><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ArrowLeft size={16} /></button><strong>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</strong><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ArrowRight size={16} /></button></div><div className="ih-calendar-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div><div className="ih-calendar-grid">{days.map((day) => { const key = dateKey(day); const slot = byDate.get(key); return <button key={key} className={`ih-calendar-day ${day.getMonth() !== month.getMonth() ? "outside" : ""} ${key === selected ? "selected" : ""} ${key === dateKey(new Date()) ? "today" : ""}`} onClick={() => setSelected(key)}><b>{day.getDate()}</b>{slot && <span className={`ih-calendar-dot ${slot.status}`} />}</button>; })}</div><div className="ih-calendar-legend"><span><i className="available" /> Available</span><span><i className="tentative" /> Limited</span><span><i className="booked" /> Booked</span><span><i className="closed" /> Closed/off island</span></div></div><div className="ih-week-card"><p className="ih-eyebrow">Selected week</p><h3>{week[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {week[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}</h3><div className="ih-week-list">{week.map((day) => { const slot = byDate.get(dateKey(day)); return <div key={dateKey(day)}><strong>{day.toLocaleDateString(undefined, { weekday: "short" })}<small>{day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small></strong><span className={`ih-week-status ${slot?.status || "closed"}`}>{slot ? calendarStatus[slot.status] || slot.status : "No opening listed"}</span><em>{slot ? `${slot.startTime}–${slot.endTime}${slot.publicNote ? ` · ${slot.publicNote}` : ""}` : ""}</em></div>; })}</div></div></div></section>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: testimonials } = trpc.site.publicTestimonials.useQuery();
  const { data: siteData } = trpc.site.publicSiteData.useQuery();
  const businessContact = { phone: siteData?.settings.contactPhone || "Phone coming soon", email: siteData?.settings.contactEmail || "Email coming soon" };
  return (
    <div className="ih-site-shell">
      <div className="ih-topbar">Independent local service <span>•</span> Toronto Island</div>
      <header className="ih-nav ih-container">
        <Link href="/" className="ih-brand"><span className="ih-mark">IH</span><span>ISLAND HANDYMAN</span></Link>
        <button className="ih-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <nav className={`ih-nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <Link href="/customer" onClick={() => setMenuOpen(false)}>VIP client login</Link>
          <Link href="/request" className="ih-nav-cta" onClick={() => setMenuOpen(false)}>Request a job</Link>
        </nav>
      </header>

      <main>
        <section className="ih-hero ih-container">
          <div className="ih-hero-copy"><p className="ih-eyebrow">Repairs <span>•</span> Maintenance <span>•</span> Improvements</p><h1>Good work, close to <em>home.</em></h1><p className="ih-lede">Practical help for repairs, upkeep and small improvements around Toronto Island homes.</p><div className="ih-actions"><Link href="/request" className="ih-button ih-button-primary">Request a job <ArrowRight size={17} /></Link><Link href="/customer" className="ih-button ih-button-secondary"><MessageCircle size={16} /> VIP client login</Link></div><p className="ih-microcopy"><Check size={15} /> Send a request first. Private updates open after approval.</p></div>
          <div className="ih-hero-art"><div className="ih-sun" /><div className="ih-hill ih-hill-one" /><div className="ih-hill ih-hill-two" /><div className="ih-cabin"><div className="ih-window" /><div className="ih-door" /></div><div className="ih-art-label">TORONTO ISLAND <span>•</span> ONTARIO</div><div className="ih-private-badge"><MessageCircle size={15} /><span>Private customer updates<br /><b>Available after approval</b></span></div></div>
        </section>

        <section className="ih-openings ih-private-strip"><div className="ih-container ih-openings-inner"><div><h2>Private VIP client access</h2><p>Approved clients can see selected availability and receive project updates here.</p></div><Link href="/customer" className="ih-strip-link">VIP client login <ArrowRight size={16} /></Link></div></section>

        <section className="ih-public-status ih-container"><div><p className="ih-eyebrow">Island status</p><h2>{siteData?.settings.onlineStatus === "offline" ? "OFF THE ISLAND" : "ON THE ISLAND"}</h2><p>{siteData?.settings.publicMessage || "Status is updated manually from the owner dashboard."}</p></div><span className={`ih-status-chip ${siteData?.settings.onlineStatus || "online"}`}>{siteData?.settings.onlineStatus === "busy" ? "Limited response" : siteData?.settings.onlineStatus === "offline" ? "Off the island" : "On the island"}</span></section>
        <PublicCalendar calendar={siteData?.calendar || []} />

        <section className="ih-section ih-container" id="services"><div className="ih-section-head"><div><p className="ih-eyebrow">What I can help with</p><h2>Useful work.<br />Done properly.</h2></div><p className="ih-section-intro">A straightforward service for the jobs that keep a home working well.</p></div><div className="ih-service-grid">{serviceCards.map(({ icon: Icon, title, text }) => <article className="ih-service-card" key={title}><div className="ih-service-icon"><Icon size={20} /></div><h3>{title}</h3><p>{text}</p></article>)}</div><div className="ih-service-note"><Hammer size={20} /><p>For electrical, plumbing, heating and other specialist work, the scope is reviewed carefully. Some jobs may require a licensed professional or other authorization.</p></div></section>

        <section className="ih-section ih-container ih-split" id="how-it-works"><div className="ih-story"><p className="ih-eyebrow">A local, practical approach</p><h2>No hard sell. Just a clear next step.</h2><p>Send a few details by email or phone. I’ll review the request, ask what’s missing, and decide whether to open a private customer conversation.</p><Link href="/request" className="ih-text-link">Start a request <ArrowRight size={16} /></Link></div><div className="ih-steps"><p className="ih-eyebrow">How it works</p>{[{n:"01",title:"Send a request",text:"Use email, phone, or both. Photos can be added later."},{n:"02",title:"I review and approve",text:"If we’re moving forward, I approve private customer access."},{n:"03",title:"Keep updates in one place",text:"Sign in to exchange messages, project notes and selected availability."}].map((step) => <div className="ih-step" key={step.n}><span>{step.n}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></div>)}</div></section>

        {testimonials?.length ? <section className="ih-section ih-container ih-testimonials"><div className="ih-section-head"><div><p className="ih-eyebrow">Selected work</p><h2>Kind words, <em>shared.</em></h2></div><p className="ih-section-intro">Customer stories and before-and-after notes are shared only with permission from the customer and the owner.</p></div><div className="ih-testimonial-grid">{testimonials.map((testimonial) => <article className="ih-testimonial-card" key={testimonial.id}><div className="ih-testimonial-quote">“</div><p>{testimonial.body}</p><strong>{testimonial.customerName}</strong><div className="ih-testimonial-images">{testimonial.beforeImageUrl && <img src={testimonial.beforeImageUrl} alt="Before the work" />}{testimonial.afterImageUrl && <img src={testimonial.afterImageUrl} alt="After the work" />}</div></article>)}</div></section> : null}
      </main>

      <footer className="ih-footer"><div className="ih-container ih-footer-inner"><div><span className="ih-brand"><span className="ih-mark">IH</span><span>ISLAND HANDYMAN</span></span><p>Independent local service for Toronto Island homes.</p><div className="ih-contact-placeholders"><span>Phone: {businessContact.phone}</span><span>Email: {businessContact.email}</span></div><p className="ih-privacy-copy">Privacy: contact details, messages, photos and project documents are used only to review and manage your work. Public testimonials or photos are shared only with customer and owner permission.</p></div><div className="ih-footer-links"><Link href="/request">Request a job</Link><Link href="/customer">Customer login</Link><a href="#services">Services</a></div></div></footer>
    </div>
  );
}
