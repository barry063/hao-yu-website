# Public content ownership and P01 coverage

Reviewed: 5 October 2026. Website baseline: `17d4ad20076b340b273f34b5e0f4d5eb90de608a`.
Contract: [public-content.schema.json](../schemas/public-content.schema.json).
Field register: [field-ownership.json](../schemas/field-ownership.json), 199 fields.
Acceptance evidence: [P01–P02 report](releases/2026-10-05-p01-p02.md).

## Ownership and precedence

`content/site.json` version 2 is a reviewed public derivative, never a second
evidence bank. This session reads canonical files but changes none. The five
source fingerprints remain those verified for release 1. The schema describes
public data; it does not claim that a canonical adapter already exists.

1. EB (`Evidence_Bank.md`) owns identity, contact, dates, qualifications,
   responsibility boundaries, experience and factual holds.
2. Verified primary records resolve disagreements; submission and award remain
   separate events. An applicant-confirmed submission is not institutional proof.
3. PUB (`Master_Publication_List.md`) and CONTRIB (`Publication_Contributions.json`)
   own publication metadata and recorded contributions, subject to EB reconciliation.
4. PROFILE provides reviewed formulations, subject to the factual records above.
5. EXPORT provides export provenance only; its internal PDF is excluded.

A discrepancy stops factual propagation for reconciliation outside this repository.
No parser or automatic source-precedence winner is introduced by P01/P02.
P03 will read only declared sources and handle conflicts privately. The source
ID/path allowlist is explicit in `scripts/public-content.mjs`; it excludes referee
and application files. Normal public builds need no canonical workspace access.

## Current records and dependants

IDs are identities, not publication-status buckets. J1/S1/P1 persist when their
status changes. The register gives every data-bearing field an owner, type,
evidence state, visibility, maintenance mode and affected visitor files/sections.
Array indices identify reviewed wording/link components within a stable entity;
inserting or removing components requires refreshing the field register.

| Released record / typed identity | Canonical locator | Public dependants |
| --- | --- | --- |
| PERSON; profile fields, LINKEDIN/SCHOLAR/ORCID/GITHUB/GROUP | EB §§1.1,1.2,2.1 | Hero/contact, JSON-LD, descriptions, CV header; displayed name/role/institution on social card; group link in profile |
| STATUS → THESIS-SUBMITTED, EDU-CAM | EB §2.1; PROFILE §1 | Hero, education, descriptions, CV, social card |
| PROFILE | EB §§1.1,2.1; PROFILE §2 | Hero and CV profile |
| ABOUT | EB §§1.1,2.1,3.1–3.6,4; PROFILE §2 | Profile section |
| THEME-1 | EB §§2.1,3.1–3.2 | Research approach |
| THEME-2 | EB §§2.1,3.1,3.4–3.5 | Research approach |
| THEME-3 | EB §3.3; PUB SW1 | Research approach |
| PROJECT-CSS → J1 | EB §3.1; PUB J1 | Selected research and CV; paper link resolves J1 |
| PROJECT-WS2 → P1 | EB §§2.1,3.2,5.2; PROFILE §3 | Selected research and CV; manuscript status resolves P1 |
| PROJECT-MOS2 → S1 | EB §§3.5,5.2; PUB S1 | Selected research and CV; manuscript status resolves S1 |
| PROJECT-SOFTWARE → SW1 | EB §3.3; PUB SW1 | Selected research and CV; repository resolves SW1 |
| PROJECT-PHOTONICS → J3 | EB §3.6; PUB J3 | Selected research and CV; paper/correction resolve J3 |
| J1 | EB §§3.1,5.1; PUB/CONTRIB J1 | Outputs, CV, selected-research link |
| J2 | EB §§3.4,5.1; PUB/CONTRIB J2 | Outputs and CV |
| J3 | EB §§3.6,5.1; PUB/CONTRIB J3 | Outputs, CV, selected-research paper/correction |
| J4 | EB §5.1; PUB/CONTRIB J4 | Outputs and CV |
| S1 | EB §§3.5,5.2; PUB/CONTRIB S1 | Output group, selected-research status, CV |
| P1 | EB §§3.2,5.2; PUB P1 | Output group/contribution wording, selected-research status, CV |
| SW1 | EB §§3.3,5.3; PUB/CONTRIB SW1 | Software output, CV, selected-research repository |
| EXP-INNO | EB §4.1 | Experience and CV |
| EXP-JUDGE | EB §4.2 | Experience and CV |
| EXP-BOE | EB §4.3 | Experience and CV |
| EDU-OX | EB §2.2 | Education and CV |
| A1 | EB §10 | Honours and CV |
| A2 | EB §§2.2,10 | Honours and CV |
| A3 | EB §10 | Honours and CV |
| release_date / presentation | Website policy and reviewed EB-backed formulations | Update labels, sitemap, canonical/social metadata, robots; presentation assets/links |

The 26 released records remain rendered. Extra typed entities capture previously
hard-coded contact/profile links and the actual thesis event. The normalisation
layer supplies a compatible 26-record view to existing checks and the CV renderer.

## Types, shared fields and authored wording

Profile fields are named strings with a provenance block. Qualification events
have a stable ID, qualification reference, date and a kind restricted to
THESIS_SUBMITTED, VIVA_COMPLETED or DEGREE_AWARDED. Adding a viva or submission
event never promotes the role to Dr or implies an award. No viva/award event exists
in this baseline; changed milestone wording needs renewed evidence and review.

Outputs have typed ARTICLE/SOFTWARE kinds, enumerated statuses, integer/nullable
years, reviewed author/venue/contribution strings, links and public selection.
Published records require complete citation fields; accepting a manuscript does
not invent authors, a DOI or final pagination. Experience has explicit role,
organisation and start/end months, with interval validation. Links, qualifications,
awards and authored narratives carry stable IDs, selection and provenance.

Shared tokens are deliberately small and fail closed: `profile.<field>`,
`profile.role_short`, `event:<id>:sentence`, `qualification:<id>:thesis`, and
`status:<output-id>:lower`. Project URLs reference the output's link index; they
are not independently edited copies. Group/contact URLs live in typed links.
Unknown tokens, missing selected references and duplicate IDs stop the build.

Source VERIFICATION states are distinct from visibility. VERIFIED and
APPLICANT_CONFIRMED map to the same named public state, without promotion.
SUPPORTED, VERIFY and REJECT never become public facts. HOLD/PRIVATE records are
omitted by field projection; an unresolved PUBLIC record is rejected. Public
export objects reject unknown fields at every level. Projection copies explicit
schema fields recursively; it does not spread canonical objects into output.

## Editorial coverage and exclusions

The following is explicitly outside the first deterministic fact coverage:

- The scientific interpretation, questions, contribution paragraphs and summaries
  in PROFILE, ABOUT, THEME-1–3 and PROJECT-* are reviewed authored prose. Tokens
  cover named profile facts, thesis submission and the P1/S1 status sentences;
  arbitrary Markdown edits cannot rewrite this prose automatically.
- Published author and venue formatting, contribution descriptions, abbreviated
  CV author wording, unpublished topic titles, qualification detail and honours
  wording remain reviewed source-backed strings. The generator shares them across
  outputs; P03 still needs explicit canonical extraction/reconciliation rules.
- Template headings, section numbers, navigation labels, calls to action, the
  contact invitation and the profile/research/experience introduction headings
  are presentation prose. They are not claims parsed from the evidence bank.
- Page title/topic phrasing, social-card topic and nonfactual asset choices are
  presentation policy. Group/institution/contact tokens remain mapped facts.
- Styles, photograph, licence/attribution and Google Fonts stylesheet are static
  presentation inputs. Existing web fonts remain externally served; the PDF and
  changed-card builds use hash-pinned, licensed local Vera fonts with no fallback.
- Future interests, presentations without verified details, additional research
  projects, extended service/leadership and methods claims not on the current page
  remain excluded. See `CONTENT_DECISIONS.md` for release-1 claim dispositions.
- Referee data, phone/postcode, internal review PDFs, application archives,
  unpublished quantitative results, provisional authorship and confidential
  commercial details never enter the public dataset or candidate.

No canonical restructuring is proposed or performed. P01/P02 establish reviewed
public rendering, not a completed canonical one-edit workflow. P03–P05 are the
remaining bridge, review-gate and end-to-end proof tasks.
