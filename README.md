# LeetMemo
---
**A Chrome extension for retaining LeetCode solutions through structured notes and spaced repetition.**

## Overview

Solving a coding problem once does not mean you will remember the solution later.

LeetMemo helps reinforce what you learn on LeetCode by combining problem-specific notes with a spaced-repetition review schedule. Recent accepted submissions are added to your review queue, allowing you to revisit each problem at gradually increasing intervals.

## Features

- View your LeetCode ranking and solved-problem statistics
- Explore a submission activity heatmap for the current year
- Browse your five most recent accepted submissions
- Save notes for individual LeetCode problems
- Automatically schedule recent submissions for review
- Mark reviews as passed or failed
- Open profiles and problems directly on LeetCode
- Switch between light and dark themes
- Store notes, preferences, and review progress locally

## How Spaced Repetition Works

New problems are initially scheduled for review after one day.

When you pass a review, the problem advances through increasingly longer intervals:

```text
1 → 3 → 7 → 14 → 30 → 60 → 120 days
```

## Installation

1. Clone the repo:
   ```
   git clone https://github.com/Thehan05/LeetMemo.git
   ```
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `LeetMemo` folder.
5. The extension icon should appear in your toolbar — click it on any page and hit **Summarize**.


## Usage

### Load your profile

1. Open LeetMemo from the Chrome toolbar.
2. Enter your LeetCode username.
3. Select **Load Profile**.
4. View your statistics, activity, reviews, and recent submissions.

LeetMemo remembers the selected username for future sessions.

### Save problem notes

1. Select a problem under **Recent Submissions**.
2. Write your notes in the editor.
3. Select **Save Notes**.

Useful notes might include:

- The algorithm or problem-solving pattern
- Time and space complexity
- Important edge cases
- Mistakes from the original attempt
- Alternative approaches

### Complete a review

1. Open a problem under **Due For Review**.
2. Attempt the problem again or explain the solution from memory.
3. Mark the review as passed or failed.

A passing result increases the review interval. A failing result schedules the problem again for the following day.

</div>

## Project Structure


```text
LeetMemo/
├── css/                  # Popup layout and component styles
├── icons/                # Chrome extension icons
├── js/
│   ├── api/              # LeetCode GraphQL requests
│   ├── features/         # Profile, heatmap, notes, reviews, and theme
│   ├── services/         # Storage and review scheduling
│   ├── utils/            # Shared formatting utilities
│   └── popup.js          # Extension initialization
├── manifest.json         # Chrome extension manifest
├── popup.html            # Popup interface
└── README.md
```

## ScreenShots
<p align="center">
  <img src="docs/image/dashboard.png" alt="LeetMemo extension dashboard" width="350">
  <img src="docs/image/dashboard_light.png" alt="LeetMemo extension dashboard" width="350">
</p>