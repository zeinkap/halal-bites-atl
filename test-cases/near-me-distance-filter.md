# Near Me search shows only restaurants within the selected distance (3, 5, 10 mi)

- **ID:** TC-SEARCH-003
- **Area:** Search
- **Priority:** High
- **Admin required:** No

## Preconditions
- Visitor (not logged in) on the home page.
- The test database holds 121 restaurants, all shown when no filter is applied.
- The browser location is set to a fixed test location and location permission is granted (the original recording used a real location).
- The Distance selector starts at "5 mi" and no distance chip is shown.

## Test data
- Distance options: 3 mi, 5 mi, 10 mi.
- Browser location: stubbed geolocation at Midtown Atlanta (latitude 33.7490, longitude -84.3880).

## Steps
1. Open the home page and note the restaurant count (121 restaurants).
2. Click the "Near Me" button.
3. In the "Use your location?" dialog, click "Use my location".
4. Wait for the results to load and note the "Within 5 mi" chip and the restaurant count.
5. Open the Distance selector and choose "3 mi".
6. Click the "Near Me" button.
7. In the "Use your location?" dialog, click "Use my location".
8. Wait for the results to load and note the "Within 3 mi" chip and the restaurant count.
9. Open the Distance selector and choose "10 mi".
10. Click the "Near Me" button.
11. In the "Use your location?" dialog, click "Use my location".
12. Wait for the results to load and note the "Within 10 mi" chip and the restaurant count.
13. Click the X on the distance chip ("Clear Near Me").

## Expected result
- After steps 4, 8 and 12, the chip shows the selected distance ("Within 5 mi", "Within 3 mi", "Within 10 mi") and only restaurants within that distance of the test location are listed.
- The count is smaller than the unfiltered 121 for each distance. The count is highest at 10 mi, lower at 5 mi, and lowest at 3 mi (3 mi < 5 mi < 10 mi), and the 3 mi results are a subset of the 5 mi results, which are a subset of the 10 mi results.
- Exact counts are not asserted.
- After step 13, the chip disappears and all 121 restaurants are shown again, regardless of distance.

## Actual result
N/A - new coverage
