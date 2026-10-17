export const SITE_APPEARANCE_PRESETS = ["evergreen", "shoreline", "cedar-hearth"] as const;
export type SiteAppearancePreset = typeof SITE_APPEARANCE_PRESETS[number];

export interface SiteServiceCard {
  title: string;
  description: string;
}

export interface SiteContent {
  heroLineOne: string;
  heroLineTwoPrefix: string;
  heroLineTwoAccent: string;
  heroIntro: string;
  servicesLineOne: string;
  servicesLineTwo: string;
  servicesIntro: string;
  serviceCards: SiteServiceCard[];
  specialistNote: string;
  aboutHeading: string;
  aboutBody: string;
  footerText: string;
  appearancePreset: SiteAppearancePreset;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  heroLineOne: "Good work,",
  heroLineTwoPrefix: "close to",
  heroLineTwoAccent: "home.",
  heroIntro: "Practical help for repairs, upkeep and small improvements around Toronto Island. Tell me what’s happening, and I’ll make the next step clear.",
  servicesLineOne: "Useful work.",
  servicesLineTwo: "Done properly.",
  servicesIntro: "A straightforward service for the jobs that keep a home working well.",
  serviceCards: [
    { title: "Home repairs", description: "Doors, windows, drywall, painting, caulking, tile, wood flooring, light fixtures, leaky faucets, toilets, switches and fans." },
    { title: "Mounting & assembly", description: "Picture hanging, shelves, TVs, speakers, appliance installation and household furniture assembly or rebuilding." },
    { title: "Outdoor work", description: "Yard work, brush cutting, hedge grooming, raking, power washing, decks, patios, fences, gutters and garden walkways." },
    { title: "Improvements", description: "Carpentry, kitchen cabinets, restoration, eco-friendly upgrades, accessibility modifications, consultation and urgent repairs." },
  ],
  specialistNote: "For electrical, plumbing, heating and other specialist work, I review the scope carefully. Some jobs may require a licensed professional or other authorization.",
  aboutHeading: "No hard sell. Just a clear next step.",
  aboutBody: "Send a few details by email or phone. I’ll review the request, ask what’s missing, and decide whether to open a private customer conversation.",
  footerText: "Independent local service for Toronto Island homes.",
  appearancePreset: "evergreen",
};

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function savedText(value: unknown, fallback: string, maxLength: number, allowBlank = false): string {
  if (typeof value !== "string") return fallback;
  const text = value.trim().slice(0, maxLength);
  return allowBlank || text ? text : fallback;
}

export function normalizeSiteContent(value: unknown): SiteContent {
  const input = record(value);
  const inputCards = Array.isArray(input.serviceCards) ? input.serviceCards : [];
  const preset = SITE_APPEARANCE_PRESETS.includes(input.appearancePreset as SiteAppearancePreset)
    ? input.appearancePreset as SiteAppearancePreset
    : DEFAULT_SITE_CONTENT.appearancePreset;

  return {
    heroLineOne: savedText(input.heroLineOne, DEFAULT_SITE_CONTENT.heroLineOne, 80),
    heroLineTwoPrefix: savedText(input.heroLineTwoPrefix, DEFAULT_SITE_CONTENT.heroLineTwoPrefix, 80),
    heroLineTwoAccent: savedText(input.heroLineTwoAccent, DEFAULT_SITE_CONTENT.heroLineTwoAccent, 48),
    heroIntro: savedText(input.heroIntro, DEFAULT_SITE_CONTENT.heroIntro, 500),
    servicesLineOne: savedText(input.servicesLineOne, DEFAULT_SITE_CONTENT.servicesLineOne, 80),
    servicesLineTwo: savedText(input.servicesLineTwo, DEFAULT_SITE_CONTENT.servicesLineTwo, 80),
    servicesIntro: savedText(input.servicesIntro, DEFAULT_SITE_CONTENT.servicesIntro, 500, true),
    serviceCards: DEFAULT_SITE_CONTENT.serviceCards.map((fallback, index) => {
      const card = record(inputCards[index]);
      return {
        title: savedText(card.title, fallback.title, 96),
        description: savedText(card.description, fallback.description, 420),
      };
    }),
    specialistNote: savedText(input.specialistNote, DEFAULT_SITE_CONTENT.specialistNote, 500, true),
    aboutHeading: savedText(input.aboutHeading, DEFAULT_SITE_CONTENT.aboutHeading, 120),
    aboutBody: savedText(input.aboutBody, DEFAULT_SITE_CONTENT.aboutBody, 1000, true),
    footerText: savedText(input.footerText, DEFAULT_SITE_CONTENT.footerText, 240, true),
    appearancePreset: preset,
  };
}
