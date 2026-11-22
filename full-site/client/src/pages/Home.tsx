import { ArrowRight, Check, Hammer, House, Leaf, Mail, MapPin, Menu, Paintbrush, Ruler, Send, Wrench, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { trpc } from "@/lib/trpc";

type ContactForm = {
  customerName: string;
  email: string;
  phone: string;
  location: string;
  service: string;
  description: string;
};

const initialContactForm: ContactForm = {
  customerName: "",
  email: "",
  phone: "",
  location: "",
  service: "Home repair or maintenance",
  description: "",
};

const siteCopy = {
  heroLineOne: "Good work,",
  heroLineTwo: "close to home.",
  introduction: "Practical help with repairs, upkeep and small improvements around Toronto Island. Tell me what needs doing, and I’ll make the next step clear.",
  aboutHeading: "A local hand with the work around your home.",
  aboutBody: "I help Toronto Island neighbours with everyday repairs, maintenance and useful improvements. Send a few details and I’ll get back to you directly.",
  serviceArea: "Toronto Island, Toronto",
  email: "torontoislandhandyman@gmail.com",
  footer: "Independent local service for Toronto Island homes.",
};

const serviceCards = [
  { title: "Repairs & upkeep", description: "Doors, drywall, painting, caulking, flooring, fixtures and small household fixes.", icon: House },
  { title: "Mounting & assembly", description: "Shelves, pictures, TVs, furniture and household fixtures installed or assembled.", icon: Ruler },
  { title: "Outdoor work", description: "Decks, fences, gardens, walkways, gutters and seasonal yard work.", icon: Leaf },
  { title: "Practical improvements", description: "Carpentry, cabinets, restoration and accessibility improvements. Specialist work may need a licensed professional.", icon: Wrench },
];

const serviceOptions = [
  "Home repair or maintenance",
  "Mounting or furniture assembly",
  "Deck, fence or outdoor work",
  "Painting or improvements",
  "Other / not sure",
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<ContactForm>(initialContactForm);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [contactError, setContactError] = useState(false);
  const submit = trpc.site.submitJobRequest.useMutation({
    onSuccess: (result) => {
      setRequestId(result.id);
      setForm(initialContactForm);
      setContactError(false);
    },
  });

  const update = (field: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const hasContact = Boolean(form.email.trim() || form.phone.trim());
    setContactError(!hasContact);
    if (!hasContact) return;

    submit.mutate({
      ...form,
      customerName: form.customerName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      preferredTime: "Any available time",
      urgency: "routine",
    });
  };

  return (
    <div className="ih-site-shell ih-home-v0 ih-static-home" id="top">
      <a className="ih-skip-link" href="#main-content">Skip to the main content</a>
      <div className="ih-topbar">
        <span>Independent local service</span>
        <span className="ih-topbar-separator" aria-hidden="true">•</span>
        <span>Toronto Island</span>
      </div>

      <header className="ih-nav ih-container">
        <a href="#top" className="ih-brand" aria-label="Island Handyman home">
          <img className="ih-brand-mark" src="/island-handyman-mark.svg" alt="" aria-hidden="true" />
          <span>ISLAND HANDYMAN</span>
        </a>
        <button
          className="ih-menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
        <nav id="main-navigation" className={`ih-nav-links ${menuOpen ? "open" : ""}`} aria-label="Main navigation">
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#contact" className="ih-nav-cta" onClick={() => setMenuOpen(false)}>Contact me</a>
        </nav>
      </header>

      <main id="main-content">
        <section className="ih-hero ih-container ih-static-hero" aria-labelledby="home-heading">
          <div className="ih-hero-copy">
            <p className="ih-eyebrow">Repairs <span>·</span> Maintenance <span>·</span> Improvements</p>
            <h1 id="home-heading">{siteCopy.heroLineOne}<br /><em>{siteCopy.heroLineTwo}</em></h1>
            <p className="ih-lede">{siteCopy.introduction}</p>
            <div className="ih-actions">
              <a href="#contact" className="ih-button ih-button-primary">Tell me what needs doing <ArrowRight size={19} aria-hidden="true" /></a>
              <a href="#services" className="ih-button ih-button-secondary">See my services</a>
            </div>
            <p className="ih-microcopy"><Check size={18} aria-hidden="true" /> A straightforward reply, with no obligation.</p>
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
            <figcaption className="ih-photo-credit">Toronto Island and the waterfront, seen from above.</figcaption>
          </figure>
        </section>

        <section className="ih-static-about ih-container" id="about" aria-labelledby="about-heading">
          <div className="ih-static-about-mark" aria-hidden="true"><Hammer size={24} /></div>
          <div>
            <p className="ih-eyebrow">A local, practical approach</p>
            <h2 id="about-heading">{siteCopy.aboutHeading}</h2>
            <p>{siteCopy.aboutBody}</p>
          </div>
          <a className="ih-text-link" href="#contact">Get in touch <ArrowRight size={18} aria-hidden="true" /></a>
        </section>

        <section className="ih-section ih-container ih-static-services" id="services" aria-labelledby="services-heading">
          <div className="ih-section-head">
            <div>
              <p className="ih-eyebrow">How I can help</p>
              <h2 id="services-heading">Useful work.<br />Done properly.</h2>
            </div>
            <p className="ih-section-intro">A short list of common jobs around the home. If you’re not sure where your project fits, just ask.</p>
          </div>
          <div className="ih-static-service-list">
            {serviceCards.map(({ title, description, icon: Icon }) => (
              <article className="ih-static-service" key={title}>
                <span className="ih-static-service-icon"><Icon size={21} aria-hidden="true" /></span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </article>
            ))}
          </div>
          <div className="ih-service-note">
            <Paintbrush size={20} aria-hidden="true" />
            <p>For electrical, plumbing, heating and other specialist work, I’ll review the scope carefully. Some jobs may need a licensed professional or other authorization.</p>
          </div>
        </section>

        <section className="ih-static-contact" id="contact" aria-labelledby="contact-heading">
          <div className="ih-container ih-static-contact-layout">
            <div className="ih-static-contact-copy">
              <p className="ih-eyebrow">Contact</p>
              <h2 id="contact-heading">Let’s talk about the work.</h2>
              <p>Send a few details and I’ll get back to you. Email or phone—whichever is easier for you.</p>
              <div className="ih-static-contact-details">
                <p><MapPin size={19} aria-hidden="true" /><span>{siteCopy.serviceArea}</span></p>
                <p><Mail size={19} aria-hidden="true" /><a href={`mailto:${siteCopy.email}`}>{siteCopy.email}</a></p>
              </div>
              <p className="ih-static-contact-note">Your details are used only to review and reply to your request. Sending a message does not book a job or create an account.</p>
            </div>

            <div className="ih-static-contact-panel">
              {requestId ? (
                <div className="ih-static-contact-success" role="status" aria-live="polite">
                  <span className="ih-static-success-icon"><Check size={24} aria-hidden="true" /></span>
                  <p className="ih-eyebrow">Message received</p>
                  <h3>Thanks — I have the details.</h3>
                  <p>Your reference number is <strong>#{requestId}</strong>. I’ll follow up using the contact information you provided.</p>
                  <button type="button" className="ih-button ih-button-secondary" onClick={() => setRequestId(null)}>Send another message</button>
                </div>
              ) : (
                <form className="ih-static-contact-form" onSubmit={onSubmit}>
                  <label className="ih-static-field">
                    <span>Your name</span>
                    <input autoComplete="name" name="customerName" required value={form.customerName} onChange={(event) => update("customerName", event.target.value)} placeholder="Your name" />
                  </label>
                  <div className="ih-static-contact-methods">
                    <label className="ih-static-field">
                      <span>Email address <small>(or phone below)</small></span>
                      <input autoComplete="email" name="email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" />
                    </label>
                    <label className="ih-static-field">
                      <span>Phone number <small>(or email above)</small></span>
                      <input autoComplete="tel" name="phone" type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Your phone number" />
                    </label>
                  </div>
                  <p className="ih-static-field-hint">Please provide an email address, a phone number, or both.</p>
                  <label className="ih-static-field">
                    <span>Island area or address</span>
                    <input autoComplete="street-address" name="location" required value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="For example, Ward’s Island" />
                  </label>
                  <label className="ih-static-field">
                    <span>What can I help with?</span>
                    <select name="service" value={form.service} onChange={(event) => update("service", event.target.value)}>
                      {serviceOptions.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </label>
                  <label className="ih-static-field">
                    <span>Tell me a little about the work</span>
                    <textarea name="description" required minLength={10} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="What needs doing? A few details will help me get back to you." />
                  </label>
                  {contactError && <p className="ih-static-form-error" role="alert">Please add an email address, a phone number, or both.</p>}
                  {submit.error && <p className="ih-static-form-error" role="alert">I couldn’t send that just now. Please try again, or email me directly.</p>}
                  <button className="ih-button ih-button-primary ih-static-submit" type="submit" disabled={submit.isPending}>
                    {submit.isPending ? "Sending your message…" : <>Send message <Send size={17} aria-hidden="true" /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="ih-footer ih-static-footer">
        <div className="ih-container ih-static-footer-inner">
          <a href="#top" className="ih-brand" aria-label="Back to the top of Island Handyman">
            <img className="ih-brand-mark" src="/island-handyman-mark.svg" alt="" aria-hidden="true" />
            <span>ISLAND HANDYMAN</span>
          </a>
          <p>{siteCopy.footer}</p>
          <a href={`mailto:${siteCopy.email}`}>{siteCopy.email}</a>
        </div>
      </footer>
    </div>
  );
}
