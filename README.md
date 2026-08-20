# CareBridge AI

1. Complete Website Structure

Your platform can have these main areas:

CareBridge AI

│

├── Landing Page

├── Hospital Login

│   └── Hospital Dashboard

│       ├── Overview

│       ├── Patients

│       ├── High-Risk Patients

│       ├── Patient Details

│       ├── Follow-Ups

│       ├── Medication Adherence

│       ├── Intervention Center

│       ├── Analytics

│       ├── Revenue Recovery

│       └── Settings

│

└── Patient Login

    └── Patient Dashboard

        ├── Home

        ├── My Care Plan

        ├── Medicines

        ├── Appointments

        ├── Tests

        ├── Care Score

        ├── Messages

        ├── Family/Caregiver

        └── Profile

2. LANDING PAGE

This is the public website.

Hero Section

CareBridge AI

"Prevent patients from disappearing after diagnosis."

Subtext:

AI-powered patient continuity platform that predicts follow-up drop-off and helps hospitals intervene before patients leave the care journey.

Buttons:

For Hospitals
Patient Login

Below this

Show 3 numbers:

Predict → Intervene → Recover

Then explain:

The Problem

Diagnosis is not the end of treatment.

Diagnosis

   ↓

Discharge

   ↓

Missed Appointment

   ↓

Medication Stops

   ↓

Condition Worsens

Our solution

Diagnosis

   ↓

CareBridge AI

   ↓

Risk Prediction

   ↓

Personalized Intervention

   ↓

Follow-Up

   ↓

Better Outcome

3. HOSPITAL LOGIN

Hospital staff logs in using:

 Hospital email

 Password

 2FA / OTP

After login, they enter the Hospital Dashboard.

Different roles should have different access:

Admin

Complete access.

Doctor

Patient information + clinical follow-up.

Care Coordinator

Follow-up and intervention management.

Nurse

Medication/adherence monitoring.

This is important because you should not give every employee access to everything.

4. HOSPITAL DASHBOARD

This is the most important screen.

The first thing the hospital sees:

Today's Care Overview

ACTIVE PATIENTS       12,540

HIGH-RISK PATIENTS     1,284

FOLLOW-UPS TODAY         186

MISSED FOLLOW-UPS        32

PATIENTS AT RISK         247

REVENUE AT RISK        ₹24.6 L

Then a visual:

Patient Risk Distribution

LOW       68%

MEDIUM    22%

HIGH      10%

5. "HIGH-RISK PATIENTS" PAGE

This is your main USP screen.

Hospital sees:

PatientDiseaseRiskReasonNext ActionRahulDiabetes87%Missed 2 visitsCallPriyaHypertension78%Medication gapsWhatsAppAmitHeart Disease92%No test doneStaff Alert

The hospital doesn't need to manually find these patients.

AI says:

"These 20 patients need attention today."

That is extremely valuable.

6. HOW THE AI RISK SCORE WORKS

The hospital doesn't manually enter a risk score.

The platform calculates it.

Patient information can come from:

Hospital system integration

 Diagnosis

 Prescription

 Appointment

 Previous visit history

 Lab records

Patient-entered information

 Medicine taken/missed

 Symptoms

 Appointment confirmation

 Travel difficulty

 Financial difficulty

Behaviour signals

 Missed appointments

 Repeated rescheduling

 Medication skips

 Unopened reminders

 Missed tests

AI combines these signals.

For example:

Appointment missed             +25

Medication adherence declining +20

Two reminders ignored          +15

Long travel distance           +10

Financial difficulty           +15

------------------------------------

DROP-OFF RISK                   85%

For a real production system, these scores should be clinically validated rather than presented as diagnostic predictions.

7. PATIENT PROFILE PAGE

When hospital staff click Rahul:

Rahul Sharma

Age: 52
Condition: Type 2 Diabetes
Diagnosis: 10 Aug 2026
Next Visit: 15 Sep 2026

Care Continuity Score

62 / 100

AI Risk

High Risk — 85%

Why?

AI explains:

Missed 2 previous follow-ups
Medication adherence fell from 90% → 63%
Last test not completed
Patient reported transportation difficulty

This explanation is critical.

Don't just show:

"AI says high risk."

Show why.

8. CARE CONTINUITY SCORE

This is one of your signature features.

Score from:

0–100

Calculated from:

 Appointment adherence

 Medication adherence

 Test completion

 Care-plan completion

 Patient engagement

Example:

Appointment      90%

Medication       68%

Tests            50%

Engagement       75%

Care Score       62/100

The score changes over time.

Patient improves:

62 → 74 → 87

Patient deteriorates:

87 → 72 → 51

Hospital can see the trend.

9. PATIENT DASHBOARD

Now let's look at what the actual patient sees.

Patient logs in with:

 Mobile number

 OTP

They should not see complex hospital analytics.

Their home page says:

Good Morning Rahul 👋

Your Care Status

Care Score: 82

Today's Tasks

✅ Morning medicine
✅ Check blood sugar
⬜ Drink water
⬜ Confirm follow-up

Next Appointment

15 September

10:30 AM

Doctor: Dr. Sharma

Button:

Confirm Appointment

10. MEDICATION MODULE

Patient sees:

Today's Medicines

Metformin

8:00 AM

Taken ✅

Blood Pressure Medicine

8:00 PM

Take Now

Patient taps:

Taken

The system records:

Medication taken at 8:04 PM

If patient repeatedly misses medicines, the AI notices the pattern.

11. FOLLOW-UP MODULE

Patient sees:

Upcoming Appointment

15 September
10:30 AM

Buttons:

Confirm

Reschedule

Need Help

"Need Help" is important.

Patient can select:

 Can't afford visit

 Can't travel

 Forgot

 Feeling better

 Side effects

 Other

Now the platform learns why the patient may drop off.

12. TEST / LAB MODULE

The hospital assigns:

Required Test

HbA1c

Due:

10 September

Patient sees:

Book Test

or

Upload Report

After completion:

✅ Test Completed

Hospital dashboard updates automatically.

13. AI "WHY AM I STRUGGLING?" FEATURE

Instead of assuming why the patient is dropping out, ask them.

Every few weeks:

"What's making it difficult to follow your care plan?"

Patient selects:

💰 Cost
🚗 Transportation
⏰ Busy schedule
💊 Side effects
😌 Feeling better
😟 Fear/anxiety
❓ Don't understand treatment

This is a powerful feature.

You aren't simply predicting that someone will drop out.

You are learning why.

14. SMART INTERVENTION ENGINE

This is where your platform becomes intelligent.

Suppose Rahul's risk becomes 60%.

System doesn't immediately call him.

It starts with a low-cost intervention.

Stage 1

Push notification.

Stage 2

WhatsApp reminder.

Stage 3

Personalized message.

Example:

"Rahul, your diabetes follow-up is due in 5 days. You previously mentioned transportation difficulty. Would you like to schedule a teleconsultation?"

Stage 4

If risk reaches 80%:

Care coordinator gets alert.

Stage 5

If critical:

Hospital staff calls patient.

This creates a graduated intervention system.

15. FAMILY / CAREGIVER MODULE

Patient can optionally nominate:

Emergency/Care Partner

Example:

Daughter – Ananya

Patient gives explicit permission.

If patient repeatedly misses critical care tasks:

"Rahul has missed 3 scheduled care activities. Please remind him to complete his follow-up."

Do not automatically share medical information without patient consent.

16. FINANCIAL BARRIER MODULE

This can make your product much more India-specific.

Patient can say:

"My treatment is becoming difficult to afford."

System can provide:

 Lower-cost alternatives for clinician review

 Nearby government facilities

 Teleconsultation options

 Eligible government schemes

 Assistance information

Important: the AI should not independently change prescriptions.

17. HOSPITAL INTERVENTION CENTER

Hospital staff gets one place to manage alerts.

TODAY'S ACTIONS

🔴 12 Critical

🟠 31 High Risk

🟡 78 Medium Risk

Click a patient.

Actions:

Call Patient

WhatsApp

Reschedule

Assign Care Coordinator

Mark Resolved

18. AUTOMATION

The system should automatically perform routine actions.

Example:

7 days before appointment

Reminder.

3 days before

Second reminder.

1 day before

Confirmation.

Appointment missed

"Would you like to reschedule?"

48 hours later

If no response → risk increases.

High-risk threshold reached

Care coordinator gets alert.

This means hospitals don't have to manually chase everyone.

19. ANALYTICS DASHBOARD

Hospital management gets:

Follow-Up Completion

January: 68%
February: 71%
March: 75%
April: 81%

Medication Adherence

73%

Drop-Off Rate

↓ 19%

High-Risk Patients

1,284

Intervention Success

62%

20. REVENUE RECOVERY DASHBOARD

This is your business dashboard.

Show:

Patients recovered

420

Follow-up appointments recovered

680

Estimated revenue recovered

₹18.4 lakh

Revenue at risk

₹24.6 lakh

Recovery rate

74%

This makes the hospital understand:

"CareBridge isn't just a healthcare tool. It has measurable financial ROI."

Be careful to label these as estimated/recovered revenue, and calculate them from the hospital's actual appointment/service economics.

21. ADMIN DASHBOARD

Hospital administrator can configure:

Diseases

 Diabetes

 Hypertension

 TB

 Cardiac

 Post-surgery

Reminder channels

 SMS

 WhatsApp

 Email

 Voice

Risk thresholds

 Low

 Medium

 High

 Critical

Staff assignment

Which coordinator handles which patient.

22. PATIENT JOURNEY — COMPLETE FLOW

This is the simplest way to understand the entire website:

1. DIAGNOSIS

      ↓

2. Hospital creates patient profile

      ↓

3. Care plan entered

      ↓

4. Patient receives CareBridge access

      ↓

5. Patient takes medicines / completes tasks

      ↓

6. AI continuously monitors engagement

      ↓

7. AI calculates Drop-Off Risk

      ↓

8. Risk increases

      ↓

9. AI determines WHY

      ↓

10. Personalized intervention

      ↓

11. Patient responds

      ↓

12. Hospital gets updated status

      ↓

13. Follow-up completed

      ↓

14. Care Score improves

23. WHAT HAPPENS WHEN THE PATIENT COMPLETELY DISAPPEARS?

This is very important.

Suppose:

Rahul has not opened the app for 7 days.

System detects:

 No medication updates

 No appointment confirmation

 No response

Risk increases:

55% → 72% → 89%

Then:

AI

Send personalized message.

↓

No response

WhatsApp.

↓

No response

Care coordinator alert.

↓

Hospital calls.

↓

Patient reconnects

Risk falls.

This is the actual "preventing care drop-off" workflow.

24. WHAT THE JUDGE SHOULD SEE IN YOUR DEMO

Don't try to show 30 features.

Show this one story:

Rahul — Diabetes Patient

Step 1: Diagnosed
Step 2: Hospital creates care plan
Step 3: Rahul uses patient dashboard
Step 4: Rahul misses medicine and follow-up
Step 5: AI detects rising risk
Step 6: AI identifies transportation as the barrier
Step 7: Platform offers teleconsultation / assistance
Step 8: Hospital coordinator is alerted
Step 9: Rahul completes follow-up
Step 10: Care Score improves

Then tell the judge:

"We don't wait for the patient to disappear. We identify the warning signals early and intervene."
i want UI/UX same to same exact same as image which i have provide above and there should be all features are functional

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2af7757c-ae1e-46f6-ab5d-ddcc5c1cf35b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
