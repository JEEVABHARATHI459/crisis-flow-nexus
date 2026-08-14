# Crisis Response Hub

# CRISISMESH — BUILD THE ACTUAL WORKING APPLICATION

I do NOT want a static landing page, UI mockup, or collection of non-functional screens.

I want you to build a **fully functional, interactive, multi-page web application** called **CrisisMesh**.

Every major button, navigation item, form, filter, modal, tab, status update, assignment action, and page must actually work.

The application must navigate between real routes/pages and maintain application state/data across those pages.

This is a hackathon-ready MVP.

---

# CORE PRODUCT

CrisisMesh is an AI-assisted emergency response coordination platform.

It converts fragmented emergency reports such as:

* WhatsApp messages
* SMS
* Social media reports
* Voice-note transcripts
* Manual reports

into:

**STRUCTURED INCIDENT → DUPLICATE CLUSTER → PRIORITY → RESOURCE MATCH → VOLUNTEER ASSIGNMENT → TASK → RESOLUTION**

The main demonstration must show this complete workflow.

Example:

INPUT:

"Need insulin near central bus stand."

"Diabetic patient is stranded near bus stand."

"Urgent insulin needed close to main bus stop."

AI OUTPUT:

Medical Emergency

Location:
Central Bus Stand

Affected People:
1

Required Resource:
Insulin

Urgency:
CRITICAL

Duplicate Reports:
3

Priority Score:
94/100

Then:

3 reports → 1 consolidated incident → resource matched → volunteer assigned → task created → task completed.

---

# VERY IMPORTANT

Do NOT use dead buttons.

Do NOT use buttons that only show "Coming Soon".

Do NOT create pages that contain only placeholder content.

Do NOT make navigation links point to "#".

Do NOT use fake navigation.

Every navigation item must route to an actual page.

Every important action must update the application's data/state.

Use realistic mock data initially, but structure the application so the backend/database can be connected and used.

---

# BACKEND REQUIREMENT

Use **Lovable Cloud or Supabase** for persistent application data.

Create the necessary database tables and relationships.

The app should NOT depend entirely on hardcoded React arrays.

Use database-backed data for:

* users
* reports
* incidents
* incident_reports
* volunteers
* resources
* tasks
* notifications
* audit_logs
* locations
* shelters

Use realtime subscriptions where appropriate so the dashboard can update when incidents/tasks/statuses change.

If Lovable Cloud is enabled, use it.

If using Supabase, create the schema and connect the application.

Do not expose secret/service-role keys in frontend code.

---

# APPLICATION ROUTES

Create these actual routes:

/login

/dashboard

/reports

/reports/new

/ai-processing

/incidents

/incidents/:id

/map

/volunteers

/resources

/tasks

/analytics

/audit

/settings

Each route must render a real page.

Navigation between pages must work using React Router.

Browser refresh must preserve the current route.

---

# LOGIN PAGE

Route:

/login

Create a professional CrisisMesh login screen.

Logo:

CRISISMESH

Headline:

TURN CHAOS INTO COORDINATION.

Subtitle:

AI-assisted crisis intelligence for faster, smarter humanitarian response.

Fields:

Email

Password

Buttons:

SIGN IN

ENTER DEMO MODE

Demo credentials:

[demo@crisismesh.ai](mailto:demo@crisismesh.ai)

demo123

When the user clicks SIGN IN:

* validate credentials
* create/login the user
* redirect to /dashboard

When the user clicks ENTER DEMO MODE:

* create a demo session
* redirect to /dashboard

If the user is already authenticated, redirect them away from /login.

Add logout functionality.

---

# GLOBAL APPLICATION LAYOUT

After login, use a persistent application shell.

LEFT SIDEBAR:

CrisisMesh logo

Dashboard

Live Incidents

Incoming Reports

AI Processing

Operations Map

Volunteers

Resources

Tasks

Analytics

Audit Trail

Settings

Bottom:

System Status

● AI Engine Online

● Database Connected

● Map Services Online

User:

Operations Coordinator

Emergency Response Team

The sidebar links must actually navigate to their respective routes.

---

# TOP NAVBAR

Show:

CHENNAI FLOOD RESPONSE — 2026

● LIVE

Search

Notifications

User profile

Logout

The notification icon must open a working notification panel.

---

# DASHBOARD

Route:

/dashboard

Heading:

CRISIS OPERATIONS CENTER

Subtitle:

AI-assisted coordination and real-time incident management.

Create live statistic cards:

CRITICAL INCIDENTS

ACTIVE INCIDENTS

PEOPLE AFFECTED

AVAILABLE VOLUNTEERS

UNRESOLVED REQUESTS

These numbers must come from application data.

Do not hardcode the displayed totals separately from the underlying data.

If an incident is completed, the relevant dashboard values should update.

---

# DASHBOARD — LIVE INCIDENT FEED

Show current incidents.

Each incident card must contain:

Incident ID

Incident type

Location

Affected people

Required resource

Priority

Reports merged

Assigned team

Status

Timestamp

Buttons:

VIEW INCIDENT

ASSIGN RESOURCE

Clicking VIEW INCIDENT must navigate to:

/incidents/:id

Clicking ASSIGN RESOURCE must open the assignment interface.

---

# DASHBOARD — AI ACTIVITY

Create:

CRISISMESH AI

Show:

Reports processed

Entities extracted

Duplicates detected

Incident clusters created

Resources matched

Tasks created

These values should be calculated from actual application data.

Button:

VIEW AI PROCESSING

This must navigate to:

/ai-processing

---

# INCOMING REPORTS PAGE

Route:

/reports

Create a complete inbox for emergency reports.

Tabs:

ALL

WHATSAPP

SMS

SOCIAL MEDIA

VOICE TRANSCRIPT

MANUAL

Each report must show:

Report ID

Source

Message

Timestamp

Location

Processing status

Priority if identified

Create button:

* ADD EMERGENCY REPORT

This navigates to:

/reports/new

---

# ADD EMERGENCY REPORT PAGE

Route:

/reports/new

Create a real form.

Fields:

Source

Dropdown:

WhatsApp
SMS
Social Media
Voice Transcript
Manual

Emergency message

Textarea

Location

Optional

Affected people

Optional number

Submit:

PROCESS WITH CRISISMESH AI

When submitted:

1. Save the report.
2. Show processing state.
3. Analyze the message.
4. Extract structured information.
5. Search existing incidents.
6. Detect possible duplicates.
7. Calculate urgency.
8. Create or update an incident.
9. Add an audit log.
10. Redirect to the AI processing/result screen.

---

# AI PROCESSING PAGE

Route:

/ai-processing

Create a visual pipeline.

REPORT RECEIVED

↓

TEXT NORMALIZATION

↓

ENTITY EXTRACTION

↓

LOCATION IDENTIFICATION

↓

DUPLICATE DETECTION

↓

URGENCY CLASSIFICATION

↓

RESOURCE MATCHING

↓

TASK CREATION

Each stage should have:

Icon

Status

Timestamp

Processing indicator

Confidence

When processing a new report, animate the stages sequentially.

Do NOT just animate them visually without performing the underlying application logic.

---

# AI EXTRACTION

For each report, extract:

incidentType

location

affectedPeople

requiredResource

urgency

confidence

source

keywords

duplicateCandidates

For the prototype, use deterministic/mock AI logic if no external AI API is configured.

However, structure it as a service so a real AI model can be connected later.

Do not claim that a real LLM processed the report if the app is using mock logic.

---

# DUPLICATE DETECTION

This is one of the most important CrisisMesh features.

When multiple reports describe the same event, identify them as possible duplicates.

Example:

Report 1:

"Need insulin near central bus stand."

Report 2:

"Diabetic patient is stranded near bus stand."

Report 3:

"Urgent insulin needed close to main bus stop."

Display:

POSSIBLE DUPLICATE INCIDENT

Similarity:

92%

Reports:

3

Location:

Central Bus Stand

Requirement:

Insulin

Priority:

CRITICAL

Buttons:

MERGE REPORTS

KEEP SEPARATE

When MERGE REPORTS is clicked:

* create/identify one incident
* link the reports to that incident
* mark duplicate reports as merged
* update the incident report count
* create an audit log
* show success notification

---

# INCIDENTS PAGE

Route:

/incidents

Show all incidents.

Filters:

All

Critical

High

Medium

Low

Unassigned

Assigned

In Progress

Resolved

Search by:

Incident ID

Location

Incident type

Each incident must be clickable.

Click:

/incidents/:id

---

# INCIDENT DETAIL PAGE

Route:

/incidents/:id

Display:

Incident ID

Incident type

Status

Priority

Priority score

Location

Affected people

Required resources

Source reports

Assigned volunteer/team

Created time

Updated time

Confidence

---

# INCIDENT STATUS

Support:

NEW

UNDER REVIEW

PRIORITIZED

ASSIGNED

IN PROGRESS

RESOLVED

CANCELLED

Changing status must update the database/application state.

---

# PRIORITY ENGINE

Display:

PRIORITY SCORE

Example:

94 / 100

Factors:

Medical emergency +35

Vulnerable person +25

Time sensitivity +20

Multiple reports +10

Location confidence +4

Show:

CRITICAL

Button:

WHY THIS PRIORITY?

Clicking it should open a modal explaining the recommendation.

Include:

"This is an AI-assisted recommendation and requires human verification."

Buttons:

ACCEPT

EDIT

REJECT

All actions should be stored in the audit trail.

---

# INCIDENT REPORTS

On the incident detail page, show every source report linked to the incident.

Example:

4 reports consolidated

Report #R104

WhatsApp

"Need insulin near central bus stand."

Report #R105

SMS

"Diabetic patient stranded near bus stand."

Report #R106

WhatsApp

"Urgent insulin required near main bus stop."

Report #R107

Manual

"Medicine required for diabetic patient."

Show:

MERGED

for duplicate reports.

---

# INCIDENT TIMELINE

Create a real timeline.

Example:

2:41 PM
Report received

2:42 PM
Location extracted

2:42 PM
Medical need identified

2:43 PM
Duplicate reports detected

2:43 PM
Incident created

2:44 PM
Priority calculated

2:45 PM
Volunteer assigned

2:58 PM
Task completed

Timeline data must come from audit/event records.

---

# RESOURCE MATCHING

On the incident detail page:

Button:

FIND BEST RESOURCE

When clicked, calculate recommendations using:

Distance

Availability

Required skill

Resource type

Urgency

Show recommendations.

Example:

TEAM B

Distance:
1.2 km

Skill:
Medical Aid

Availability:
Available

Match Score:

94%

Button:

ASSIGN

When ASSIGN is clicked:

* assign volunteer/team
* update incident
* create task
* update volunteer status
* create audit log
* create notification
* show success toast

---

# VOLUNTEERS PAGE

Route:

/volunteers

Create a real volunteer management page.

Fields:

Name

Team

Skills

Location

Availability

Current task

Status

Example:

Arun Kumar

Team A

Medical Aid

2.4 km away

Available

Priya Sharma

Team B

First Aid

1.2 km away

Busy

Filters:

Available

Busy

Offline

Medical

Transport

Rescue

Clicking a volunteer opens volunteer details.

---

# RESOURCES PAGE

Route:

/resources

Display:

Medical supplies

Water

Food

Vehicles

Shelters

Rescue equipment

Example:

INSULIN

Available:

24

Reserved:

6

Location:

Ward 3 Medical Center

Status:

AVAILABLE

Allow:

Reserve

Release

Update quantity

These actions must update the underlying data.

---

# TASKS PAGE

Route:

/tasks

Create a Kanban task board.

Columns:

NEW

PRIORITIZED

ASSIGNED

IN PROGRESS

COMPLETED

Each task card:

Task ID

Incident

Description

Location

Priority

Assigned person/team

Created time

Allow moving tasks between statuses.

When status changes:

* update database
* update incident status if appropriate
* update dashboard
* create audit log
* create notification

---

# OPERATIONS MAP

Route:

/map

Create an interactive operations map centered around Chennai.

Show incident markers.

Colors:

RED = Critical

ORANGE = High

YELLOW = Medium

GREEN = Resolved

Also show:

Volunteer locations

Resource locations

Shelters

Vehicles

Use demo coordinates.

Clicking an incident marker should open:

Incident ID

Type

Priority

Location

Affected people

Required resource

Assigned team

VIEW INCIDENT

The VIEW INCIDENT button must navigate to /incidents/:id.

---

# MAP FILTERS

Create:

ALL

CRITICAL

HIGH

MEDICAL

EVACUATION

FOOD

WATER

SHELTER

VOLUNTEERS

RESOURCES

UNASSIGNED

Filters must actually change visible markers.

---

# TASK ASSIGNMENT WORKFLOW

When a coordinator assigns a volunteer:

Incident:

INC-1042

↓

Recommended Team:

Team B

↓

Coordinator clicks:

ASSIGN TEAM

↓

Show confirmation:

"Assign Team B to INC-1042?"

Confirm

Cancel

↓

After Confirm:

Incident status:

ASSIGNED

Volunteer:

BUSY

Task:

CREATED

Notification:

SENT

Audit log:

CREATED

Dashboard:

UPDATED

Map:

UPDATED

This must happen in the actual application state.

---

# NOTIFICATIONS

Create a working notification system.

Examples:

"New critical medical incident detected."

"4 duplicate reports merged."

"Team B assigned to INC-1042."

"Water shortage reported at Ward 4."

"Critical incident awaiting human verification."

Clicking a notification should navigate to the relevant incident/task.

---

# ANALYTICS PAGE

Route:

/analytics

Use application data.

Show:

Total Reports

Total Incidents

Duplicate Reports

Critical Incidents

Resolved Incidents

Average Response Time

Tasks Completed

Volunteer Utilization

Resource Utilization

Create charts:

Reports by hour

Incidents by category

Priority distribution

Response time

Resource demand

Do not hardcode chart values separately from the database/state.

---

# AUDIT TRAIL

Route:

/audit

Show every important action.

Columns:

Timestamp

Action

Entity

Actor

Type

Confidence

Details

Example:

14:42:18

REPORT_RECEIVED

R104

System

*

14:42:20

LOCATION_EXTRACTED

R104

AI

94%

14:42:22

DUPLICATE_DETECTED

INC-1042

AI

92%

14:42:24

PRIORITY_RECOMMENDED

INC-1042

AI

94%

14:45:01

VOLUNTEER_ASSIGNED

INC-1042

Coordinator

*

Filters:

AI Actions

Human Actions

Assignments

Status Changes

Priority Changes

Report Processing

---

# DEMO MODE

Create a major button:

▶ RUN LIVE DEMO

This must actually execute the complete CrisisMesh workflow.

When clicked:

PHASE 1

Show 5 incoming emergency reports.

PHASE 2

Process each report.

PHASE 3

Extract:

Location

People

Need

Urgency

Resource

PHASE 4

Detect duplicates.

PHASE 5

Merge duplicate reports.

PHASE 6

Create incident.

PHASE 7

Calculate priority.

PHASE 8

Find available volunteer.

PHASE 9

Assign volunteer.

PHASE 10

Create task.

PHASE 11

Update map.

PHASE 12

Mark task completed.

PHASE 13

Update dashboard statistics.

PHASE 14

Show audit trail.

Use animations between phases.

At the end display:

CRISIS RESOLVED

Incident:

INC-1042

Reports consolidated:

4

Volunteer assigned:

Team B

Response time:

17 minutes

Status:

RESOLVED

---

# DEMO DATA

Prepopulate the application with realistic data.

Use at least:

30 reports

15 incidents

10 volunteers

15 resources

20 tasks

30 audit events

10 notifications

Use Chennai locations.

Example areas:

Central Bus Stand

Anna Nagar

T Nagar

Velachery

Adyar

Guindy

Tambaram

Porur

Mylapore

Perambur

---

# MULTILINGUAL SUPPORT

Add language selector:

English

Tamil

Hindi

The interface should change language for the main navigation and labels.

Also allow emergency reports in Tamil.

Example:

"சென்ட்ரல் பஸ் ஸ்டாண்டுக்கு அருகில் இன்சுலின் தேவை. சர்க்கரை நோயாளி ஒருவர் சிக்கியுள்ளார்."

The application should demonstrate converting this into structured information.

For the prototype, deterministic translation/mock processing is acceptable.

---

# HUMAN-IN-THE-LOOP

Never present AI decisions as autonomous emergency commands.

For AI recommendations show:

AI RECOMMENDATION

Confidence: 94%

Buttons:

ACCEPT

EDIT

REJECT

Human confirmation should be required before:

* assigning a volunteer
* changing critical priority
* closing a critical incident

---

# SAFETY MESSAGE

Display:

"CrisisMesh is an AI-assisted coordination prototype. It does not replace emergency services, trained responders, or official authorities. All AI-generated recommendations require human verification."

---

# SETTINGS PAGE

Route:

/settings

Include:

Profile

Notifications

Language

Theme

Demo Mode

Data Management

System Status

Add working toggles where appropriate.

---

# RESPONSIVE DESIGN

The entire application must work on:

Desktop

Laptop

Tablet

Mobile

On mobile:

* collapsible sidebar
* responsive cards
* responsive tables
* map adapts to screen
* bottom navigation may be used if appropriate
* no horizontal scrolling

---

# DESIGN

Use a professional dark command-center design.

Colors:

Background:
#080C12

Panels:
#101720

Cards:
#151D27

Text:
#F8FAFC

Muted:
#94A3B8

Critical:
Red

High:
Orange

Medium:
Yellow

Resolved:
Green

AI:
Cyan/Blue

Use subtle borders, shadows, glow effects and animations.

Do not overuse gradients.

---

# ROUTING REQUIREMENT

This is extremely important.

Use proper React Router navigation.

For example:

Dashboard button → /dashboard

Live Incidents → /incidents

Incoming Reports → /reports

AI Processing → /ai-processing

Map → /map

Volunteers → /volunteers

Resources → /resources

Tasks → /tasks

Analytics → /analytics

Audit Trail → /audit

Settings → /settings

View Incident → /incidents/:id

Add Report → /reports/new

Browser back/forward buttons must work.

Refreshing a route must not send the user back to the dashboard.

---

# ERROR HANDLING

Add:

Loading states

Empty states

Error states

Toast notifications

Form validation

Confirmation dialogs

404 page

If a requested incident does not exist:

Show:

"Incident not found"

Button:

Back to Incidents

---

# DATABASE STRUCTURE

Create appropriate tables/entities:

users

reports

incidents

incident_reports

incident_events

volunteers

resources

tasks

notifications

audit_logs

locations

shelters

Use relationships between them.

For example:

reports → incident_reports → incidents

incidents → tasks

incidents → volunteers

incidents → audit_logs

---

# IMPORTANT DATA BEHAVIOR

If I add a report:

It must appear in Incoming Reports.

If I process the report:

It must create/update an incident.

If reports are merged:

The incident's report count must change.

If a volunteer is assigned:

Volunteer status becomes BUSY.

If a task is created:

It appears in Tasks.

If a task is completed:

Incident can become RESOLVED.

If an incident is resolved:

Dashboard statistics update.

If anything important changes:

Audit log is created.

If a critical incident appears:

Notification is created.

This data flow must actually work.

---

# FINAL TESTING REQUIREMENT

Before considering the application complete, test the following workflow:

1. Login
2. Open Dashboard
3. Open Incoming Reports
4. Add new report
5. Process report
6. View AI extraction
7. Detect duplicate
8. Merge reports
9. Create incident
10. Open incident detail
11. View priority explanation
12. Find resource
13. Assign volunteer
14. Create task
15. Open Tasks
16. Move task to In Progress
17. Complete task
18. Open Map
19. Verify incident marker
20. Open Analytics
21. Open Audit Trail
22. Verify actions
23. Check Notifications
24. Logout
25. Login again

Fix any broken navigation, state updates, database errors, console errors, or non-functional buttons you encounter.

---

# MOST IMPORTANT SUCCESS CRITERIA

When I demonstrate this to a hackathon judge, I should be able to say:

"I received these 4 messy emergency messages."

Then click:

PROCESS

The application should visibly demonstrate:

4 messy messages

↓

AI extracts information

↓

Detects that they refer to the same event

↓

4 reports become 1 incident

↓

Incident receives CRITICAL priority

↓

System finds the closest available medical volunteer

↓

Coordinator approves assignment

↓

Task is created

↓

Volunteer is assigned

↓

Incident appears on the map

↓

Task is completed

↓

Dashboard updates

↓

Audit trail records everything

That complete workflow is the core of CrisisMesh.

BUILD THIS AS A REAL WORKING APPLICATION, NOT A STATIC DESIGN.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://crisis-flow-nexus.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b2e24b77-ebbf-4ca9-8158-d18e864c4af2).

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
