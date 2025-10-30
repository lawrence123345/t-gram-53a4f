# Online PvP System Implementation

## Completed Tasks
- [x] Create firebase.js for reusable Firestore db export
- [x] Create online-achievements.js for Firestore-based online achievements
- [x] Create online-pvp.js for matchmaking, real-time sync, gameplay, and chat
- [x] Modify app.js to add startOnlinePvP function with offline check and status UI
- [x] Update index.html to ensure Online PvP button calls startOnlinePvP
- [x] Update firestore.rules for rooms and scores permissions
- [x] Add matchmaking timeout (30 seconds) to prevent indefinite waiting
- [x] Load questions before matchmaking to ensure smooth gameplay
- [x] Improve cleanup functions to clear timeouts and prevent memory leaks

## Testing Tasks
- [ ] Test Online PvP: Matchmaking, real-time sync, end match, achievements
- [ ] Test Offline Prevention: Alert when offline
- [ ] Verify Firebase integration: Rooms creation/joining, score uploads, achievement updates
