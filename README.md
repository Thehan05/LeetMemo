# LeetMemo

A Chrome extension for interview prep. Tracks the LeetCode problems you've solved, lets you jot down the approach you used per problem, and schedules spaced-repetition reminders so you re-solve them before interviews.

The goal is interview-day recall: knowing a problem once isn't enough — you need to re-solve it on a schedule so the pattern sticks.

## What it does

- **Profile dashboard** — your LeetCode profile rendered inside the extension popup: solved counts by difficulty, submission heatmap, recent ACs. Same shape as the profile page on leetcode.com.
- **Per-problem notes** — write down your approach (key insight, data structure, edge cases) for any problem you've solved. Stored locally.
- **Spaced-repetition review** — every solved problem enters a review queue. Intervals double-ish (1d → 3d → 7d → 14d → 30d → 60d → 120d). Mark a re-solve as success and the interval grows; fail and it resets.
- **Badge reminder** — the extension's toolbar icon shows a badge with the count of problems due for review today.

## Architecture

**Stack:** vanilla JS, HTML, CSS. No framework, no build step. Manifest V3.

**Where the dashboard lives:** in the toolbar popup (click the extension icon). Not a new-tab override, not injected into leetcode.com.

**How solve detection works:** a background service worker polls LeetCode's public GraphQL endpoint (`https://leetcode.com/graphql`) on a `chrome.alarms` schedule. New AC submissions get added to the review queue. No DOM scraping, no content script.

**How reminders surface:** badge count on the toolbar icon (`chrome.action.setBadgeText`). No desktop notifications.

**Storage:** `chrome.storage.local`. Holds username, review queue, per-problem notes, and a cache of the last poll's profile data.

### Data flow

```
                ┌──────────────────────┐
                │  leetcode.com/graphql │
                └──────────┬───────────┘
                           │ fetch (GraphQL POST)
                           ▼
┌──────────────────────────────────────────────┐
│        background service worker             │
│  - chrome.alarms (poll every N min)           │
│  - diff recent ACs vs stored reviews          │
│  - update chrome.storage.local                │
│  - chrome.action.setBadgeText (due count)     │
└──────────┬──────────────────────────┬─────────┘
           │ read                     │ read
           ▼                          ▼
   ┌───────────────┐           ┌──────────────┐
   │ popup (UI)    │           │ chrome.storage│
   │  - dashboard  │◄──────────┤   .local      │
   │  - notes      │  write    │               │
   │  - review     ├──────────►│               │
   └───────────────┘           └──────────────┘
```

## File structure (planned)

```
LeetMemo/
├── manifest.json              # MV3 declaration
├── popup.html                 # dashboard UI
├── popup.js                   # dashboard logic
├── popup.css                  # styles
├── src/
│   ├── background/
│   │   └── service-worker.js  # poller + badge updater
│   └── lib/
│       ├── leetcode.js        # GraphQL client
│       ├── storage.js         # chrome.storage wrappers
│       └── scheduler.js       # spaced-repetition intervals
└── README.md
```

## LeetCode GraphQL queries used

Endpoint: `POST https://leetcode.com/graphql`, JSON body `{ query, variables }`.

**Profile + solved counts:**
```graphql
query userProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile { ranking userAvatar realName }
    submitStatsGlobal { acSubmissionNum { difficulty count } }
  }
  allQuestionsCount { difficulty count }
}
```

**Recent accepted submissions** (drives both the "Recent AC" list and the review queue):
```graphql
query recentAcSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    id title titleSlug timestamp
  }
}
```

**Submission heatmap:**
```graphql
query userProfileCalendar($username: String!, $year: Int) {
  matchedUser(username: $username) {
    userCalendar(year: $year) {
      activeYears streak totalActiveDays submissionCalendar
    }
  }
}
```
`submissionCalendar` comes back as a JSON-encoded string of `{ "<unix_ts>": count }`.

## Spaced-repetition rules

- New solve → first review in **1 day**.
- Successful review → advance to next interval: 1, 3, 7, 14, 30, 60, 120 days.
- Failed review → reset to **1 day**.
- "Due" = `nextDueAt <= now`. Due count drives the badge.

## Running locally

1. Open `chrome://extensions`.
2. Toggle **Developer mode** (top right).
3. Click **Load unpacked** and pick the `LeetMemo` folder.
4. Pin the extension to the toolbar (puzzle icon → pin).
5. Click the icon to open the popup.

After editing files, hit the **reload** icon on the extension card. The popup re-reads files automatically; manifest/service-worker changes require the reload.

To debug: right-click the popup → **Inspect** for popup DevTools. For the service worker, open `chrome://extensions`, find LeetMemo, and click "service worker" link.

## Status

In progress.

- [x] Manifest + empty popup loading
- [ ] Fetch + render profile data in popup
- [ ] Submission heatmap
- [ ] Recent AC list
- [ ] Per-problem notes UI
- [ ] Spaced-repetition queue + review UI
- [ ] Background poller + badge count
