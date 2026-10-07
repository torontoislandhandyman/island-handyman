# Island Handyman implementation tracker

## Completed features

- [x] Persistent customer profiles with private notes and contact history
- [x] Multiple projects per customer with reopenable project history
- [x] Private project messages with read/unread state
- [x] Private photo and document uploads with Before/During/After categories
- [x] Authorized attachment opening through short-lived private URLs
- [x] Mobile-first customer workspace
- [x] Owner customer/project dashboard
- [x] Basic operational statistics
- [x] Secure authorization and privacy tests
- [x] Approved-request backfill into persistent customer/project records
- [x] Owner account-email linking for phone-only requests

## Verification

- [x] Generate and review additive database migrations
- [x] Apply migrations
- [x] Run typecheck, 7 Vitest tests, and production build
- [x] Verify public, customer, and owner routes on desktop and mobile screenshots
- [x] Confirm the owner route runtime error was fixed
- [x] Verify authenticated direct-link authorization behavior for owner and unapproved customer sessions through tRPC security tests

## Non-blocking notes

- The production build succeeds with a scaffolded bundle-size warning.
- The public preview is live at the managed WebDev URL; production publishing/custom-domain setup remains a WebDev UI step.

## Notification extension

- [x] Generate and apply notifications migration
- [x] Verify in-app notification list and read state
- [x] Run notification authorization tests and production build
- [x] Confirm the mobile owner header keeps the notification bell visible
- [ ] Configure RESEND_API_KEY, EMAIL_FROM, and OWNER_EMAIL for live email delivery — blocked because the secure secret-entry request was rejected; in-app notifications remain active

## Public calendar and owner-editable site settings

- [x] Add manually controlled public ON THE ISLAND / OFF THE ISLAND status
- [x] Add optional public island message
- [x] Add owner-editable public email and phone fields to remove homepage placeholders
- [x] Add public month calendar with previous/next navigation, today indication, day states, and selected-week details
- [x] Add owner controls for calendar status, hours, notes, and visibility
- [x] Add `/vip` alias while preserving `/customer`
- [x] Darken the palette slightly and add responsive calendar styling
- [x] Add tests for public data exposure and owner-only calendar editing
- [ ] Connect IslandHandyman.VIP through the platform’s custom-domain workflow; no custom-domain tool is available in this session, so DNS remains a user-side step
