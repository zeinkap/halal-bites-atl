# Search and cuisine filter work together

- **ID:** TC-FILTER-001
- **Area:** Search, Filters
- **Priority:** Medium
- **Admin required:** No

## Preconditions
The app is running. At least one Middle Eastern restaurant whose name contains "Jerusalem" exists
in the seed data ("Jerusalem Bakery & Grill"), and at least one restaurant with a different
cuisine exists.

## Test data
- Search term: `jerusalem`
- Cuisine filter: Middle Eastern

## Steps
1. Go to the homepage.
2. Type "jerusalem" in the search bar.
3. Open the filters panel.
4. Select "Middle Eastern" in the cuisine filter.

## Expected result
Every restaurant shown has a name, cuisine or address containing "jerusalem" AND has the cuisine
"Middle Eastern". At least one result ("Jerusalem Bakery & Grill") is shown, and restaurants of
other cuisines are not shown.

## Actual result
N/A - new coverage.
