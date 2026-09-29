# Searching by name shows only matching restaurants

- **ID:** TC-SEARCH-001
- **Area:** Search
- **Priority:** High
- **Admin required:** No

## Preconditions
The app is running. At least one restaurant whose name contains "Jerusalem" exists, and at
least one restaurant whose name, cuisine and address do not contain "jerusalem" exists.

## Test data
- Search term: `jerusalem`

## Steps
1. Go to the homepage.
2. Click the search bar.
3. Type "jerusalem".

## Expected result
Only restaurants whose name contains "jerusalem" (case-insensitive) are shown in the search
results. Restaurants that do not match are not shown.

## Actual result
N/A - new coverage.
