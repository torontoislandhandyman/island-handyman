import { ArrowLeft, ArrowRight, Check, Hammer, House, Leaf, Menu, MessageCircle, Ruler, Sparkles, X } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { DEFAULT_SITE_CONTENT } from "@shared/siteContent";
import TermsOfService from "@/components/TermsOfService";

const serviceIcons = [House, Ruler, Leaf, Sparkles];

const calendarStatus: Record<string, string> = {
  available: "Available",
  tentative: "Limited",
  booked: "Booked",
  closed: "Closed",
  off_island: "Off the island",
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

type PublicCalendarSlot = {
  slotDate: string;
  startTime: string;
  endTime: string;
  status: string;
  publicNote?: string | null;
};

function PublicCalendar({ calendar }: { calendar: PublicCalendarSlot[] }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const today = dateKey(new Date());
  const days = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = firstDay.getDay();
    return Array.from(
      { length: 42 },
      (_, index) => new Date(month.getFullYear(), month.getMonth(), index - offset + 1),
    );
  }, [month]);
  const byDate = useMemo(() => new Map(calendar.map((slot) => [slot.slotDate, slot])), [calendar]);
  const selectedDate = new Date(`${selected}T12:00:00`);
  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
  const week = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return day;
  });

  return (
    <section className="ih-calendar-section ih-container" aria-labelledby="availability-heading">
      <div className="ih-section-head">
        <div>
          <p className="ih-eyebrow">Public availability</p>
          <h2 id="availability-heading">See which days I’m available to help.</h2>
        </div>
        <p className="ih-section-intro">
          Only opening days are shown here. Client names, home addresses and project details stay private.
        </p>
      </div>

      <div className="ih-calendar-layout">
        <div className="ih-month-card">
          <div className="ih-calendar-heading">
            <button
              type="button"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              aria-label="Show previous month"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <strong>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</strong>
            <button
              type="button"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              aria-label="Show next month"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="ih-calendar-weekdays" aria-hidden="true">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="ih-calendar-grid" role="group" aria-label="Choose a day to see the selected week">
            {days.map((day) => {
              const key = dateKey(day);
              const slot = byDate.get(key);
              const status = slot ? calendarStatus[slot.status] || slot.status : "No opening posted";
              const label = `${day.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}: ${status}`;

              return (
                <button
                  key={key}
                  type="button"
                  className={`ih-calendar-day ${day.getMonth() !== month.getMonth() ? "outside" : ""} ${key === selected ? "selected" : ""} ${key === today ? "today" : ""}`}
                  onClick={() => setSelected(key)}
                  aria-label={label}
                  aria-pressed={key === selected}
                >
                  <b>{day.getDate()}</b>
                  {slot && <span className={`ih-calendar-dot ${slot.status}`} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          <div className="ih-calendar-legend" aria-label="Availability key">
            <span><i className="available" aria-hidden="true" /> Available</span>
            <span><i className="tentative" aria-hidden="true" /> Limited</span>
            <span><i className="booked" aria-hidden="true" /> Booked</span>
            <span><i className="closed" aria-hidden="true" /> Closed or off island</span>
          </div>
        </div>

        <div className="ih-week-card" aria-live="polite">
          <p className="ih-eyebrow">Selected week</p>
          <h3>
            {week[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            {" – "}
            {week[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </h3>
          <div className="ih-week-list">
            {week.map((day) => {
              const slot = byDate.get(dateKey(day));
              const label = slot ? calendarStatus[slot.status] || slot.status : "No opening posted";

              return (
                <div key={dateKey(day)}>
                  <strong>
                    {day.toLocaleDateString(undefined, { weekday: "short" })}
                    <small>{day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small>
                  </strong>
                  <span className={`ih-week-status ${slot?.status || "closed"}`}>{label}</span>
                  <em>
                    {slot
                      ? `${slot.startTime}–${slot.endTime}${slot.publicNote ? ` · ${slot.publicNote}` : ""}`
                      : ""}
                  </em>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: testimonials } = trpc.site.publicTestimonials.useQuery();
  const { data: siteData } = trpc.site.publicSiteData.useQuery();
  const siteContent = siteData?.siteContent ?? DEFAULT_SITE_CONTENT;
  const contactPhone = siteData?.settings.contactPhone?.trim() || "";
  const contactEmail = siteData?.settings.contactEmail?.trim() || "";
  const phoneHref = contactPhone ? `tel:${contactPhone.replace(/[^\d+]/g, "")}` : undefined;

  return (
    <div className="ih-site-shell ih-home-v0" data-site-preset={siteContent.appearancePreset}>
      <a className="ih-skip-link" href="#main-content">Skip to the main content</a>
      <div className="ih-topbar">
        <span>Independent local service</span>
        <span className="ih-topbar-separator" aria-hidden="true">•</span>
        <span>Toronto Island</span>
      </div>

      <header className="ih-nav ih-container">
        <Link href="/" className="ih-brand" aria-label="Island Handyman home">
          <img className="ih-brand-mark" src="/island-handyman-mark.svg" alt="" aria-hidden="true" />
          <span>ISLAND HANDYMAN</span>
        </Link>
        <button
          className="ih-menu-button"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
        <nav id="main-navigation" className={`ih-nav-links ${menuOpen ? "open" : ""}`} aria-label="Main navigation">
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <Link href="/login?next=%2Fcustomer" onClick={() => setMenuOpen(false)}>Client sign-in</Link>
          <Link href="/request" className="ih-nav-cta" onClick={() => setMenuOpen(false)}>Request a job</Link>
        </nav>
      </header>

      <main id="main-content">
        <section className="ih-hero ih-container" aria-labelledby="home-heading">
          <div className="ih-hero-copy">
            <p className="ih-eyebrow">Repairs <span>·</span> Maintenance <span>·</span> Improvements</p>
            <h1 id="home-heading">{siteContent.heroLineOne}<br />{siteContent.heroLineTwoPrefix} <em>{siteContent.heroLineTwoAccent}</em></h1>
            <p className="ih-lede">
              {siteContent.heroIntro}
            </p>
            <div className="ih-actions">
              <Link href="/request" className="ih-button ih-button-primary">
                Request a job <ArrowRight size={19} aria-hidden="true" />
              </Link>
              <Link href="/login?next=%2Fcustomer" className="ih-button ih-button-secondary">
                <MessageCircle size={18} aria-hidden="true" /> Sign in to view your projects
              </Link>
            </div>
            <p className="ih-microcopy"><Check size={18} aria-hidden="true" /> Private client access opens after approval.</p>
          </div>

          <figure className="ih-hero-photo-frame">
            <img
              className="ih-hero-photo"
              src="/toronto-islands-aerial.webp"
              alt="An aerial view of the Toronto Islands, Lake Ontario and the Toronto waterfront."
              width="1800"
              height="1800"
              fetchPriority="high"
            />
            <div className="ih-photo-place-label"><Leaf size={16} aria-hidden="true" /> Toronto Islands, from above</div>
            <figcaption className="ih-photo-credit">
              The Toronto Islands and Toronto waterfront, seen from above.
            </figcaption>
          </figure>
        </section>

        <section className="ih-openings ih-private-strip" aria-label="Private client access">
          <div className="ih-container ih-openings-inner">
            <div>
              <p className="ih-eyebrow">For approved clients</p>
              <h2>Your projects, kept private.</h2>
              <p>Sign in to send me a message and see updates about your work.</p>
            </div>
            <Link href="/login?next=%2Fcustomer" className="ih-strip-link">
              Sign in to view your projects <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="ih-public-status ih-container" aria-labelledby="island-status-heading">
          <div>
            <p className="ih-eyebrow">Island status</p>
            <h2 id="island-status-heading">
              {siteData?.settings.onlineStatus === "offline" ? "Off the island" : "On the island"}
            </h2>
            <p>
              {siteData?.settings.publicMessage || "I update this note manually; the calendar below shows the opening days I’ve posted."}
            </p>
          </div>
          <span className={`ih-status-chip ${siteData?.settings.onlineStatus || "online"}`}>
            {siteData?.settings.onlineStatus === "busy"
              ? "Limited response"
              : siteData?.settings.onlineStatus === "offline"
                ? "Off the island"
                : "On the island"}
          </span>
        </section>

        <PublicCalendar calendar={siteData?.calendar || []} />

        <section className="ih-section ih-container" id="services" aria-labelledby="services-heading">
          <div className="ih-section-head">
            <div>
              <p className="ih-eyebrow">What I can help with</p>
              <h2 id="services-heading">{siteContent.servicesLineOne}<br />{siteContent.servicesLineTwo}</h2>
            </div>
            <p className="ih-section-intro">{siteContent.servicesIntro}</p>
          </div>
          <div className="ih-service-grid">
            {siteContent.serviceCards.map((card, index) => {
              const Icon = serviceIcons[index] ?? House;
              return <article className="ih-service-card" key={`${card.title}-${index}`}>
                <div className="ih-service-icon"><Icon size={22} aria-hidden="true" /></div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>;
            })}
          </div>
          <div className="ih-service-note">
            <Hammer size={21} aria-hidden="true" />
            <p>{siteContent.specialistNote}</p>
          </div>
        </section>

        <section className="ih-section ih-container ih-split" id="how-it-works" aria-labelledby="how-heading">
          <div className="ih-story">
            <p className="ih-eyebrow">A local, practical approach</p>
            <h2 id="how-heading">{siteContent.aboutHeading}</h2>
            <p>{siteContent.aboutBody}</p>
            <Link href="/request" className="ih-text-link">Contact me <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
          <div className="ih-steps">
            <p className="ih-eyebrow">How it works</p>
            {[
              { n: "01", title: "Tell me what needs doing", text: "Use email, phone, or both. Photos can be added later." },
              { n: "02", title: "I review your request", text: "I’ll follow up if something is missing. Private client access opens after approval." },
              { n: "03", title: "Keep updates in one place", text: "Sign in to exchange messages, see project notes and check selected availability." },
            ].map((step) => (
              <div className="ih-step" key={step.n}>
                <span>{step.n}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
              </div>
            ))}
          </div>
        </section>

        {testimonials?.length ? (
          <section className="ih-section ih-container ih-testimonials" aria-labelledby="testimonials-heading">
            <div className="ih-section-head">
              <div>
                <p className="ih-eyebrow">Selected work</p>
                <h2 id="testimonials-heading">Kind words, <em>shared.</em></h2>
              </div>
              <p className="ih-section-intro">Customer stories and before-and-after notes are shared only with permission from the customer and the owner.</p>
            </div>
            <div className="ih-testimonial-grid">
              {testimonials.map((testimonial) => (
                <article className="ih-testimonial-card" key={testimonial.id}>
                  <div className="ih-testimonial-quote" aria-hidden="true">“</div>
                  <p>{testimonial.body}</p>
                  <strong>{testimonial.customerName}</strong>
                  <div className="ih-testimonial-images">
                    {testimonial.beforeImageUrl && <img src={testimonial.beforeImageUrl} alt="Before the work" loading="lazy" />}
                    {testimonial.afterImageUrl && <img src={testimonial.afterImageUrl} alt="After the work" loading="lazy" />}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="ih-footer">
        <div className="ih-container ih-footer-inner">
          <div className="ih-footer-main">
            <Link href="/" className="ih-brand" aria-label="Island Handyman home">
              <img className="ih-brand-mark" src="/island-handyman-mark.svg" alt="" aria-hidden="true" />
              <span>ISLAND HANDYMAN</span>
            </Link>
            <p>{siteContent.footerText}</p>
            <div className="ih-contact-placeholders">
              {contactPhone && <a href={phoneHref}>Call {contactPhone}</a>}
              {contactEmail && <a href={`mailto:${contactEmail}`}>Email {contactEmail}</a>}
              {!contactPhone && !contactEmail && <span>Need to reach me? Use the job request form.</span>}
            </div>
            <p className="ih-privacy-copy">
              Privacy: contact details, messages, photos and project documents are used only to review and manage your work. Public testimonials or photos are shared only with customer and owner permission.
            </p>
          </div>
          <nav className="ih-footer-links" aria-label="Footer navigation">
            <Link href="/request">Contact me</Link>
            <Link href="/login?next=%2Fcustomer">Client sign-in</Link>
            <a href="#services">Services</a>
          </nav>
        </div>
           <footer className="ih-footer">
        <div className="ih-container ih-footer-inner">
          <div className="ih-footer-main">
            <Link href="/" className="ih-brand" aria-label="Island Handyman home">
              <img className="ih-brand-mark" src="/island-handyman-mark.svg" alt="" aria-hidden="true" />
              <span>ISLAND HANDYMAN</span>
            </Link>
            <p>{siteContent.footerText}</p>
            <div className="ih-contact-placeholders">
              {contactPhone && <a href={phoneHref}>Call {contactPhone}</a>}
              {contactEmail && <a href={`mailto:${contactEmail}`}>Email {contactEmail}</a>}
              {!contactPhone && !contactEmail && <span>Need to reach me? Use the job request form.</span>}
            </div>
            <p className="ih-privacy-copy">
              Privacy: contact details, messages, photos and project documents are used only to review and manage your work. Public testimonials or photos are shared only with customer and owner permission.
            </p>
          </div>
          <nav className="ih-footer-links" aria-label="Footer navigation">
            <Link href="/request">Contact me</Link>
            <Link href="/login?next=%2Fcustomer">Client sign-in</Link>
            <a href="#services">Services</a>
          </nav>
        </div>
        <TermsOfService />
      </footer>
    </div>
  );
}
