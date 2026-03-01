# Tic-Tac-Toe Game Logic Updates

## Task: Modify game rules for question-answer flow

### Changes Required:

1. [x] Add state variable `hasEarnedRightToPlace` to track if player earned right to place after first correct answer
2. [ ] Modify `skipQuestion()` - Apply penalty (-5 points), switch player, NO symbol placed
3. [ ] Modify `submitAnswer()` - On correct: +10 points, set state "earned right to place", ask another question instead of placing
4. [ ] Modify `continueWrong()` - On wrong answer: no symbol placed, just switch player
5. [ ] Add logic to place symbol only when player has earned the right

### Implementation Details:

- **Skip**: Apply penalty, increment question index, switch player, NO move placed
- **First Correct Answer**: +10 points, `hasEarnedRightToPlace = true`, show next question
- **Second Correct Answer**: Place symbol on board, reset `hasEarnedRightToPlace = false`
- **First Wrong Answer**: No symbol placed, switch player

### Files to Edit:
- js/app.js
