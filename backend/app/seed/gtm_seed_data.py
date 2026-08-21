"""GTM Skills Showcase — seed content.

Hand-written demo content, not lorem ipsum, not sourced from any external
or proprietary repository. This module is pure data — `seed.py` upserts it
into the database idempotently by slug.
"""

STAGES = [
    {"slug": "research-icp", "name": "Research & ICP", "position": 1,
     "description": "Define who you're selling to and understand the account before you reach out.",
     "color": "#7b5cff"},
    {"slug": "prospecting", "name": "Prospecting", "position": 2,
     "description": "Build and prioritize the list of accounts and people to pursue.",
     "color": "#5b8cff"},
    {"slug": "outreach-engagement", "name": "Outreach & Engagement", "position": 3,
     "description": "First touches — email, LinkedIn, and everything that earns a reply.",
     "color": "#38bdf8"},
    {"slug": "qualification", "name": "Qualification", "position": 4,
     "description": "Discovery calls, objection handling, and deciding if this is a real deal.",
     "color": "#22c55e"},
    {"slug": "meetings-demos", "name": "Meetings & Demos", "position": 5,
     "description": "Prep and run the meetings that actually move a deal forward.",
     "color": "#f59e0b"},
    {"slug": "negotiation-closing", "name": "Negotiation & Closing", "position": 6,
     "description": "Champion enablement, pricing conversations, and getting to signature.",
     "color": "#ff8a00"},
    {"slug": "post-sale-expansion", "name": "Post-Sale & Expansion", "position": 7,
     "description": "Renewals, health checks, and finding the next deal inside an existing account.",
     "color": "#e5484d"},
    # Fallback stage for imported content with no reliable stage signal —
    # see backend/app/seed/import_gtm_skills_repo.py's stage-mapping table.
    # Deliberately NOT used for any hand-written skill above.
    {"slug": "uncategorized", "name": "Uncategorized", "position": 8,
     "description": "Imported skills that don't have a clear match to one of the stages above yet.",
     "color": "#6b7280"},
]

SKILLS = [
    {
        "slug": "icp-definition-builder", "title": "ICP Definition Builder", "stage": "research-icp",
        "execution_type": "native", "status": "live", "roles": ["Founder", "Marketing", "RevOps"],
        "categories": ["Research"], "icon": "target", "is_featured": True,
        "short_description": "Turn your best customers into a structured, filterable Ideal Customer Profile.",
        "when_to_use": "Use this before any outbound push — when you're not sure who to target, or your current list is too broad and conversion is low.",
        "inputs": [
            {"label": "Top 5–10 closed-won customers", "description": "Company names, or a CRM export"},
            {"label": "Deal size / ACV range", "description": "Rough min–max contract value for those wins"},
        ],
        "workflow_steps": [
            {"title": "Pull firmographic patterns", "description": "List industry, headcount, and revenue band for each closed-won account."},
            {"title": "Identify shared triggers", "description": "Note what was happening at each company right before they bought."},
            {"title": "Draft the ICP statement", "description": "Write a one-paragraph profile: industry + size + trigger + budget authority."},
            {"title": "Score against 3 near-miss accounts", "description": "Test the profile against deals that stalled or lost — refine until it excludes them."},
        ],
        "outputs": [
            {"label": "ICP one-pager", "description": "A single paragraph plus filter criteria for your prospecting tool"},
            {"label": "Disqualifying signals list", "description": "3–5 red flags that predict a bad-fit account"},
        ],
    },
    {
        "slug": "buyer-persona-card-generator", "title": "Buyer Persona Card Generator", "stage": "research-icp",
        "execution_type": "native", "status": "live", "roles": ["Marketing", "AE", "Founder"],
        "categories": ["Research", "Enablement"], "icon": "users", "is_featured": False,
        "short_description": "Build a one-page persona card for each buyer role in your deal — goals, objections, and language.",
        "when_to_use": "Use when a deal involves multiple stakeholders and your messaging is generic across all of them.",
        "inputs": [
            {"label": "Job title / role", "description": "e.g. VP Sales, Head of RevOps"},
            {"label": "2–3 real notes from calls with this role", "description": "Pulled from call notes or transcripts"},
        ],
        "workflow_steps": [
            {"title": "Define the role's success metric", "description": "What number does this person get measured on?"},
            {"title": "List their top 3 objections", "description": "What do they push back on, specific to their role?"},
            {"title": "Capture their vocabulary", "description": "Words and phrases they actually use — mirror this in outreach."},
            {"title": "Write the one-line pitch", "description": "A single sentence framed around their success metric."},
        ],
        "outputs": [
            {"label": "Persona card", "description": "Printable one-pager: goals, objections, vocabulary, pitch line"},
        ],
    },
    {
        "slug": "competitor-battlecard-generator", "title": "Competitor Battlecard Generator", "stage": "research-icp",
        "execution_type": "assisted", "status": "live", "roles": ["AE", "Marketing"],
        "categories": ["Research", "Enablement"], "icon": "shield", "is_featured": False,
        "short_description": "Structure a head-to-head battlecard against a named competitor for live deal use.",
        "when_to_use": "Use when a competitor is named in an active deal and reps need a fast, consistent answer.",
        "inputs": [
            {"label": "Competitor name", "description": "The company being compared"},
            {"label": "Known win/loss notes", "description": "Any past deal outcomes vs this competitor, if available"},
        ],
        "workflow_steps": [
            {"title": "List their top 3 strengths", "description": "What they're genuinely better at — be honest, not dismissive."},
            {"title": "List your top 3 differentiators", "description": "Where you clearly win, with proof points."},
            {"title": "Write objection responses", "description": "For each of their strengths, a one-line reframe."},
            {"title": "Add a landmine question", "description": "A discovery question that surfaces their weakness naturally."},
        ],
        "outputs": [
            {"label": "Battlecard", "description": "Strengths / differentiators / objection-handling table"},
            {"label": "Landmine question bank", "description": "3–5 questions that favor your positioning"},
        ],
    },
    {
        "slug": "target-account-research-brief", "title": "Target Account Research Brief", "stage": "research-icp",
        "execution_type": "native", "status": "live", "roles": ["SDR", "AE"],
        "categories": ["Research"], "icon": "compass", "is_featured": False,
        "short_description": "Compile a one-page research brief on a target account before first outreach.",
        "when_to_use": "Use right before your first touch on a new target account, so outreach references something real.",
        "inputs": [
            {"label": "Company name / domain", "description": "Target account"},
            {"label": "Contact name (optional)", "description": "If you already have a specific buyer in mind"},
        ],
        "workflow_steps": [
            {"title": "Scan recent company news", "description": "Funding, leadership changes, or launches in the last 90 days."},
            {"title": "Check for a relevant trigger", "description": "Something that maps to why they'd need you now."},
            {"title": "Note a personalization hook", "description": "One specific, non-generic detail to reference in outreach."},
            {"title": "Flag ICP fit", "description": "Quick yes/no against your ICP one-pager."},
        ],
        "outputs": [
            {"label": "Research brief", "description": "5-bullet summary: trigger, hook, fit, and one open question"},
        ],
    },
    {
        "slug": "lead-list-prioritizer", "title": "Lead List Prioritizer", "stage": "prospecting",
        "execution_type": "native", "status": "live", "roles": ["SDR", "RevOps"],
        "categories": ["Research"], "icon": "list-checks", "is_featured": True,
        "short_description": "Score and rank a raw list of leads against your ICP so reps work the best accounts first.",
        "when_to_use": "Use right after a list import — event, database pull, or inbound batch — before any outreach starts.",
        "inputs": [
            {"label": "Raw lead list", "description": "CSV or table with company + contact fields"},
            {"label": "ICP criteria", "description": "From your ICP one-pager, or top 3 firmographic filters"},
        ],
        "workflow_steps": [
            {"title": "Apply firmographic filters", "description": "Industry, size, and geography against ICP."},
            {"title": "Score for trigger signals", "description": "Recent funding, hiring, or tech-stack signals, weighted higher."},
            {"title": "Rank into tiers", "description": "Tier 1 (call today), Tier 2 (this week), Tier 3 (nurture)."},
            {"title": "Assign owners", "description": "Split tiers across reps by capacity."},
        ],
        "outputs": [
            {"label": "Tiered lead list", "description": "Same list, ranked with a tier + rationale column"},
        ],
    },
    {
        "slug": "cold-email-sequence-writer", "title": "Cold Email Sequence Writer", "stage": "outreach-engagement",
        "execution_type": "native", "status": "live", "roles": ["SDR", "AE"],
        "categories": ["Email"], "icon": "mail", "is_featured": True,
        "short_description": "Draft a 4-touch cold email sequence tailored to one persona and one trigger.",
        "when_to_use": "Use when starting outreach to a new segment, or after a messaging test underperforms.",
        "inputs": [
            {"label": "Target persona", "description": "From your persona card"},
            {"label": "Trigger or hook", "description": "The reason this outreach is happening now"},
        ],
        "workflow_steps": [
            {"title": "Write the opener", "description": "Hook plus one-line value prop, under 60 words."},
            {"title": "Write the value-add follow-up", "description": "A resource or insight, no ask."},
            {"title": "Write the social-proof touch", "description": "A relevant customer result, kept short."},
            {"title": "Write the break-up email", "description": "Direct, low-pressure close-out with a clear opt-out."},
        ],
        "outputs": [
            {"label": "4-email sequence", "description": "Subject lines and body copy, ready to load into your sender"},
        ],
    },
    {
        "slug": "linkedin-outreach-script-generator", "title": "LinkedIn Outreach Script Generator", "stage": "outreach-engagement",
        "execution_type": "assisted", "status": "live", "roles": ["SDR", "AE"],
        "categories": ["Email"], "icon": "message-circle", "is_featured": False,
        "short_description": "Turn a connection request and two follow-up DMs into a ready LinkedIn sequence.",
        "when_to_use": "Use for warm or semi-warm prospects where email isn't landing or LinkedIn is the primary channel.",
        "inputs": [
            {"label": "Prospect's recent LinkedIn activity", "description": "A post, comment, or job change to reference"},
            {"label": "Connection reason", "description": "Why you're reaching out to this specific person"},
        ],
        "workflow_steps": [
            {"title": "Write the connection note", "description": "Under 300 characters, references something specific."},
            {"title": "Write DM 1 — value, no ask", "description": "Sent after they accept — a relevant insight or question."},
            {"title": "Write DM 2 — soft ask", "description": "A low-friction next step: a question, not a meeting ask."},
        ],
        "outputs": [
            {"label": "LinkedIn sequence", "description": "Connection note plus two DMs, ready to send"},
        ],
    },
    {
        "slug": "discovery-call-question-bank", "title": "Discovery Call Question Bank", "stage": "qualification",
        "execution_type": "method_only", "status": "live", "roles": ["AE", "SDR"],
        "categories": ["Calls"], "icon": "help-circle", "is_featured": True,
        "short_description": "A structured set of discovery questions organized by qualification framework.",
        "when_to_use": "Use to prep for or run a first discovery call, especially with a new AE or a new segment.",
        "inputs": [
            {"label": "Qualification framework", "description": "e.g. MEDDIC, BANT, or your own"},
            {"label": "Deal context", "description": "What you already know about the account"},
        ],
        "workflow_steps": [
            {"title": "Open with situation questions", "description": "Understand current state before pitching anything."},
            {"title": "Probe for pain and impact", "description": "Quantify the cost of the problem, not just its existence."},
            {"title": "Uncover decision process", "description": "Who else is involved, what's the timeline, what's the budget process."},
            {"title": "Confirm next steps live", "description": "Get a specific, mutually agreed next step before the call ends."},
        ],
        "outputs": [
            {"label": "Question bank", "description": "Framework-organized questions to run the call from"},
            {"label": "Qualification scorecard", "description": "Fields to fill in live during the call"},
        ],
    },
    {
        "slug": "objection-handling-playbook", "title": "Objection Handling Playbook", "stage": "qualification",
        "execution_type": "method_only", "status": "live", "roles": ["AE", "SDR", "Founder"],
        "categories": ["Calls", "Enablement"], "icon": "shield-question", "is_featured": False,
        "short_description": "A reusable structure for handling the 5 most common objections without sounding scripted.",
        "when_to_use": "Use to prep new reps, or whenever a new objection starts showing up repeatedly in deals.",
        "inputs": [
            {"label": "Objection text", "description": "The actual words a prospect used, if you have them"},
            {"label": "Deal stage", "description": "Where in the cycle this objection came up"},
        ],
        "workflow_steps": [
            {"title": "Acknowledge without conceding", "description": "A one-line response that validates the concern."},
            {"title": "Reframe with a question", "description": "Turn the objection into a question that surfaces the real concern."},
            {"title": "Answer with proof, not opinion", "description": "A specific example, number, or customer reference."},
            {"title": "Confirm it's resolved", "description": "Ask directly if that addresses the concern before moving on."},
        ],
        "outputs": [
            {"label": "Objection-response map", "description": "Objection → reframe → proof point, for your top 5 objections"},
        ],
    },
    {
        "slug": "meeting-prep-brief-generator", "title": "Meeting Prep Brief Generator", "stage": "meetings-demos",
        "execution_type": "native", "status": "live", "roles": ["AE", "CS"],
        "categories": ["Calls", "Research"], "icon": "calendar", "is_featured": True,
        "short_description": "Compile everything you need to know before a meeting into one brief.",
        "when_to_use": "Use 15 minutes before any external meeting — demo, discovery, or renewal conversation.",
        "inputs": [
            {"label": "Meeting attendees", "description": "Names and roles of who's joining"},
            {"label": "Prior interaction history", "description": "Notes or summary from previous calls or emails"},
        ],
        "workflow_steps": [
            {"title": "Summarize where the deal stands", "description": "Stage, key open questions, last commitment made."},
            {"title": "List each attendee's likely priority", "description": "One line per person on what they probably care about."},
            {"title": "Set the meeting goal", "description": "The single outcome that makes this meeting a win."},
            {"title": "Prep 2 questions to ask", "description": "Questions that move the deal forward, not just informational."},
        ],
        "outputs": [
            {"label": "Meeting brief", "description": "One-page prep doc: context, attendees, goal, questions"},
        ],
    },
    {
        "slug": "demo-script-customizer", "title": "Demo Script Customizer", "stage": "meetings-demos",
        "execution_type": "assisted", "status": "live", "roles": ["AE"],
        "categories": ["Calls", "Enablement"], "icon": "presentation", "is_featured": False,
        "short_description": "Reorder and reframe a standard demo around what this specific buyer said they care about.",
        "when_to_use": "Use after discovery, before every demo — never run the default demo flow unmodified.",
        "inputs": [
            {"label": "Discovery notes", "description": "What the buyer said matters most"},
            {"label": "Standard demo flow", "description": "Your default feature order"},
        ],
        "workflow_steps": [
            {"title": "Identify the buyer's #1 priority", "description": "From discovery notes, the single most important use case."},
            {"title": "Reorder the flow around it", "description": "Lead with what they care about, not your default sequence."},
            {"title": "Cut irrelevant sections", "description": "Remove or shorten features unrelated to their stated priority."},
            {"title": "Plan the close", "description": "What you'll ask for at the end of this specific demo."},
        ],
        "outputs": [
            {"label": "Custom demo flow", "description": "Reordered agenda with talking points per section"},
        ],
    },
    {
        "slug": "champion-enablement-kit", "title": "Champion Enablement Kit", "stage": "negotiation-closing",
        "execution_type": "method_only", "status": "live", "roles": ["AE"],
        "categories": ["Enablement"], "icon": "handshake", "is_featured": True,
        "short_description": "Arm your internal champion with what they need to sell your deal internally, without you in the room.",
        "when_to_use": "Use once you've identified a champion but the deal needs internal buy-in you can't be present for.",
        "inputs": [
            {"label": "Champion's name and role", "description": "Who's advocating internally"},
            {"label": "Internal stakeholders to convince", "description": "Who else needs to sign off"},
        ],
        "workflow_steps": [
            {"title": "Write a one-page internal summary", "description": "The business case in the champion's own likely words."},
            {"title": "Anticipate internal objections", "description": "What will skeptical stakeholders push back on?"},
            {"title": "Provide proof points", "description": "ROI numbers or customer references the champion can cite."},
            {"title": "Give them a clear ask", "description": "Exactly what approval or budget they need to secure."},
        ],
        "outputs": [
            {"label": "Champion kit", "description": "Internal summary, objection answers, and proof points, exportable"},
        ],
    },
    {
        "slug": "pricing-negotiation-guide", "title": "Pricing Negotiation Guide", "stage": "negotiation-closing",
        "execution_type": "method_only", "status": "live", "roles": ["AE", "Founder"],
        "categories": ["Pricing"], "icon": "dollar-sign", "is_featured": False,
        "short_description": "A structured approach to pricing conversations that protects margin without losing the deal.",
        "when_to_use": "Use when a prospect pushes back on price or asks for a discount.",
        "inputs": [
            {"label": "Current proposed price", "description": "What's on the table"},
            {"label": "Stated reason for pushback", "description": "Budget, competitor price, or a perceived value gap"},
        ],
        "workflow_steps": [
            {"title": "Diagnose the real objection", "description": "Budget, value, or a negotiating tactic — each needs a different response."},
            {"title": "Reconnect to value before discussing price", "description": "Restate the quantified impact before any number changes."},
            {"title": "Trade, don't just concede", "description": "If you move on price, get something back — term length, case study, referral."},
            {"title": "Close with a specific offer", "description": "One clear final offer, not an open-ended negotiation."},
        ],
        "outputs": [
            {"label": "Negotiation plan", "description": "Diagnosis, value restatement, trade options, and final offer"},
        ],
    },
    {
        "slug": "deal-risk-signal-checklist", "title": "Deal Risk Signal Checklist", "stage": "negotiation-closing",
        "execution_type": "coming_soon", "status": "planned", "roles": ["AE", "RevOps"],
        "categories": ["Pricing"], "icon": "alert-triangle", "is_featured": False,
        "short_description": "An automated checklist that flags deals going quiet, stuck, or off-track before they're lost.",
        "when_to_use": "Runs continuously against your active pipeline once connected to your CRM.",
        "inputs": [
            {"label": "CRM connection", "description": "Coming soon — will read deal stage, last activity, and close date"},
        ],
        "workflow_steps": [
            {"title": "Coming soon", "description": "This skill is planned but not yet available in this workspace."},
        ],
        "outputs": [
            {"label": "Risk flags", "description": "Coming soon"},
        ],
    },
    {
        "slug": "renewal-health-check", "title": "Renewal Health Check", "stage": "post-sale-expansion",
        "execution_type": "assisted", "status": "live", "roles": ["CS", "AE"],
        "categories": ["Retention"], "icon": "heart-pulse", "is_featured": True,
        "short_description": "A structured pre-renewal review to catch churn risk before the renewal conversation.",
        "when_to_use": "Use 60–90 days before a renewal date, or immediately after usage drops.",
        "inputs": [
            {"label": "Usage data summary", "description": "Login frequency, feature adoption, or support ticket volume"},
            {"label": "Renewal date", "description": "Contract end date"},
        ],
        "workflow_steps": [
            {"title": "Score usage trend", "description": "Is adoption growing, flat, or declining over the last 90 days?"},
            {"title": "Check champion status", "description": "Is your original champion still there and engaged?"},
            {"title": "Identify expansion or risk signal", "description": "Growing usage means expansion; declining means address risk now."},
            {"title": "Plan the renewal conversation", "description": "What to lead with, based on the signal above."},
        ],
        "outputs": [
            {"label": "Renewal health score", "description": "Green / yellow / red with the driving factors"},
            {"label": "Conversation plan", "description": "What to say based on the score"},
        ],
    },
    {
        "slug": "expansion-opportunity-spotter", "title": "Expansion Opportunity Spotter", "stage": "post-sale-expansion",
        "execution_type": "coming_soon", "status": "planned", "roles": ["CS", "AE"],
        "categories": ["Retention"], "icon": "trending-up", "is_featured": False,
        "short_description": "Automatically surface accounts showing usage patterns that predict upsell readiness.",
        "when_to_use": "Runs continuously once connected to your product usage data.",
        "inputs": [
            {"label": "Product usage data connection", "description": "Coming soon — will read feature adoption and seat utilization"},
        ],
        "workflow_steps": [
            {"title": "Coming soon", "description": "This skill is planned but not yet available in this workspace."},
        ],
        "outputs": [
            {"label": "Expansion candidate list", "description": "Coming soon"},
        ],
    },
]

COLLECTIONS = [
    {
        "slug": "founder-led-sales-starter-kit", "name": "Founder-Led Sales Starter Kit",
        "description": "The minimum toolkit for a founder selling deals themselves, before a sales team exists.",
        "is_featured": True, "position": 1,
        "skills": ["icp-definition-builder", "cold-email-sequence-writer", "discovery-call-question-bank", "objection-handling-playbook"],
    },
    {
        "slug": "outbound-prospecting-toolkit", "name": "Outbound Prospecting Toolkit",
        "description": "Everything an SDR needs from a fresh list to a booked meeting.",
        "is_featured": True, "position": 2,
        "skills": ["lead-list-prioritizer", "cold-email-sequence-writer", "linkedin-outreach-script-generator", "meeting-prep-brief-generator"],
    },
    {
        "slug": "deal-acceleration-pack", "name": "Deal Acceleration Pack",
        "description": "For deals in-motion — tailoring the demo, enabling the champion, and closing on price.",
        "is_featured": True, "position": 3,
        "skills": ["demo-script-customizer", "champion-enablement-kit", "pricing-negotiation-guide", "deal-risk-signal-checklist"],
    },
]

# Undirected pairs — seed.py inserts both directions.
SKILL_RELATIONS = [
    ("icp-definition-builder", "buyer-persona-card-generator"),
    ("icp-definition-builder", "lead-list-prioritizer"),
    ("buyer-persona-card-generator", "cold-email-sequence-writer"),
    ("competitor-battlecard-generator", "objection-handling-playbook"),
    ("target-account-research-brief", "cold-email-sequence-writer"),
    ("lead-list-prioritizer", "cold-email-sequence-writer"),
    ("cold-email-sequence-writer", "linkedin-outreach-script-generator"),
    ("discovery-call-question-bank", "objection-handling-playbook"),
    ("discovery-call-question-bank", "meeting-prep-brief-generator"),
    ("meeting-prep-brief-generator", "demo-script-customizer"),
    ("demo-script-customizer", "champion-enablement-kit"),
    ("champion-enablement-kit", "pricing-negotiation-guide"),
    ("pricing-negotiation-guide", "deal-risk-signal-checklist"),
    ("renewal-health-check", "expansion-opportunity-spotter"),
    ("renewal-health-check", "champion-enablement-kit"),
]
