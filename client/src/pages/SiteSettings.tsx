import { ArrowLeft, Check, ExternalLink, Loader2, Palette, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { DEFAULT_SITE_CONTENT, type SiteContent, type SiteAppearancePreset } from "@shared/siteContent";

const presetChoices: Array<{ id: SiteAppearancePreset; name: string; description: string; swatches: string[] }> = [
  { id: "evergreen", name: "Island Evergreen", description: "Forest green and warm cream — the current default.", swatches: ["#14231D", "#1D3026", "#C9DD85", "#F4F0E5"] },
  { id: "shoreline", name: "Shoreline", description: "Deep lake blue-green, pale water and a soft sea-glass accent.", swatches: ["#142329", "#20363A", "#9FD3C5", "#F4F0E5"] },
  { id: "cedar-hearth", name: "Cedar Hearth", description: "Warm cedar-brown, charcoal and a gentle golden accent.", swatches: ["#242018", "#332B20", "#D8BF79", "#F3EEE1"] },
];

function Field({ label, hint, value, maxLength, onChange, multiline = false, required = false }: {
  label: string;
  hint?: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  const common = {
    value,
    maxLength,
    required,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
  };
  return (
    <label className="ih-settings-field">
      <span>{label}</span>
      {hint && <small>{hint}</small>}
      {multiline ? <textarea {...common} rows={4} /> : <input {...common} />}
      <small className="ih-settings-count">{value.length} / {maxLength}</small>
    </label>
  );
}

export default function SiteSettings() {
  const query = trpc.site.adminSiteContent.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const [draft, setDraft] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [saved, setSaved] = useState(false);
  const save = trpc.site.saveSiteContent.useMutation({
    onSuccess: async (content) => {
      setDraft(content);
      setSaved(true);
      await Promise.all([utils.site.adminSiteContent.invalidate(), utils.site.publicSiteData.invalidate()]);
    },
  });

  useEffect(() => {
    if (query.data) {
      setDraft(query.data);
    }
  }, [query.data]);

  if (query.isLoading) return <div className="ih-admin-loading"><Loader2 className="animate-spin" /> Loading website settings…</div>;
  if (query.error) return <div className="ih-admin-denied"><h1>Owner access required</h1><p>Sign in with the owner account to change the public website.</p><Link className="ih-button ih-button-secondary" href="/login?next=%2Fadmin%2Fsettings">Sign in</Link></div>;

  const baseline = query.data ?? DEFAULT_SITE_CONTENT;
  const isDirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const update = <K extends keyof SiteContent>(field: K, value: SiteContent[K]) => {
    setSaved(false);
    setDraft((current) => ({ ...current, [field]: value }));
  };
  const updateService = (index: number, field: "title" | "description", value: string) => {
    setSaved(false);
    setDraft((current) => ({
      ...current,
      serviceCards: current.serviceCards.map((card, cardIndex) => cardIndex === index ? { ...card, [field]: value } : card),
    }));
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);
    save.mutate(draft);
  };

  return (
    <main className="ih-settings-shell ih-container">
      <header className="ih-settings-header">
        <div>
          <p className="ih-eyebrow">Owner-only controls</p>
          <h1>Website settings</h1>
          <p>Change the words visitors see and choose a safe colour style. Your calendar, job requests and customer tools stay as they are.</p>
        </div>
        <nav aria-label="Owner settings navigation">
          <Link className="ih-button ih-button-secondary" href="/admin"><ArrowLeft size={17} /> Owner dashboard</Link>
          <Link className="ih-settings-preview-link" href="/">View website <ExternalLink size={15} /></Link>
        </nav>
      </header>

      <div className="ih-settings-layout">
        <form className="ih-settings-form" onSubmit={submit}>
          <section className="ih-settings-card">
            <div className="ih-settings-card-heading"><div><p className="ih-eyebrow">First impression</p><h2>Homepage introduction</h2></div></div>
            <p className="ih-settings-help">These are the first words people see when they visit the website.</p>
            <Field label="First line" value={draft.heroLineOne} maxLength={80} required onChange={(value) => update("heroLineOne", value)} />
            <div className="ih-settings-two-fields">
              <Field label="Second line" value={draft.heroLineTwoPrefix} maxLength={80} required onChange={(value) => update("heroLineTwoPrefix", value)} />
              <Field label="Highlighted last word" value={draft.heroLineTwoAccent} maxLength={48} required onChange={(value) => update("heroLineTwoAccent", value)} />
            </div>
            <Field label="Welcome message" hint="Keep it short and tell people what you can help with." value={draft.heroIntro} maxLength={500} multiline required onChange={(value) => update("heroIntro", value)} />
          </section>

          <section className="ih-settings-card">
            <div className="ih-settings-card-heading"><div><p className="ih-eyebrow">About the service</p><h2>About text</h2></div></div>
            <Field label="Heading" value={draft.aboutHeading} maxLength={120} required onChange={(value) => update("aboutHeading", value)} />
            <Field label="About me" value={draft.aboutBody} maxLength={1000} multiline onChange={(value) => update("aboutBody", value)} />
          </section>

          <section className="ih-settings-card">
            <div className="ih-settings-card-heading"><div><p className="ih-eyebrow">What you offer</p><h2>Services</h2></div></div>
            <div className="ih-settings-two-fields">
              <Field label="Services heading — line 1" value={draft.servicesLineOne} maxLength={80} required onChange={(value) => update("servicesLineOne", value)} />
              <Field label="Services heading — line 2" value={draft.servicesLineTwo} maxLength={80} required onChange={(value) => update("servicesLineTwo", value)} />
            </div>
            <Field label="Short introduction" value={draft.servicesIntro} maxLength={500} multiline onChange={(value) => update("servicesIntro", value)} />
            {draft.serviceCards.map((card, index) => (
              <fieldset className="ih-settings-service" key={index}>
                <legend>Service {index + 1}</legend>
                <Field label="Service name" value={card.title} maxLength={96} required onChange={(value) => updateService(index, "title", value)} />
                <Field label="Description" value={card.description} maxLength={420} multiline required onChange={(value) => updateService(index, "description", value)} />
              </fieldset>
            ))}
            <Field label="Specialist-work notice" hint="For example, explain when a licensed professional may be needed." value={draft.specialistNote} maxLength={500} multiline onChange={(value) => update("specialistNote", value)} />
          </section>

          <section className="ih-settings-card">
            <div className="ih-settings-card-heading"><div><p className="ih-eyebrow">Closing words</p><h2>Footer</h2></div></div>
            <Field label="Footer sentence" value={draft.footerText} maxLength={240} onChange={(value) => update("footerText", value)} />
            <p className="ih-settings-help">Your public availability message and contact details are already in Owner dashboard → Today.</p>
          </section>

          <section className="ih-settings-card">
            <div className="ih-settings-card-heading"><div><p className="ih-eyebrow">Appearance</p><h2>Choose a colour style</h2></div><Palette size={22} aria-hidden="true" /></div>
            <div className="ih-preset-list" role="radiogroup" aria-label="Website colour style">
              {presetChoices.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  role="radio"
                  aria-checked={draft.appearancePreset === preset.id}
                  className={`ih-preset-choice ${draft.appearancePreset === preset.id ? "selected" : ""}`}
                  onClick={() => update("appearancePreset", preset.id)}
                >
                  <span className="ih-preset-swatches" aria-hidden="true">{preset.swatches.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</span>
                  <span className="ih-preset-copy"><strong>{preset.name}</strong><small>{preset.description}</small></span>
                  {draft.appearancePreset === preset.id && <Check size={19} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </section>

          <div className="ih-settings-savebar">
            <div aria-live="polite">
              {saved ? <p className="ih-settings-saved"><Check size={17} /> Changes saved. Visitors will see them on the website.</p>
                : save.error ? <p className="ih-settings-error">We couldn’t save those changes. Please try again.</p>
                  : <p>{isDirty ? "You have unsaved changes." : "Your website settings are up to date."}</p>}
            </div>
            <button className="ih-button ih-button-primary" type="submit" disabled={save.isPending || !isDirty}>
              {save.isPending ? <><Loader2 size={17} className="animate-spin" /> Saving…</> : <><Save size={17} /> Save changes</>}
            </button>
          </div>
        </form>

        <aside className="ih-settings-preview-column">
          <div className="ih-settings-preview-label"><p className="ih-eyebrow">Preview</p><span>Updates as you edit</span></div>
          <div className="ih-settings-preview ih-site-shell" data-site-preset={draft.appearancePreset}>
            <div className="ih-settings-preview-mark">IH</div>
            <p className="ih-eyebrow">Repairs · Maintenance · Improvements</p>
            <h2>{draft.heroLineOne}<br />{draft.heroLineTwoPrefix} <em>{draft.heroLineTwoAccent}</em></h2>
            <p>{draft.heroIntro}</p>
            <div className="ih-settings-preview-card"><strong>{draft.serviceCards[0]?.title}</strong><span>{draft.serviceCards[0]?.description}</span></div>
            <small>{draft.footerText || "Footer sentence hidden"}</small>
          </div>
          <div className="ih-settings-privacy-note"><Check size={17} /><p>Only the owner account can save website settings. Customer records and private project files are not part of this editor.</p></div>
        </aside>
      </div>
    </main>
  );
}
