# CLAUDE.md

## Project Overview

This repository contains both the Hospital Management System and the Aslan Medical public website.

Project path:

```text
C:\Users\YOGA\Desktop\Hospital-Management-System
```

GitHub:

```text
https://github.com/elmir-aslanov/Hospital-Management-System.git
```

The project is a full-stack MERN-based hospital platform with public website pages and role-based internal panels.

## Tech Stack

### Frontend

* `client/`
* React 19
* Vite
* React Router
* Axios
* i18next
* Ant Design and existing UI components
* Public website, admin, doctor, patient, nurse, receptionist, lab and other role panels are inside the same frontend.

### Backend

* `server/`
* Node.js
* Express
* MongoDB / Mongoose
* JWT authentication
* Refresh token cookie
* Socket.io
* API prefix: `/api/v1`
* Backend default port: `5000`
* Frontend port: `5174`

## Main Roles

The system uses role-based access control.

Main roles:

* `SUPER_ADMIN`
* `ADMIN`
* `DOCTOR`
* `NURSE`
* `RECEPTIONIST`
* `LAB_TECHNICIAN`
* `STAFF`
* `SOBE_MUDURU`
* `BAS_HEKIM`
* `PATIENT`

Never rely only on frontend hiding for permission control. Backend role guards must protect sensitive endpoints.

## Main Frontend Structure

Important frontend areas:

```text
client/src/pages/public
client/src/pages/admin
client/src/pages/doctor
client/src/pages/patient
client/src/App.jsx
client/src/api/axios.js
client/src/api/config.js
client/src/utils/authSession.js
```

Main public routes include:

```text
/departments
/services
/blog
/hekimler
/randevu
/e-netice
/services/biokimya
/services/biokimya/:slug
```

## Main Backend Structure

Backend modules usually follow a route/controller/service/model structure.

Important modules include:

```text
auth
users
patients
doctors
appointments
departments
services
billing
lab
EHR
inventory
blog
notifications
messages
```

Routes are mounted under `/api/v1` in `server/app.js`.

Swagger:

```text
/api-docs
```

Health check:

```text
/api/v1/health
```

## General Working Rules

Before making any change:

* Read the current local files.
* Understand existing frontend/backend data flow.
* Do not make assumptions without checking the code.
* Keep existing UI, route structure, data contracts and responsive behavior stable.
* Do not redesign the whole system.
* Make only targeted changes related to the task.
* Reuse existing components, helpers, models, services and endpoints whenever possible.
* Do not create duplicate systems for the same feature.
* Do not create mock business data in frontend.
* Do not use localStorage as a replacement for real backend data.
* Do not add hardcoded localhost URLs.
* Use the existing Axios client instead of raw fetch unless there is a strong technical reason.
* Use existing auth helpers, role guards and ownership logic.
* Do not revert user changes.
* Do not run destructive git commands.
* Do not touch unrelated files.
* Do not change files outside the project.

Required strict rules:

```text
Do not change files outside the project.
Do not touch unrelated files.
Do not overwrite or revert existing user changes.
Never use git reset or git checkout.
Ask before deleting, moving or renaming files.
Ask before installing or removing packages.
```

Ask before:

* deleting files
* moving files
* renaming files
* installing packages
* removing packages
* making large architecture changes
* running migrations
* changing indexes in a risky way
* bulk editing existing database records

After changes, run the relevant checks:

* touched-file lint where available
* client build when frontend is changed
* backend smoke test when endpoint behavior is changed
* route/API check when auth or backend routes are changed

At the end of work, summarize only:

1. Changed files
2. What changed
3. Test/build results
4. Any remaining risk

Avoid long explanations unless specifically requested.

## UI and Design Rules

Aslan Medical design direction:

* Minimal medical interface
* Teal and navy palette
* Clean white cards
* Thin borders
* Soft radius
* Balanced spacing
* Responsive layout
* No unnecessary large fonts
* No huge empty spaces
* Pages should not look edge-to-edge
* Preserve existing header and footer unless the task is specifically about them

Main colors already used in the project:

```text
TEAL: #00848e
NAVY: #0a1628
AI medical teal-blue: #087F8C
AI hover teal-blue: #066773
AI soft background: #EAF7F8
```

When matching a screenshot:

* Use screenshot layout, spacing and hierarchy as reference.
* Adapt text and branding to Aslan Medical.
* Do not copy unrelated brand names or logos.
* Do not rebuild the entire page.
* Make targeted UI changes only.

## i18n Rules

The project supports:

* Azerbaijani
* English
* Russian

For every new visible UI text:

* Add AZ, EN and RU translations.
* Do not hardcode visible UI text inside components.
* Keep translation keys synchronized across all three languages.
* Do not move database content such as doctor names, department names, service names or medical content into translation files.
* If a model already has multilingual fields, display the value according to the selected locale.
* Check that long English and Russian text does not break layout.

## Laboratory Workflow

The laboratory system is one of the most important parts of the project.

Correct lab flow:

1. Patient applies from a public test page.
2. Backend creates a unique request/order number:

```text
LAB-REQ-2026-000001
```

3. At this stage, no protocol number is created.
4. Reception confirms the request.
5. Patient comes to the clinic and sample is collected.
6. During “sample received” operation, backend creates a unique protocol number:

```text
LAB-2026-000001
```

7. Analysis moves to processing.
8. Lab technician enters results.
9. Result becomes `completed`, but is not public yet.
10. Authorized user approves and publishes it.
11. Status becomes `approved` and `isPublicVisible: true`.
12. Patient can view it on `/e-netice`.

Valid lab statuses:

```text
pending
confirmed
sample_collected
processing
completed
approved
cancelled
```

Never confuse:

```text
LAB-REQ-... = request/order number
LAB-... = protocol number after sample collection
```

Public E-Nəticə must accept only real protocol numbers, not request numbers.

Public E-Nəticə should show result only when:

```text
status === approved
isPublicVisible === true
```

## Lab Admin Panel Rules

Admin lab page has two main tabs:

* Orders
* Results

Orders table should include:

* Order number
* Protocol number
* Patient
* Doctor
* Tests
* Priority
* Status
* Actions

Rules:

* If a request exists, order number must never be empty.
* If sample is not collected yet, protocol number may be empty.
* If status is `sample_collected` or later, protocol number must exist.
* Do not use unclear “Status ↑” actions.
* Show status-specific actions.

Status actions:

```text
pending:
- Confirm reception
- Cancel

confirmed:
- Receive sample

sample_collected:
- Start processing
- Enter result

processing:
- Enter result

completed:
- View result
- Edit result
- Approve and publish

approved:
- View result
- Download PDF
- Return to edit if permission allows

cancelled:
- View details
```

Result save rules:

* If result does not exist, create it.
* If result exists, update it with PUT/PATCH.
* Do not POST duplicate results.
* Saving result should set order status to `completed`.
* Completed statistics must update.
* Result must appear in Results tab.

If an approved result is edited:

* status returns to `completed`
* `isPublicVisible` becomes `false`
* approval must be invalidated
* re-approval is required
* audit log must be written

## Lab Result Display Rules

Result modal should show:

* Patient name and surname
* Order number
* Protocol number
* Test name
* Sample date
* Result date
* Parameters
* General lab comment
* Internal note
* Entered by
* Approval information

Parameter table columns:

* Parameter
* Value
* Unit
* Reference range
* Status
* Note

Parameter statuses:

```text
normal
low
high
critical
pending
```

Food sensitivity tests must not use one generic `mg/dL` row. Food antigens must be separate rows, for example:

* Cow milk
* Egg white
* Wheat
* Hazelnut

Biochemistry tests must also show test-specific parameters.

PDF upload must not be mandatory. Prefer generating PDF from existing result data. Ask before installing a PDF package.

## Order and Protocol Generation Rules

Do not generate lab numbers in frontend.

Rules:

* `orderNumber` / `requestNumber` must be generated only in backend.
* `protocolNumber` must be generated only when sample is accepted.
* Do not use `countDocuments() + 1`.
* Use an atomic MongoDB counter.
* Keep unique indexes.
* Use sparse or partial index for optional unique fields.
* Duplicate numbers must not occur under parallel requests.
* Protocol generation must be idempotent.

Ask before database migration, bulk update or risky index changes.

## Public Laboratory Pages

Fox Food Sensitivity and Biochemistry pages share common public UI and request logic.

Detail page should include:

* breadcrumb
* test name
* short description
* price
* Apply for analysis
* Check result
* About test
* Technical indicators
* Reference range

“Check result” button:

* must redirect to `/e-netice`
* must not open a modal

Application flow:

1. Conditions and preparation
2. Patient selection
3. Branch, date and time
4. Confirmation

Logged-in patient:

* backend must identify patient from auth session
* patient card number should come from profile
* birth date should not be requested again
* even if frontend sends patientId, backend must use auth user’s patient profile

New patient:

* first name
* last name
* FIN
* birth date
* phone
* email

Avoid duplicate patient profiles.

Date input rules:

* internal format must be `YYYY-MM-DD`
* year must be 4 digits
* past dates blocked
* invalid dates like `20265` rejected
* backend must validate too
* avoid timezone date shift

## Biochemistry Rules

Biochemistry public route:

```text
/services/biokimya
/services/biokimya/:slug
```

Example test:

```text
Category: Biokimya
Name: Yağ turşuları (çox uzun zəncirli)
Test code: LAB-04-122
Price: 185 AZN
Sample: Blood
Method: LC-MS/MS
Duration: 5 working days
Synonym: VLCFA
```

Biochemistry tests must not be hardcoded in frontend. They must come dynamically from backend and be manageable from admin panel.

Use stable slug:

```text
biokimya
```

Display name:

```text
Biokimya
```

Do not filter by case-sensitive display name.

If page shows “No active tests”, check separately:

* loading state
* API error state
* real empty state

## Accessibility System

Public site has a floating accessibility button above WhatsApp button.

Asset:

```text
client/public/newelcatanliq.png
```

Public path:

```text
/newelcatanliq.png
```

Storage key:

```text
aslanMedicalAccessibility:v2
```

Main functions:

* Contrast
* Highlight links
* Increase text
* Text spacing
* Stop animations
* Hide images
* Dyslexia-friendly view
* Cursor
* Tooltips
* Line height
* Text alignment
* Color saturation
* Reset
* Move widget left/right or hide

Rules:

* This system does not require backend.
* Do not keep old accessibility system together with the new one.
* Button must be above WhatsApp and aligned on same center line.
* Pulse rings may animate.
* Main icon must remain centered.
* Icon itself must not rotate.
* Reduced-motion must stop animations.
* Accessibility panel UI should stay compact.
* Accessibility settings must not break the panel itself.

## AI Assistant

Public header has AI assistant near E-Nəticə.

Desktop order:

```text
AI köməkçi
E-Nəticə
Randevu Al
```

AI button:

* white background
* thin border
* pill shape
* sparkle icon
* text from i18n
* must not increase header height

Preferred AI color:

```text
#087F8C
```

Hover:

```text
#066773
```

Soft active/focus background:

```text
#EAF7F8
```

i18n:

```text
AZ: AI köməkçi
EN: AI Assistant
RU: ИИ-помощник
```

If AI chat exists, reuse it. Do not create a parallel AI chat system.

API keys must never be exposed to frontend.

## OTP and Email

OTP is email OTP, not Firebase SMS OTP.

Before changing OTP flow, inspect:

* auth routes
* controller
* service
* User model
* mail utility/service
* `.env.example`

OTP must have:

* expiration
* resend cooldown
* max send limit
* max verify attempts
* consistent hashing and comparison
* invalidation after successful use

## Doctor and Department Logic

Doctor form should not rely on free text for department selection.

Correct logic:

* Department is the clinical unit where doctor works.
* Specialty / Position is the professional title.

Example:

```text
Department: Kardiologiya
Specialty / Position: Kardioloq
```

Preferred form logic:

* `Department` is required and comes from active Departments dropdown.
* `Specialty / Position` may remain as a separate field if model supports it.
* Do not mix department and specialty blindly.
* If existing backend only supports one field, inspect contracts and choose the least risky backward-compatible mapping.

Public and admin doctor cards should display department consistently.

## Chief Doctor Logic

`BAS_HEKIM` is not the same as `ADMIN`.

Chief doctor is responsible for clinical oversight:

* clinical dashboard
* doctor activity monitoring
* department monitoring
* appointment clinical monitoring
* laboratory result approval
* medical document approval
* critical incidents
* medical councils
* clinical reports
* audit review

Chief doctor must not:

* change user roles
* manage super admin/admin accounts
* manage system configuration
* manage finance unless explicitly permitted
* hard delete data
* modify audit history

Backend role guard must protect all chief doctor endpoints.

## Known General Issues to Keep in Mind

Be careful with:

* SiteDoctor model confusion
* Appointment status mismatch between frontend and backend
* Register form fields vs backend model
* Hardcoded localhost in some files
* Raw fetch mixed with Axios
* Duplicate auth token storage keys
* BullMQ/Redis jobs may not be active
* Firebase phone login endpoint may not be mounted
* Public departments may return inactive departments
* Automated test infrastructure may be weak

Prefer targeted fixes over large refactors.

## Response Style for Agent Work

When completing a task, do not write long explanations.

Use this final format:

```text
Changed files:
- ...

What changed:
- ...

Checks:
- ...

Notes/Risks:
- ...
```

If a requested change requires a package, migration, large schema change or risky database operation, stop and ask first.
