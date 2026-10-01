# User can submit a website issue report from the navbar

- **ID:** TC-REPORT-001
- **Area:** Bug report
- **Priority:** Medium
- **Admin required:** No

## Preconditions
The app is running and the homepage loads. No other modal is open.
`POST /api/bug-report` is stubbed in the test (`page.route`) to return a success response, so no real email is sent, no Cloudinary call is made, and no database row is created.

## Test data
- What's not working: `Automation test <timestamp>` (suffix with a unique value per run)
- Tell us more about the issue: `automation test`
- Steps to reproduce: `test steps to reproduce`
- Browser: `browser`
- Device: `device`
- Email: `automation-test@email.com`
- No screenshot is attached.
- Cleanup: none needed, because the API response is stubbed and nothing is persisted.

## Steps
1. Go to the homepage.
2. Click "Report" in the top navigation bar.
3. Click the "What's not working?" field.
4. Type the title "Automation test <timestamp>".
5. Click the "Tell us more about the issue" field.
6. Type "automation test".
7. Click "Add more details (optional)".
8. Click the "Steps to reproduce the issue" field and type "test steps to reproduce".
9. Click the "Browser" field and type "browser".
10. Click the "Device" field and type "device".
11. Click the "Email (for follow-up questions)" field and type "automation-test@email.com".
12. Click "Submit Report".

## Expected result
- After step 2, the "Report Issue with Website" dialog opens with empty fields.
- After step 7, the extra fields (Steps to reproduce, Browser, Device, Email) appear and the link reads "Show less".
- After step 12, the dialog closes and a success toast appears: "Thank you! Your bug report has been submitted successfully. We will look into it."
- The request sent to `/api/bug-report` is a POST (can be checked via the stubbed route).

## Actual result
N/A - new coverage

## Implementation notes
- Add `data-testid`s in `src/` for the "Add more details" / "Show less" toggle (suggested `bug-report-toggle-details`). The "Thank you!" panel is transient and is not asserted.
- Add a `data-testid` to the success toast only if it cannot be located reliably by role or text; prefer a testid per project convention.
