# Volt: Business Launch Plan

A business-launch plan, not a feature list. The code matters, but the startup lives or dies on gym partnerships, liability boundaries, access-provider relationships, pricing, onboarding, support, and proving that owners will actually switch or add another system to their stack.

## Phase 1: Define exactly what Volt is

Do not launch as "another fitness app with door access." That is mushy positioning.

Position it as:

> A gym operating and member-access platform that connects to the gym's existing access-control system.

The early value proposition to a gym owner should be simple:

- members manage access in one app
- membership status controls door access
- owners see who entered and when
- cancellations can revoke access automatically
- day passes and temporary access can be issued digitally
- the gym keeps its existing Kisi, Brivo, SALTO, Alta, or similar hardware

That last point matters. You are not asking them to rip out working doors because some startup founder had a vision at 2 AM.

## Phase 2: Pick one customer type first

Do not target Planet Fitness, Equinox, YMCA, boutique yoga studios, martial arts schools, and climbing gyms simultaneously.

Start with independent 24/7 gyms with 1–5 locations.

They are the best first customers because they usually care about:

- after-hours access
- staffing costs
- membership fraud
- cancellations
- remote member onboarding
- day passes
- simple access logs

They are also more likely to try a new product than a giant chain with a procurement department large enough to have its own weather system.

## Phase 3: Conduct customer discovery before selling

Talk to around 20–30 gym owners/operators.

You are not pitching yet. You are learning.

Find out:

- what gym-management system they use
- what door-access provider they use
- how members currently gain entry
- how access is revoked after cancellation
- what happens when payments fail
- whether staff manually manage access accounts
- how often members have access problems
- how they sell guest/day passes
- whether they want a custom member app
- how much they currently pay for management software
- what frustrates them most

Document every answer.

After 20 conversations, patterns will become obvious.

The access providers you see most frequently should determine your first integrations.

## Phase 4: Validate willingness to pay

Do not ask: "Would you use this?"

People will politely say yes to things they would never pay a penny for.

Ask: "If this worked with your current door system and membership software, would $199 per month per location make sense?"

Then test different levels. Initially test:

| Plan    | Example price         |
| ------- | --------------------- |
| Starter | $99/location/month    |
| Growth  | $199/location/month   |
| Pro     | $299/location/month   |

You are trying to learn where resistance starts.

For early pilots, you might offer: first 3 months free or deeply discounted in exchange for feedback and permission to use the gym as a case study.

Do not promise free forever.

## Phase 5: Get one design partner

Your first target isn't 100 gyms. It is one good gym owner who actually cares about the problem.

Ideally:

- independent
- 24/7
- already has supported access hardware
- owner directly involved
- willing to test new technology
- 500–2,000 members
- one or two locations

Call them a design partner, not merely a customer.

Work with them to validate:

- onboarding
- membership syncing
- access
- staff dashboard
- cancellations
- failed payments
- guest access
- troubleshooting

That gym becomes your laboratory.

## Phase 6: Establish access-provider relationships

For each platform you want to support, investigate:

- API availability
- partner programs
- commercial integration agreements
- API limits
- certification requirements
- sandbox/test environments
- OAuth support
- reseller restrictions
- branding requirements

The first four candidates should probably be:

- Kisi
- Brivo
- SALTO
- Avigilon Alta

Eventually HID/Mercury becomes important too, but commercial systems built around Mercury can involve integrators and layered vendor ecosystems.

Do not assume a public API automatically means "build whatever you want and sell it commercially." Read their partner agreements.

## Phase 7: Form the company properly

Before real gyms are depending on you, create the business infrastructure.

At minimum:

- LLC or corporation
- EIN
- business bank account
- bookkeeping
- accounting software
- business credit/debit card
- basic operating agreement
- registered domain
- business email

Keep personal money and company money separate from day one. Future-you will be grateful when taxes arrive instead of discovering that six months of Stripe deposits have been living beside grocery transactions.

## Phase 8: Get legal contracts right

You need several documents. At minimum:

- Terms of Service
- Privacy Policy
- Gym Customer Agreement
- Data Processing Agreement
- Acceptable Use Policy
- Security Addendum
- Service Level Agreement eventually

The gym agreement needs to clearly state that the gym owns and maintains the physical access-control system. Volt should not be responsible for:

- door installation
- fire-code compliance
- emergency egress
- lock maintenance
- electrical systems
- physical security hardware failure

Volt is providing software orchestration and integration. That line needs to be painfully explicit.

## Phase 9: Insurance

Before real customers rely on the system, get quotes for:

- Technology Errors & Omissions
- Cyber Liability
- General Liability

Tell the insurer clearly that the software integrates with physical building-access systems. Do not describe yourself merely as a "fitness software company" because an insurer will be delighted to discover the missing detail after a claim.

## Phase 10: Develop a security program

You do not need SOC 2 on day one. You do need to behave like a company that might eventually get SOC 2.

Create basic policies for:

- access control
- employee/admin permissions
- incident response
- password and MFA requirements
- vendor management
- backups
- encryption
- log retention
- vulnerability reporting
- data deletion
- production access
- secrets management

Set up:

- MFA everywhere
- password manager
- GitHub branch protection
- production logging
- encrypted secrets
- backups
- monitoring
- vulnerability scanning

When selling B2B software, somebody eventually asks: "Can you send us your security documentation?" You want an answer better than "the code looked secure when I checked Tuesday."

## Phase 11: Decide your business model

Keep it simple. Charge the gym, not the member. Something like:

> Volt — $199/location/month
>
> Includes: member app, gym access integration, member management, access history, guest passes, basic analytics.

Then upsell:

- +$99/month advanced analytics
- +$49/month additional admin users/features
- Transaction fee on day passes / marketplace purchases

Avoid nickel-and-diming gyms with 14 different tiny charges at launch.

## Phase 12: Do not process door-hardware payments

Keep responsibilities separated.

Gym pays (hardware side): Kisi, Brivo, SALTO, installer, hardware, access-control provider.

Gym pays Volt: SaaS subscription.

That keeps you asset-light. Very important.

## Phase 13: Build onboarding as a business process

Gym onboarding should eventually look like:

1. Gym signs agreement
2. Gym creates Volt account
3. Gym chooses access provider
4. Gym authorizes Volt connection
5. Doors imported
6. Membership data imported
7. Access rules configured
8. Staff trained
9. Test members invited
10. Production launch

Document this from the first pilot. The ability to onboard a gym in 30 minutes instead of three days becomes a competitive advantage.

## Phase 14: Create support procedures

Door access is not like a calorie tracker. If someone's workout history fails to sync, they grumble. If they are locked outside at midnight, they call everybody.

Initially: email, in-app support, emergency gym-owner contact workflow, status page.

Severity levels:

- P1 — entire gym unable to access
- P2 — some users denied incorrectly
- P3 — individual membership issue
- P4 — general bug/request

You eventually need a plan for after-hours incidents. That is one reason the underlying door provider remains responsible for hardware availability.

## Phase 15: Measure the pilot

The first gym should produce hard evidence. Track:

- monthly active members
- access events
- unlock success rate
- failed access attempts
- average onboarding time
- support tickets
- access-related labor saved
- membership revocation time
- day-pass sales
- staff time saved

Example case study: "Before Volt, staff manually managed access accounts. After Volt, memberships and access sync automatically, reducing administrative work by 8 hours per week."

That is what sells the next gym. Not "our app has a cool UI."

## Phase 16: Build a sales process

After the pilot works, target similar gyms. Initial funnel: gym identified → owner contacted → 15-minute discovery call → demo → provider compatibility check → pilot → paid contract.

Build a simple CRM (HubSpot or a structured spreadsheet initially). Track: gym, owner, locations, members, access provider, management software, status, next action.

## Phase 17: Partner with installers and access-control integrators

Local access-control companies already install Brivo, Kisi, SALTO, Mercury, HID. They have relationships with the exact gyms you want.

Instead of seeing them as competitors, create a referral program. An installer could tell a gym: "We install the door hardware, Volt handles your membership and digital access."

You could pay referral commissions. They gain recurring business. You gain distribution.

## Phase 18: Partner with gym-management platforms later

Once Volt proves itself, explore integrations with platforms like Mindbody, ABC Fitness, PushPress, Zen Planner, GymMaster, ClubReady.

Then Volt becomes the layer connecting gym management → Volt → access control. That could be more valuable than trying to replace every gym-management system immediately.

## Phase 19: Geographic strategy

Do not launch nationwide instantly. Start in one region. From the Upper Midwest, Minneapolis / St. Paul / southern Minnesota / nearby Wisconsin makes operational sense.

Early customers may occasionally require a physical visit. Keeping them within driving distance saves a lot of misery.

## Phase 20: First-year target

- **Month 0–3:** 20–30 owner interviews, 1 access-provider integration, 1 design partner, business/legal setup.
- **Month 3–6:** 1 live gym, 500+ users, stable access, first case study.
- **Month 6–9:** 5–10 gyms, 2 access-provider integrations, repeatable onboarding, paid subscriptions.
- **Month 9–12:** 20–30 locations, $4k–$8k MRR, repeatable sales process, installer partnerships.

Care far more about 20 gyms that actively use the product than 100,000 consumer downloads.

## The main strategic rule

Do not try to replace everything immediately. The strongest starting position is:

```text
Existing gym systems
      ↓
VOLT
      ↓
Unified member identity
membership
payments
access
analytics
```

The advantage is becoming the software layer connecting gym membership to real-world gym access. That is a much more defensible business than competing head-on with every workout tracker, gym-management platform, social fitness app, and hardware company simultaneously.
