# Leaderboard Redesign TODO

## Current Work
Redesigning the leaderboard to match the provided mockup: Replace table with card-based div layout, gradient header, rounded rows, purple back button, updated description. Ensure dark mode compatibility.

## Key Technical Concepts
- JavaScript: Dynamic HTML injection into #app using localStorage scores.
- CSS: Flexbox for layout, gradients, shadows, transitions for hover/animations. Dark mode via .dark class.
- No new dependencies; uses existing Poppins font, theme colors (teal #008080, coral #FF7F50, purple #9370DB).

## Relevant Files and Code
- public/js/leaderboard.js
  - renderLeaderboard(): Generates table HTML; will update to divs with .leaderboard-header and .leaderboard-row.
  - Existing: Sorts top 10 by totalScore, medals for top 3.
- public/css/style.css
  - .leaderboard: Container styles.
  - .leaderboard-table: Existing table styles to deprecate/remove.
  - New: .leaderboard-header, .leaderboard-row, .rank-item, .username-item, .stat-item.
  - Update: .back-btn to purple gradient.
  - Dark mode overrides.

## Problem Solving
- Current table is rigid; switching to flex divs allows rounded cards and better mockup match.
- Maintain data integrity (wins, losses, totalScore).
- Remove tfoot total sum (not in mockup).
- Ensure responsiveness: Flex wraps on mobile.

## Pending Tasks and Next Steps
- [ ] Edit public/js/leaderboard.js: Update renderLeaderboard to use divs instead of table. Replace the innerHTML table with .leaderboard-header div, .leaderboard-rows container, and .leaderboard-row divs for each player. Update description text to match mockup. Keep medals and onclick for back.
  - "The leaderboard highlights the top players, ranked from first to tenth, with a stylish display of their username, victories, defeats, and total score."
- [ ] Edit public/css/style.css: Add styles for new elements (.leaderboard-header: gradient flex row, white bold text; .leaderboard-row: white rounded card, flex, hover effect; item classes for alignment). Update .back-btn to purple. Add dark mode styles. Remove old .leaderboard-table related styles to avoid conflicts.
- [ ] Test: Use browser_action to launch index.html, click leaderboard link, verify layout (gradient header, card rows, alignments, purple back). Toggle dark mode, check adaptations. Interact (hover rows), check console.
- [ ] If issues: Iterate edits based on screenshot/logs.
- [ ] Update TODO.md after each step.
- [ ] Attempt completion once verified.
