# Searching for a non-existent restaurant shows the empty state, and clearing the search restores the list

- **ID:** TC-SEARCH-002
- **Area:** Search
- **Priority:** Medium
- **Admin required:** No

## Preconditions
The app is running and the homepage lists at least one restaurant.

## Test data
- Search term: `zzzxqqnomatch`

## Steps
1. Go to the homepage.
2. Click the search bar.
3. Type "zzzxqqnomatch".
4. Click the "Clear search" (X) button in the search bar.

## Expected result
- After step 3, no restaurant cards are shown and the "no results" message is displayed.
- After step 4, the search bar is empty, the "no results" message is gone, and restaurant cards are shown again.

## Actual result
N/A - new coverage.
