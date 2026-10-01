# Cuisine filter shows only restaurants of the selected cuisine

- **ID:** TC-FILTER-001
- **Area:** Filters
- **Priority:** Medium
- **Admin required:** No

## Preconditions
The app is running with the seed data. At least one Mediterranean restaurant exists
("Jerusalem Bakery & Grill") and at least one restaurant of another cuisine exists
("Bismillah Cafe", Bangladeshi). No search term and no other filter is applied.

## Test data
- Cuisine filter: Mediterranean

## Steps
1. Go to the homepage.
2. Open the filters panel.
3. Select "Mediterranean" in the cuisine filter.

## Expected result
After step 3, only Mediterranean restaurants are shown:
- Every restaurant card in the list, including any that load as you scroll, displays the cuisine
  "Mediterranean".
- At least one card is shown ("Jerusalem Bakery & Grill", which appears as a single card for all
  of its locations).
- Restaurants of other cuisines, for example "Bismillah Cafe", are not shown.

## Actual result
N/A - new coverage.
