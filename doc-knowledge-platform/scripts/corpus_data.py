"""Content and golden questions for the synthetic corpus.

Everything here is fictional. A page is a (heading, body) pair; paragraphs in a body are
separated by a blank line. Golden questions point at a document plus a page (PDFs and scans),
a data row (CSV) or a section (txt/md). `generate_corpus.py` checks that every
`answer_contains` string really appears at the location the question points to.
"""

from typing import TypedDict

Page = tuple[str, str]


class PdfDoc(TypedDict):
    """A multi-page document rendered as a text PDF or an image-only scan."""

    key: str
    title: str
    pages: list[Page]


# --------------------------------------------------------------------------------------
# Text PDFs
# --------------------------------------------------------------------------------------

LEAVE_V1: list[Page] = [
    (
        "1. Annual leave",
        "Full-time employees accrue 20 days of annual leave per year. Leave accrues monthly "
        "and is shown in the HR portal. Part-time employees accrue leave pro rata to their "
        "contracted hours.\n\n"
        "During the first three months of employment, annual leave may only be taken with "
        "written approval from the line manager. Public holidays are separate from annual "
        "leave and are listed in the company holiday calendar.",
    ),
    (
        "2. Sick and carer's leave",
        "Employees receive 10 days of paid sick leave per calendar year. Sick leave can also "
        "be used to care for an immediate family member who is ill.\n\n"
        "A medical certificate is required for any absence of more than 2 consecutive days. "
        "Unused sick leave does not carry over to the next calendar year and is not paid out "
        "on termination.",
    ),
    (
        "3. Parental leave",
        "Primary caregivers receive 12 weeks of paid parental leave. Secondary caregivers "
        "receive 2 weeks of paid parental leave. Both entitlements apply to birth, adoption "
        "and permanent foster placement.\n\n"
        "Employees must notify HR at least 8 weeks before the expected start date. Parental "
        "leave may be taken in one block or split into blocks, and must start within 12 "
        "months of the birth or placement.",
    ),
    (
        "4. Requesting leave and carry-over",
        "Submit leave requests in the HR portal at least 5 working days ahead for leave of up "
        "to 5 days. Longer absences need 4 weeks' notice. Managers respond within 3 working "
        "days.\n\n"
        "Up to 5 unused annual leave days carry over into the next year. Carried-over days "
        "expire on 31 March. Days above the carry-over limit are forfeited, except where the "
        "manager had refused a request in writing.",
    ),
]

# Version 2 only changes the parental-leave page. Used by the M6 freshness test.
LEAVE_V2: list[Page] = [
    (
        page
        if not page[0].startswith("3.")
        else (
            "3. Parental leave",
            "Primary caregivers receive 16 weeks of paid parental leave. Secondary caregivers "
            "receive 4 weeks of paid parental leave. Both entitlements apply to birth, adoption "
            "and permanent foster placement.\n\n"
            "Employees must notify HR at least 6 weeks before the expected start date. Parental "
            "leave may be taken in one block or split into blocks, and must start within 12 "
            "months of the birth or placement.",
        )
    )
    for page in LEAVE_V1
]

TEXT_PDFS: list[PdfDoc] = [
    {"key": "hr/leave-policy.pdf", "title": "Leave Policy", "pages": LEAVE_V1},
    {
        "key": "company-wide/remote-work-policy.pdf",
        "title": "Remote Work Policy",
        "pages": [
            (
                "1. Eligibility",
                "Employees who have completed 6 months of service may work remotely for up to "
                "3 days per week. Teams agree a shared office day so that meetings are not "
                "split between rooms and home.\n\n"
                "Roles that need physical presence, such as the reception and facilities teams, "
                "are not covered by this policy.",
            ),
            (
                "2. Equipment and allowances",
                "Remote employees receive a one-off home office stipend of AUD 600 for a desk, "
                "chair or monitor. Receipts must be submitted through the expense system.\n\n"
                "A monthly internet allowance of AUD 50 is paid with salary. The company laptop "
                "must be used for all work. Personal devices are not permitted to store company "
                "data.",
            ),
            (
                "3. Working from another country",
                "Employees may work from another country for up to 20 working days per calendar "
                "year. Approval is needed from both HR and Legal before travel because of tax, "
                "visa and insurance implications.\n\n"
                "Requests should be lodged at least 4 weeks ahead. Working from a country where "
                "the company has no entity is only approved in exceptional cases.",
            ),
        ],
    },
    {
        "key": "hr/onboarding-guide.pdf",
        "title": "New Starter Onboarding Guide",
        "pages": [
            (
                "1. Your first week",
                "IT issues your laptop and security token on day one. You are assigned a buddy "
                "who meets you daily during the first week and answers practical questions "
                "about teams, tools and the office.\n\n"
                "Your manager schedules a 30-minute welcome chat on day one and agrees your "
                "goals for the first 90 days.",
            ),
            (
                "2. Probation",
                "All new employees serve a probation period of 6 months. A formal review "
                "takes place at the 3-month mark, and a final confirmation decision is made "
                "before the end of month 6.\n\n"
                "During probation, either party may end employment with 1 week of notice. "
                "After confirmation the notice period is 4 weeks.",
            ),
            (
                "3. Mandatory training",
                "New starters must complete security awareness training within 14 days of "
                "joining. The code of conduct acknowledgement is due within 7 days.\n\n"
                "Managers receive a weekly report of incomplete training. Access to production "
                "systems is only granted once both items are complete.",
            ),
        ],
    },
    {
        "key": "hr/performance-review-process.pdf",
        "title": "Performance Review Process",
        "pages": [
            (
                "1. Review cycle",
                "Performance reviews are held twice a year, in June and December. Each review "
                "combines a self-assessment, manager feedback and two peer inputs.\n\n"
                "Ratings use a scale from 1 (does not meet expectations) to 5 (exceptional). "
                "The review conversation must happen within 3 weeks of the cycle opening.",
            ),
            (
                "2. Calibration and outcomes",
                "Ratings are calibrated across teams by the leadership group before they are "
                "shared. Salary changes take effect on 1 September.\n\n"
                "An employee rated 1 or 2 is placed on a performance improvement plan lasting "
                "60 days, with fortnightly check-ins and written objectives.",
            ),
        ],
    },
    {
        "key": "finance/expense-policy.pdf",
        "title": "Expense Policy",
        "pages": [
            (
                "1. Meals and daily limits",
                "The daily meal limit is AUD 75 for domestic travel and AUD 110 for "
                "international travel. The limit covers breakfast, lunch and dinner together.\n\n"
                "Alcohol is not reimbursable under any circumstances. Client entertainment must "
                "be pre-approved and recorded with the names of attendees.",
            ),
            (
                "2. Approvals",
                "Expenses over AUD 500 need approval from a department director. Expenses over "
                "AUD 5,000 need approval from the CFO.\n\n"
                "Managers may not approve their own expenses or those of their direct manager. "
                "Such claims are routed to the next level up.",
            ),
            (
                "3. Submitting claims",
                "Claims must be submitted within 30 days of the expense. Late claims are paid "
                "only with written approval from Finance.\n\n"
                "A receipt is required for every expense over AUD 25. Foreign currency expenses "
                "are converted at the rate on the card statement.",
            ),
        ],
    },
    {
        "key": "finance/procurement-policy.pdf",
        "title": "Procurement Policy",
        "pages": [
            (
                "1. Purchase thresholds",
                "Purchases under AUD 2,000 may be made with a company card. Purchases between "
                "AUD 2,000 and AUD 20,000 need two quotes. Purchases above AUD 20,000 require a "
                "formal tender run by Procurement.\n\n"
                "Splitting a purchase to stay below a threshold is a breach of this policy.",
            ),
            (
                "2. New vendors",
                "A new vendor must pass a security review and a financial check before the "
                "first order. Onboarding a new vendor takes 10 business days on average.\n\n"
                "Procurement keeps the approved vendor register. Only vendors on the register "
                "can be paid.",
            ),
            (
                "3. Purchase orders",
                "A purchase order must be raised before the invoice date. Invoices that arrive "
                "without a purchase order are returned to the vendor.\n\n"
                "Goods receipt is confirmed by the requester within 5 business days of delivery.",
            ),
        ],
    },
    {
        "key": "finance/invoicing-process.pdf",
        "title": "Customer Invoicing Process",
        "pages": [
            (
                "1. Issuing invoices",
                "Invoices are issued on the first business day of each month for the previous "
                "month. Standard payment terms are 30 days from the invoice date.\n\n"
                "Invoices above AUD 100,000 are reviewed by the finance manager before they "
                "are sent.",
            ),
            (
                "2. Overdue accounts",
                "Reminders are sent at 7, 14 and 30 days after the due date. Accounts more than "
                "60 days overdue are placed on credit hold.\n\n"
                "Write-offs above AUD 5,000 need CFO approval.",
            ),
        ],
    },
    {
        "key": "finance/budget-cycle.pdf",
        "title": "Annual Budget Cycle",
        "pages": [
            (
                "1. Calendar",
                "The fiscal year runs from 1 July to 30 June. Budget submissions from "
                "departments are due by 15 March.\n\n"
                "The leadership group reviews submissions in April and the board approves the "
                "final budget in May.",
            ),
            (
                "2. Reforecasting",
                "Departments reforecast every quarter. A variance of more than 10% against the "
                "approved budget must be explained in writing to Finance.\n\n"
                "Unspent project budget does not roll into the next fiscal year unless the "
                "CFO approves a carry-forward.",
            ),
        ],
    },
    {
        "key": "hr/code-of-conduct.pdf",
        "title": "Code of Conduct",
        "pages": [
            (
                "1. Respect at work",
                "We treat colleagues, customers and suppliers with respect. Bullying, "
                "harassment and discrimination are not tolerated and can lead to dismissal.\n\n"
                "Anyone who experiences or sees this behaviour should tell their manager, HR "
                "or the confidential ethics line.",
            ),
            (
                "2. Conflicts of interest and gifts",
                "Declare any outside role or financial interest that could affect your work. "
                "Gifts with a value above AUD 100 must be declared in the gift register and "
                "may need to be returned.\n\n"
                "Never accept cash or cash equivalents from a supplier or customer.",
            ),
        ],
    },
    {
        "key": "legal/data-retention-policy.pdf",
        "title": "Data Retention Policy",
        "pages": [
            (
                "1. Contracts and legal records",
                "Contracts are kept for 7 years after they expire or are terminated. The same "
                "period applies to signed NDAs, board minutes and litigation files.\n\n"
                "Originals are held in the contract repository. Paper copies are scanned and "
                "securely destroyed within 30 days.",
            ),
            (
                "2. People and marketing data",
                "Employee records are kept for 7 years after termination. Marketing consent "
                "records and unsubscribed email lists are kept for 2 years.\n\n"
                "Candidate data for unsuccessful applicants is deleted after 12 months unless "
                "the candidate agrees to stay in the talent pool.",
            ),
            (
                "3. Logs and legal holds",
                "System and access logs are retained for 13 months. Backups are retained for "
                "35 days.\n\n"
                "When the General Counsel issues a legal hold notice, deletion of the affected "
                "records stops immediately until the hold is lifted in writing.",
            ),
        ],
    },
    {
        "key": "legal/nda-template.pdf",
        "title": "Standard Mutual NDA",
        "pages": [
            (
                "1. Confidentiality term",
                "Confidentiality obligations last for 5 years from the date of disclosure. "
                "Trade secrets stay protected for as long as they remain secret.\n\n"
                "Each party may disclose confidential information to employees and advisers "
                "who need it and who are bound by equivalent duties.",
            ),
            (
                "2. Governing law and disputes",
                "This agreement is governed by the law of New South Wales. The courts of that "
                "state have non-exclusive jurisdiction.\n\n"
                "Before starting proceedings, the parties must attempt mediation for 30 days.",
            ),
        ],
    },
    {
        "key": "legal/vendor-contract-guidelines.pdf",
        "title": "Vendor Contract Guidelines",
        "pages": [
            (
                "1. Liability",
                "We accept a liability cap of 12 months of fees paid or payable under the "
                "contract. Higher caps need approval from the General Counsel.\n\n"
                "Liability for breach of confidentiality, data protection and intellectual "
                "property infringement should be uncapped or subject to a super-cap.",
            ),
            (
                "2. Renewal and termination",
                "Automatic renewal should be avoided. Where it cannot be, the maximum renewal "
                "term is 12 months and notice of non-renewal must be possible up to 90 days "
                "before expiry.\n\n"
                "We always require a right to terminate for convenience with 60 days' notice "
                "on contracts above AUD 50,000.",
            ),
        ],
    },
    {
        "key": "sales/sales-playbook.pdf",
        "title": "Sales Playbook",
        "pages": [
            (
                "1. Qualifying leads",
                "Qualify every lead against budget, authority, need and timeline. Inbound leads "
                "must receive a response within 4 business hours.\n\n"
                "Leads that fail qualification go to the nurture programme and are reviewed "
                "after 90 days.",
            ),
            (
                "2. Forecasting",
                "Account executives submit a commit forecast every Monday by 10am. Deals "
                "move to commit only when the customer has confirmed a decision date.\n\n"
                "Managers review changes of more than AUD 50,000 in a single deal in the "
                "Tuesday pipeline call.",
            ),
            (
                "3. Renewals",
                "Start renewal conversations 120 days before the contract expires. The "
                "customer success manager owns the relationship, and the account executive "
                "owns commercial terms.\n\n"
                "Renewals with a price increase above 7% need sales manager approval.",
            ),
        ],
    },
    {
        "key": "sales/discount-approval-policy.pdf",
        "title": "Discount Approval Policy",
        "pages": [
            (
                "1. Approval levels",
                "Sales representatives may offer discounts of up to 10% without approval. "
                "Sales managers can approve discounts of up to 20%.\n\n"
                "All discounts must be recorded in the CRM before a quote is issued.",
            ),
            (
                "2. Large discounts and multi-year deals",
                "Discounts above 20% require approval from the VP Sales and Finance. Multi-year "
                "deals may carry an extra 5% discount at most.\n\n"
                "Discounts are never combined with partner rebates on the same line item.",
            ),
        ],
    },
    {
        "key": "company-wide/security-awareness.pdf",
        "title": "Security Awareness Standard",
        "pages": [
            (
                "1. Passwords and sign-in",
                "Passwords must be at least 14 characters long. Multi-factor authentication is "
                "mandatory for every company system.\n\n"
                "Use the company password manager. Never reuse a work password on a personal "
                "account.",
            ),
            (
                "2. Phishing",
                "Report suspected phishing emails with the Report Phish button in the mail "
                "client. Do not forward them to colleagues.\n\n"
                "The security team runs simulated phishing campaigns each quarter. Results are "
                "used for training and not for discipline.",
            ),
            (
                "3. Devices",
                "Report a lost or stolen laptop or phone within 1 hour of noticing it. Call the "
                "security hotline if the device was unlocked.\n\n"
                "Full-disk encryption is mandatory on all laptops. IT can remotely wipe a lost "
                "device.",
            ),
        ],
    },
    {
        "key": "company-wide/holiday-calendar-2025.pdf",
        "title": "Company Holiday Calendar 2025",
        "pages": [
            (
                "Public holidays and shutdown",
                "The company observes all national public holidays. The end-of-year shutdown "
                "runs from 24 December 2025 to 1 January 2026.\n\n"
                "Foundation Day on Friday 7 November 2025 is an extra company day off. Teams "
                "needing coverage during the shutdown arrange it with their manager.",
            ),
        ],
    },
    {
        "key": "company-wide/it-helpdesk-guide.pdf",
        "title": "IT Helpdesk Guide",
        "pages": [
            (
                "1. Opening hours",
                "The helpdesk is open from 7am to 7pm AEST on weekdays. Outside those hours, "
                "urgent issues can be raised through the security hotline.\n\n"
                "Tickets are answered in the order of priority, then arrival time.",
            ),
            (
                "2. Passwords and hardware",
                "Passwords can be reset in the self-service portal. Faulty hardware is "
                "replaced within 2 business days.\n\n"
                "Loan laptops are available from the helpdesk while a repair is under way.",
            ),
        ],
    },
]

# --------------------------------------------------------------------------------------
# Scanned PDFs (rendered as images, no text layer)
# --------------------------------------------------------------------------------------

SCAN_PDFS: list[PdfDoc] = [
    {
        "key": "finance/expense-form-scan.pdf",
        "title": "Expense Claim Form",
        "pages": [
            (
                "Expense Claim Form",
                "Claim type: Travel\n"
                "Cost centre: CC-4410\n"
                "Approver: Department director\n"
                "Mileage rate: AUD 0.96 per km\n"
                "Attach all receipts. Claims without receipts will be returned.",
            )
        ],
    },
    {
        "key": "finance/receipt-policy-scan.pdf",
        "title": "Receipt Policy",
        "pages": [
            (
                "Receipt Policy",
                "Receipts must be legible and show the supplier name and tax amount.\n"
                "Thermal receipts fade. Photocopy thermal receipts within 14 days.",
            ),
            (
                "Lost Receipts",
                "If a receipt is lost and the amount is over AUD 100, a signed statutory "
                "declaration is required.\n"
                "For amounts of AUD 100 or less, a manager note is enough.",
            ),
        ],
    },
    {
        "key": "hr/offer-letter-template-scan.pdf",
        "title": "Offer Letter Template",
        "pages": [
            (
                "Offer Letter Terms",
                "This offer is valid for 7 days from the date of issue.\n"
                "Probationary period: 6 months.\n"
                "Notice after probation: 4 weeks.\n"
                "Signed by: Head of People",
            )
        ],
    },
    {
        "key": "legal/office-lease-summary-scan.pdf",
        "title": "Office Lease Summary",
        "pages": [
            (
                "Premises",
                "Premises: Level 12, 200 George Street, Sydney.\n"
                "Lease term: 5 years from 1 March 2024.\n"
                "Landlord: Harbour Property Trust.",
            ),
            (
                "Rent and Reviews",
                "Annual rent: AUD 840,000, payable monthly.\n"
                "Rent is reviewed each year at a fixed 3.5% increase.\n"
                "The tenant must make good the premises at the end of the lease.",
            ),
        ],
    },
    {
        "key": "company-wide/fire-safety-notice-scan.pdf",
        "title": "Fire Safety Notice",
        "pages": [
            (
                "Fire Safety Notice",
                "In an alarm, leave by the nearest stairwell. Do not use lifts.\n"
                "Assembly point: Car park B, behind the loading dock.\n"
                "Evacuation drills are held every 6 months.\n"
                "Fire wardens wear orange vests.",
            )
        ],
    },
]

# --------------------------------------------------------------------------------------
# CSV files. The first row of `rows` is the header. "row N" in the golden set means the
# Nth data row after the header, counting from 1.
# --------------------------------------------------------------------------------------

REGION_FACTOR = {"ANZ": 1.00, "APAC": 1.15, "EMEA": 1.25, "AMER": 1.20}
PRICE_BASE = {
    ("Platform", "Standard"): 12000,
    ("Platform", "Enterprise"): 36000,
    ("Premium Support", "Standard"): 6000,
    ("Premium Support", "Enterprise"): 18000,
    ("Analytics Add-on", "Standard"): 4000,
    ("Analytics Add-on", "Enterprise"): 9000,
    ("Training Credits", "Standard"): 2500,
}

PRICING_ROWS: list[list[str]] = [["product", "tier", "region", "annual_price_aud"]] + [
    [product, tier, region, str(round(base * factor))]
    for (product, tier), base in PRICE_BASE.items()
    for region, factor in REGION_FACTOR.items()
]

PARTNER_ROWS: list[list[str]] = [
    ["partner_tier", "min_annual_commit_aud", "discount_pct", "rebate_pct"],
    ["Registered", "0", "5", "0"],
    ["Silver", "100000", "10", "1"],
    ["Gold", "250000", "15", "2"],
    ["Platinum", "500000", "20", "3"],
    ["Strategic", "1000000", "25", "4"],
]

_OWNERS = [
    "Aisha Khan",
    "Ben Okafor",
    "Chloe Martin",
    "Daniel Reyes",
    "Elena Petrova",
    "Farid Haddad",
    "Grace Liu",
    "Hugo Santos",
    "Ines Moreau",
    "Marcus Chen",
    "Jamal Brooks",
    "Nora Berg",
    "Omar Siddiqui",
    "Priya Nair",
    "Quentin Dubois",
    "Rosa Alvarez",
    "Sven Larsen",
    "Tara Mehta",
    "Uma Iyer",
    "Victor Novak",
]
_COST_CENTRE_NAMES = [
    "Platform Engineering",
    "Data Science",
    "Customer Support",
    "Field Sales",
    "Inside Sales",
    "Marketing",
    "Finance Operations",
    "People Operations",
    "Legal",
    "IT Operations",
    "Security",
    "Facilities",
    "Product Design",
    "Partnerships",
    "Customer Success",
    "Procurement",
    "Internal Audit",
    "Executive Office",
    "Research",
    "Training",
]
COST_CENTRE_ROWS: list[list[str]] = [["code", "name", "owner", "annual_budget_aud"]] + [
    [f"CC-{4401 + i}", _COST_CENTRE_NAMES[i], _OWNERS[i], str(250000 + 35000 * i)]
    for i in range(20)
]

OFFICE_ROWS: list[list[str]] = [
    ["city", "address", "phone", "floor"],
    ["Sydney", "200 George Street", "+61 2 5550 0100", "12"],
    ["Melbourne", "88 Collins Street", "+61 3 5550 0200", "7"],
    ["Brisbane", "15 Eagle Street", "+61 7 5550 0300", "4"],
    ["Perth", "30 St Georges Terrace", "+61 8 5550 0400", "9"],
    ["Singapore", "1 Raffles Place", "+65 5550 0500", "21"],
]

CSV_FILES: dict[str, list[list[str]]] = {
    "sales/pricing-2025.csv": PRICING_ROWS,
    "sales/partner-discounts-2025.csv": PARTNER_ROWS,
    "finance/cost-centers.csv": COST_CENTRE_ROWS,
    "company-wide/office-directory.csv": OFFICE_ROWS,
}

# --------------------------------------------------------------------------------------
# Markdown and plain-text files. Sections are (heading, body).
# --------------------------------------------------------------------------------------

TRAVEL_FAQ: list[Page] = [
    (
        "Booking flights",
        "Book flights at least 14 days ahead through the travel portal. Economy class is the "
        "default for flights under 6 hours. Business class needs director approval.",
    ),
    (
        "Hotel limits",
        "The nightly hotel limit is AUD 280 in Sydney and Melbourne and AUD 220 elsewhere. "
        "Book through the travel portal so that the corporate rate applies.",
    ),
    (
        "Travel insurance",
        "All business trips are covered automatically. Add personal travel to the same trip "
        "only after telling HR.",
    ),
]

BENEFITS_FAQ: list[Page] = [
    (
        "Wellbeing allowance",
        "Every employee receives a wellbeing allowance of AUD 400 per year. It covers gym "
        "memberships, fitness classes and mental health apps. Claim it through the expense system.",
    ),
    (
        "Employee assistance program",
        "The employee assistance program offers 6 free confidential counselling sessions per "
        "issue. It is available to family members living in the same household.",
    ),
    (
        "Professional development",
        "Each employee has a learning budget of AUD 1,500 per year, which can be spent on "
        "courses, books and conferences with manager approval.",
    ),
]

ESCALATION: list[Page] = [
    (
        "Severity 1",
        "A Severity 1 issue means a customer's production system is down. Support responds "
        "within 15 minutes and pages the on-call engineer. The account executive is told "
        "within 30 minutes.",
    ),
    (
        "Severity 2",
        "A Severity 2 issue means a major feature is degraded. Support responds within 2 "
        "hours and updates the customer every 4 hours.",
    ),
    (
        "Executive escalation",
        "Escalate to the VP Sales when a customer with more than AUD 500,000 in annual "
        "spend raises a formal complaint.",
    ),
]

PRIVACY_NOTES: list[Page] = [
    (
        "PRIVACY OFFICER",
        "The Privacy Officer sits in the Legal team and is the contact point for access "
        "requests and complaints.",
    ),
    (
        "DATA BREACH NOTIFICATION",
        "Report any suspected data breach to Legal within 24 hours of noticing it. Legal "
        "assesses whether the breach is notifiable and, if so, notifies the regulator "
        "within 30 days of the assessment.",
    ),
    (
        "ACCESS REQUESTS",
        "Individuals may request a copy of their personal data. Respond within 30 days and "
        "record the request in the privacy register.",
    ),
]

MARKDOWN_FILES: dict[str, tuple[str, list[Page]]] = {
    "company-wide/travel-faq.md": ("Travel FAQ", TRAVEL_FAQ),
    "hr/benefits-faq.md": ("Benefits FAQ", BENEFITS_FAQ),
    "sales/customer-escalation.md": ("Customer Escalation Guide", ESCALATION),
}
TEXT_FILES: dict[str, tuple[str, list[Page]]] = {
    "legal/privacy-notes.txt": ("Privacy Notes", PRIVACY_NOTES),
}

# --------------------------------------------------------------------------------------
# Golden questions. kind: "pdf" | "scan" | "csv" | "text". `loc` is a page number
# (pdf/scan), a data row number (csv) or a section heading (text). Negative cases have
# `loc=None` and `forbidden_doc` set: the asker may not see that document.
# --------------------------------------------------------------------------------------

POSITIVE: list[dict] = [
    # Text PDFs (23)
    dict(
        kind="pdf",
        asker="hr",
        q="How many days of annual leave do full-time employees get each year?",
        doc="hr/leave-policy.pdf",
        loc=1,
        contains="20 days of annual leave",
    ),
    dict(
        kind="pdf",
        asker="hr",
        q="How many paid sick days do I get per calendar year?",
        doc="hr/leave-policy.pdf",
        loc=2,
        contains="10 days of paid sick leave",
    ),
    dict(
        kind="pdf",
        asker="hr",
        q="How many weeks of paid parental leave does a primary caregiver get?",
        doc="hr/leave-policy.pdf",
        loc=3,
        contains="12 weeks",
    ),
    dict(
        kind="pdf",
        asker="hr",
        q="How many unused annual leave days can I carry over, and when do they expire?",
        doc="hr/leave-policy.pdf",
        loc=4,
        contains="31 March",
    ),
    dict(
        kind="pdf",
        asker="sales",
        q="What is the one-off home office stipend for remote work?",
        doc="company-wide/remote-work-policy.pdf",
        loc=2,
        contains="AUD 600",
    ),
    dict(
        kind="pdf",
        asker="finance",
        q="How many days a year can I work from another country?",
        doc="company-wide/remote-work-policy.pdf",
        loc=3,
        contains="20 working days",
    ),
    dict(
        kind="pdf",
        asker="hr",
        q="How long is the probation period for new employees?",
        doc="hr/onboarding-guide.pdf",
        loc=2,
        contains="probation period of 6 months",
    ),
    dict(
        kind="pdf",
        asker="hr",
        q="How long does a performance improvement plan last?",
        doc="hr/performance-review-process.pdf",
        loc=2,
        contains="lasting 60 days",
    ),
    dict(
        kind="pdf",
        asker="hr",
        q="How often are performance reviews held?",
        doc="hr/performance-review-process.pdf",
        loc=1,
        contains="twice a year",
    ),
    dict(
        kind="pdf",
        asker="finance",
        q="What is the daily meal limit for domestic travel?",
        doc="finance/expense-policy.pdf",
        loc=1,
        contains="AUD 75 for domestic",
    ),
    dict(
        kind="pdf",
        asker="finance",
        q="Who has to approve an expense over AUD 5,000?",
        doc="finance/expense-policy.pdf",
        loc=2,
        contains="CFO",
    ),
    dict(
        kind="pdf",
        asker="finance",
        q="How many days do I have to submit an expense claim?",
        doc="finance/expense-policy.pdf",
        loc=3,
        contains="within 30 days",
    ),
    dict(
        kind="pdf",
        asker="finance",
        q="How many quotes do I need for a purchase between AUD 2,000 and AUD 20,000?",
        doc="finance/procurement-policy.pdf",
        loc=1,
        contains="two quotes",
    ),
    dict(
        kind="pdf",
        asker="finance",
        q="How long does it take to onboard a new vendor?",
        doc="finance/procurement-policy.pdf",
        loc=2,
        contains="10 business days",
    ),
    dict(
        kind="pdf",
        asker="finance",
        q="When are departmental budget submissions due?",
        doc="finance/budget-cycle.pdf",
        loc=1,
        contains="15 March",
    ),
    dict(
        kind="pdf",
        asker="legal",
        q="How long do we keep contracts after they end?",
        doc="legal/data-retention-policy.pdf",
        loc=1,
        contains="7 years after they expire",
    ),
    dict(
        kind="pdf",
        asker="legal",
        q="Which state's law governs our standard mutual NDA?",
        doc="legal/nda-template.pdf",
        loc=2,
        contains="New South Wales",
    ),
    dict(
        kind="pdf",
        asker="legal",
        q="What liability cap do we accept in vendor contracts?",
        doc="legal/vendor-contract-guidelines.pdf",
        loc=1,
        contains="12 months of fees",
    ),
    dict(
        kind="pdf",
        asker="sales",
        q="How quickly must we respond to an inbound lead?",
        doc="sales/sales-playbook.pdf",
        loc=1,
        contains="4 business hours",
    ),
    dict(
        kind="pdf",
        asker="sales",
        q="By what time on Monday must the commit forecast be submitted?",
        doc="sales/sales-playbook.pdf",
        loc=2,
        contains="10am",
    ),
    dict(
        kind="pdf",
        asker="sales",
        q="What discount can a sales manager approve on their own?",
        doc="sales/discount-approval-policy.pdf",
        loc=1,
        contains="up to 20%",
    ),
    dict(
        kind="pdf",
        asker="legal",
        q="How soon do I have to report a lost laptop?",
        doc="company-wide/security-awareness.pdf",
        loc=3,
        contains="within 1 hour",
    ),
    dict(
        kind="pdf",
        asker="hr",
        q="What is the minimum password length?",
        doc="company-wide/security-awareness.pdf",
        loc=1,
        contains="14 characters",
    ),
    # Scans (5)
    dict(
        kind="scan",
        asker="finance",
        q="What mileage rate is shown on the expense claim form?",
        doc="finance/expense-form-scan.pdf",
        loc=1,
        contains="0.96",
    ),
    dict(
        kind="scan",
        asker="finance",
        q="What do I need if I lose a receipt for more than AUD 100?",
        doc="finance/receipt-policy-scan.pdf",
        loc=2,
        contains="statutory declaration",
    ),
    dict(
        kind="scan",
        asker="hr",
        q="How long is a job offer letter valid for?",
        doc="hr/offer-letter-template-scan.pdf",
        loc=1,
        contains="7 days",
    ),
    dict(
        kind="scan",
        asker="legal",
        q="What is the annual rent for the Sydney office?",
        doc="legal/office-lease-summary-scan.pdf",
        loc=2,
        contains="840,000",
    ),
    dict(
        kind="scan",
        asker="sales",
        q="Where is the fire assembly point?",
        doc="company-wide/fire-safety-notice-scan.pdf",
        loc=1,
        contains="Car park B",
    ),
    # CSV (3)
    dict(
        kind="csv",
        asker="sales",
        q="What is the APAC price for Premium Support at the Enterprise tier?",
        doc="sales/pricing-2025.csv",
        loc=("Premium Support", "Enterprise", "APAC"),
        contains="Premium Support,Enterprise,APAC,20700",
    ),
    dict(
        kind="csv",
        asker="sales",
        q="What discount percentage does a Gold partner get?",
        doc="sales/partner-discounts-2025.csv",
        loc=("Gold",),
        contains="Gold,250000,15,2",
    ),
    dict(
        kind="csv",
        asker="finance",
        q="Who owns cost centre CC-4410?",
        doc="finance/cost-centers.csv",
        loc=("CC-4410",),
        contains="Marcus Chen",
    ),
    # Markdown and text (4)
    dict(
        kind="text",
        asker="sales",
        q="What is the nightly hotel limit in Sydney?",
        doc="company-wide/travel-faq.md",
        loc="Hotel limits",
        contains="AUD 280",
    ),
    dict(
        kind="text",
        asker="hr",
        q="How much is the yearly wellbeing allowance?",
        doc="hr/benefits-faq.md",
        loc="Wellbeing allowance",
        contains="AUD 400",
    ),
    dict(
        kind="text",
        asker="legal",
        q="How quickly must a suspected data breach be reported internally?",
        doc="legal/privacy-notes.txt",
        loc="DATA BREACH NOTIFICATION",
        contains="within 24 hours",
    ),
    dict(
        kind="text",
        asker="sales",
        q="How fast must support respond to a Severity 1 issue?",
        doc="sales/customer-escalation.md",
        loc="Severity 1",
        contains="within 15 minutes",
    ),
]

NEGATIVE: list[dict] = [
    dict(
        kind="pdf",
        asker="hr",
        q="Show me the finance expense limits.",
        forbidden="finance/expense-policy.pdf",
    ),
    dict(
        kind="pdf",
        asker="finance",
        q="What is the data retention period for contracts?",
        forbidden="legal/data-retention-policy.pdf",
    ),
    dict(
        kind="pdf",
        asker="sales",
        q="How many weeks of parental leave does a primary caregiver get?",
        forbidden="hr/leave-policy.pdf",
    ),
    dict(
        kind="scan",
        asker="sales",
        q="What does the office lease cost per year?",
        forbidden="legal/office-lease-summary-scan.pdf",
    ),
    dict(
        kind="csv",
        asker="hr",
        q="What discount does a Gold partner get?",
        forbidden="sales/partner-discounts-2025.csv",
    ),
]

# Freshness check for M6: the same key is first indexed with v1, then overwritten with v2.
FRESHNESS_CHECK = {
    "question": "How many weeks of paid parental leave does a primary caregiver get?",
    "asker_department": "hr",
    "doc": "hr/leave-policy.pdf",
    "page": 3,
    "answer_contains_v1": "12 weeks",
    "answer_contains_v2": "16 weeks",
}

BAD_FILES = ["zero-byte.pdf", "corrupt.pdf", "renamed.exe.pdf", "blank-scan.pdf"]
