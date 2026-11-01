# MEDUSA — Reward League (3D edition)

An interactive 3D reinforcement-learning football playground inspired by **Medusa Soccer Game**: https://www.youtube.com/watch?v=TYvKeIguj8o. This is a new implementation with locally bundled Three.js 0.180.0 and GSAP 3.13.0, an animated eight-tentacle character, eight arenas, and Twitch audience coaching. The original café experiment remains at `/classic/index.html`.

## Run the 3D game

Node.js 24+ is required (the local shared-room preview uses built-in SQLite). From this folder:

```sh
npm ci
npm run build
npm run dev
```

Open **http://localhost:4173/**. Choose an arena, click **Train Medusa**, and watch the trained match. **Watch rookie** replays seeded random actions for comparison. **Play yourself** supports WASD, arrow keys, Space to wait, and touch buttons. Drag the scene to orbit, scroll to zoom, or select isometric/overhead/follow camera views. Sound is opt-in. The game pauses rendering in hidden tabs and caps the device pixel ratio at 1.5; stationary scenes render on changes. Reduced-motion settings disable entrance animations.

## League Night: all eight arenas

**Streamer Derby:** host creates a four-hour room and privately shares the invitation with one co-streamer, who joins as Coral. Each streamer authorizes their own Twitch connection on their own device. The Mint channel routes coaching to Mint; the Coral channel routes coaching to Coral. Guest captains can select their team recipe and propose the shared intervention. The host locks recipes, training and match timing. A 750 ms heartbeat carries snapshots and bounded guest inputs across browsers; this is host-authoritative friendly play, not a competitive anti-cheat service. The host controller must stay open and foregrounded during the match. Viewer keys from the guest channel are salted hashes; Twitch access tokens never leave their originating browser. Invitations are one-use, and guests cannot publish match state or read the host's input event log. Room credentials live in tab sessionStorage, expire after four hours and are separate from Twitch authorization.

The site remains owner-private. A co-streamer must already have site access; an invitation does not bypass Sites access controls. Localhost rooms use a separate SQLite database under ignored .openai/local/; production rooms use the managed D1 binding DB. No third-party signaling service or extra account is required. The hosted room only relays game state and coaching; it does not carry streamer voice/video.

**Temptation Round:** enable the ballot before starting a showdown. Each viewer chooses !tempt helpful or !tempt tempting; one latest choice per viewer, ties favor helpful. A nonempty team ballot selects the goal-getter or touch-collector recipe when training locks. Empty ballots preserve the host/chat recipe. During a repair round the ballot does not override the two-change budget. Predict behavior with !learn mint score, !learn coral loophole or !learn coral struggle. Predictions close at kickoff. The actual result is classified after 120 moves: score means reaching the arena target; loophole means zero goals with at least 40 touches; struggle covers other outcomes. The reveal reports correct aggregate predictions, without invented audience counts.

**Captain’s Dilemma:** the host locks one intervention for both teams. Trust the world preserves natural rules; Crosscurrent surge replaces natural drift with an observable rotating crosswind, including in the four original arenas; Eye of the storm disables hazards, sentinel and natural drift while keeping walls and portal windows. Both teams retrain from fresh tables under the same variant. Rematches retain the intervention and kickoff so reward repairs are comparable. The co-streamer's proposal is advisory until accepted by the host.

A clearly labeled Local rehearsal panel sends simulated chat inputs for testing without Twitch viewers. Rehearsal results are labeled and exported as rehearsal; they are not evidence of live Twitch activity. All 24 arena/intervention combinations are covered by automated training and equal-policy fairness checks. Two-browser local rehearsal verified a shared rift round, Coral's temptation ballot, a guest captain proposal and identical host/guest score and behavior reveal. Two real Twitch accounts remain a required live rehearsal before recording.

## Coach Clash: the audience game show

**Start a chat showdown** opens a 30-second coaching window for Team Mint and Team Coral. Viewers join with `!team mint` or `!team coral`, then use the existing `!reward goal 10`, `!reward touch 0`, `!reward progress 0.5`, and `!reward safety 2` commands to coach their own team. One viewer has one latest reward vote per window. Switching teams removes the viewer's old vote. Each reward component uses its plurality value, with lower-value tie breaking. The host can also select explicit example recipes for each team.

Both teams train fresh Q-tables with seed 42 and 10,000 episodes. After training, a seeded kickoff card reveals the shared starting position and world phase. These are conditions within the training state distribution, not a claim of unseen-environment transfer. A 3–2–1 countdown starts a 120-move **ghost race** with two colored creatures and separate balls attacking opposite goals: Mint scores at the right mint goal; Coral scores at the left coral goal. Coral’s entire course is reflected horizontally, including its spawn, obstacles, environmental forces, portals and sentinel. Team-colored geometry indicates which independent course affects each ball. The renderer mirrors canonical coordinates without changing policy rewards or statistics. The two ball simulations do not physically interfere with each other. A separate 3D locomotion controller makes the creatures sidestep when their paths meet, with a 1.35-unit head/body personal-space guard and arena-edge clamping. It steers the rendered creatures, not the learned ball routes or scoring; this is local avoidance, not learned multi-agent collision behavior. Resets are aligned to logical moves; both teams receive exactly 120 actions, regardless of how many possessions they finish.

The winner has more goals; fewer blocked moves/possession losses break goal ties. Reward totals are never compared between different reward recipes. Identical policies under identical conditions can draw. Viewers can call a winner using `!predict mint` or `!predict coral` before kickoff; predictions are locked during play and reported as aggregate results. Predictions have no money or prizes attached. Team membership and predictions stay in memory; the round export includes aggregate counts, not viewer identities.

After the result, **Rematch · only 2 rule changes** allows at most two changed reward components per team. Changes with more viewer support take priority; ties use the fixed order goal, touch, progress, safety. The same kickoff card is retained to make the repair comparison meaningful. **Fresh round** starts a new coaching window and reveals a new seeded kickoff. Session wins are local to the open controller tab.

**Try a local demo** is explicitly labeled as an example, with no simulated audience counts: Mint uses the goal-getter recipe, Coral uses touch-collector rewards. It trains real policies and produces actual results. The changing kickoff card means its score can vary. The local vote model, round flow, ghost renderer, winner reveal and repair budget have automated/browser coverage; live Twitch team commands still need a connected-channel check after deployment.

The existing same-profile Stream view also receives Coach Clash frames through a separate BroadcastChannel. An active overlay requests logical updates so the controller does not depend solely on its own animation frames. Keep one controller tab open for the origin; the overlay requires that controller and the same browser profile. The separate Streamer Derby room layer provides remote host/co-streamer synchronization. Stream view itself remains a same-profile overlay. The original solo lab and its saved policies remain available through **Return to solo lab**. Switching arenas cancels an active showdown.

## Eight-world voyage

| Arena | Gameplay | Target goals / 120 moves | Balanced trained goals, seed 42 | Random-play mean, 5 seeds |
|---|---|---:|---:|---:|
| First Contact | Open field | 8 | 17 | 0.4 |
| Coral Run | A coral wall forces a detour | 5 | 9 | 0.0 |
| Against the Tide | Walls, possession-reset vents, eastbound slipstreams | 5 | 10 | 0.0 |
| The Last Light | A moving sentinel; keeper phase is observable | 7 | 16 | 0.2 |
| Gravshift Station | Rotating gravity; drift on alternating moves | 5 | 15 | 0.4 |
| Solar Sail | Solar wind reverses east/west halfway through its cycle | 5 | 14 | 0.2 |
| Through the Rift | Two timed wormholes and an orbiting asteroid | 4 | 14 | 0.2 |
| Hadal Garden | Reversing tides and thermal vents dangerous only while lit | 4 | 11 | 0.0 |

The four expedition worlds use an observable eight-move environmental cycle, shown in the arena HUD. Forces, wormhole openings, asteroid position and vent activity affect the actual simulator. Space to wait can change the phase before crossing a dangerous lane. Coach Clash uses the same conditions for both teams in all eight worlds. These are discrete tactical forces, not continuous Newtonian gravity or spacecraft dynamics.

Each world has procedural scenery: a rotating orbital gyroscope and satellites, ringed planets and a passing spacecraft, an animated stellar rift, or a seabed with kelp, fish, shipwreck ribs and light shafts. Distant stars use a point cloud; fish use instanced geometry. These decorative objects do not change the agent's observation or collide with it.

These measurements are from the small, deterministic tactical simulator, not physical-world or continuous-physics performance. All arenas are available to explore; clearing targets earns persistent stars. Policies and stars save locally per browser. A new device or origin has separate progress. **Download experiment** exports the active Q-table, reward recipe, learning history, arena configuration and evaluation results.

## The RL is real; the physics is visual

The learner observes the ball's grid position and the world phase in dynamic arenas. It chooses north, east, south, west, or wait. Medusa maintains possession while dribbling; Three.js/GSAP interpolates these discrete decisions into 3D character/ball movement. This is not a learned muscle controller or a full continuous-physics soccer simulation. Goal and hazard events end a training possession. During a 120-move evaluation match, possession restarts and counters accumulate; resets do not consume a move. The environmental clock continues across resets.

Q-learning uses learning rate 0.2, discount 0.95, 10,000 episodes, maximum 70 sampled steps per episode, and epsilon decreasing from 0.95 to 0.045. Thirty percent of training episodes start at another valid grid position. Goal/hazard transitions bootstrap zero; time-limit truncations bootstrap the next state. Each training run uses a fresh Q-table and seed 42. The balanced reward is goal +10, touch +0, progress +0.5, safety penalty 2; every move costs 0.08. Progress uses potential-based shaping with potential equal to negative Manhattan goal distance and terminal potential zero. Blocked moves cost 0.4 times safety; lost possession costs safety plus 1.

**Beautiful chaos** sets goal +1, touch +3, progress 0, safety 0. Across the original four arenas, seed 42 learns 120 touches and zero goals: a visible reward-hacking example, not a scripted action sequence. Compare it to the goal-getter recipe, whose learned policies actually score.

Evaluation freezes learning. Rookie baselines use random seeds 17, 42, 93, 123 and 321; trained actions are deterministic and greedy on the same arena, spawn and recipe. Training history contains measured evaluations at real checkpoints. Neither these measurements nor the learning curve claim transfer to unseen arenas.

## Twitch coaching in the 3D edition

Keep using your existing Twitch public Client ID and channel. The deployed root callback URL stays unchanged. Authorize via **Connect Twitch**, open a 30-second vote, then send one of:

```text
!reward goal 10
!reward touch 0
!reward progress 0.5
!reward safety 2
```

Ranges: goal 0–15, touch 0–4, progress 0–2, safety 0–5. Each viewer's latest command replaces their earlier vote for the window. Each component chooses its most popular value, with lower-value tie breaking; unvoted components stay as configured. Votes update the recipe; the streamer clicks Train Medusa. **Test a local vote** is explicitly a simulated input, not evidence of a Twitch connection.

EventSub/OAuth implementation is retained from the café. User screenshots during café testing showed an applied vote; the 3D command path has been locally tested, but end-to-end live Twitch authorization/chat should be checked again after the update. Tokens remain memory-only. Original café commands (`pickup`, `delivery`, `movement`) work only in Classic Café. The website never posts to Twitch chat.

## Stream view

Open `?overlay=1` in another tab in the same browser profile. BroadcastChannel synchronizes the active arena and match frames without transmitting credentials. OBS Window Capture can capture that tab. An isolated OBS Browser Source or another device does not share this local session and will not synchronize automatically.

## GitHub and Render deployment

The repository contains the full game, procedural assets, bundled libraries, both runtime adapters, migrations, and tests. No Twitch client secret is required. Keep .env files, SQLite databases and local room credentials out of Git.

Render uses the Node.js 24 server rather than the Cloudflare Worker. The same room API runs through the SQLite adapter; game and RL code are shared.

1. Push this source folder to a GitHub repository.
2. In Render, create a Blueprint from that repository using render.yaml for the free demonstration service. This plan loses active rooms when its ephemeral filesystem is reset. Review render-persistent.yaml if you want the paid Starter service with a 1 GB disk; select that Blueprint path before deployment and review Render's displayed charge. The SQLite deployment uses one instance.
3. Render runs npm ci && npm run build, then npm start. It supplies PORT and RENDER_EXTERNAL_URL; the blueprint sets HOST to 0.0.0.0 and selects DB_PATH. The health endpoint is /healthz. The server creates the database schema on first startup.
4. Add the exact deployed origin (including the trailing slash shown in Connect Twitch) to the Twitch application's OAuth Redirect URLs. Each streamer then authorizes their own connection. Register localhost separately when testing locally.
5. Create a room, join from another browser, send votes through two real Twitch accounts, train and compare results before recording the demo. Rooms and policies from the existing Sites deployment do not transfer to the new origin.

Environment variables: PORT and HOST control the listener; DB_PATH selects the SQLite file; PUBLIC_ORIGIN overrides the canonical origin for a custom domain. Otherwise Render's automatic RENDER_EXTERNAL_URL is used. The local development defaults stay at http://localhost:4173/ with an ignored database under .openai/local/.

Deployment is not complete until a GitHub repository URL and a successful Render deployment have been verified. No secrets or credentials belong in render.yaml.

## Hosted build and room schema

The site now uses a Worker, preserving the existing URL and audience. npm run build bundles vendor files and produces dist/server/index.js with the shared-room API and embedded static assets. The Sites manifest binds DB; drizzle/0000_derby_rooms.sql is a schema-only migration, applied by hosting before publication. The local Node server applies the initial schema only when creating its development database. Do not copy local databases, invitations or room credentials into the repository.

## Checks and assets

```sh
npm test
```

Tests cover all eight arenas at three training seeds, improvement over random play, reward-hacking behaviour, walls/hazards/keeper phase, deterministic frozen policies, bounded vote parsing, and the archived café. Three.js and GSAP are pinned in package-lock.json and bundled into `dist/vendor` by the build script, with their attribution. No 3D models are downloaded: arena, creature, tentacles, lighting, ball, and particles are procedural geometry. Google Fonts supply optional web fonts with system fallbacks. Three.js/GSAP library network access is not required at runtime.

---

## Original café documentation (archived version)

# Chat, You Raised This

A Twitch audience game show about reinforcement learning and unintended incentives. Viewers choose the reward recipe for a café robot; the robot learns a policy, exploits bad incentives, and gets retrained when the audience changes its recipe.

## Run

Requires Node.js 20+; no package installation or API keys are needed for the local playground.

```sh
npm run dev
```

Open **http://localhost:4173/**. The browser trains the initial policy automatically in a module Web Worker. Try **Try a better reward recipe**, then **Compare policies**. Use **Test a different starting position** to evaluate both policies on the same start. Training is local to the browser; leave the main game tab open during a stream.

```sh
npm test
```

The tests check that learned policies exploit the original reward and deliver drinks under repaired rewards across three independent seeds, deterministic frozen evaluations, and vote parsing/tie handling.

## The actual reinforcement learning

- State: 7 × 5 grid position and whether the robot carries a cup (70 states).
- Actions: four movement directions, interact, wait.
- Algorithm: tabular Q-learning; learning rate 0.18, discount 0.94.
- Exploration: epsilon declines from 0.9 to 0.07 across 6,000 episodes, seed 42.
- Episodes are 90-step samples of a continuing task. The sampling limit is a truncation, so Q targets bootstrap at the boundary.
- Every action costs 0.06. Pickup, successful delivery, and actual movement each add their configured reward.
- Interacting at the dispenser picks up a cup or puts it back. Interacting at the delivery table while carrying a cup serves a customer. Cups and customers are inexhaustible.
- Original incentives: pickup +3, delivery +1, movement +0. Repair recipe: pickup +0, delivery +8, movement +0.
- Every training run starts a fresh Q-table with the same seed. Comparisons are reward interventions, not continued fine-tuning.
- Replays use a frozen greedy policy. Metrics average five identical starting positions per policy. These positions are within the training state distribution; this is not a claim of unseen-map generalization.
- Download experiment exports both Q-tables, rewards, training history and metrics for reproduction. Non-secret policy snapshots persist in browser localStorage.

The loophole is learned by maximizing rewards; no action sequence is scripted. The environment deliberately permits repeated pickups, making reward design the audience's game mechanic.

## Connect Twitch

1. Register an application at https://dev.twitch.tv/console/apps. Use a **public** client appropriate for the implicit OAuth flow; no client secret is used here.
2. Register the exact redirect URL displayed by **Connect Twitch**, including the trailing slash if shown. For local development this is `http://localhost:4173/`. Add the deployed origin's displayed URL when using hosting.
3. Enter the public Client ID and channel login in the game, then authorize read-only `user:read:chat` access.
4. Open a 30-second vote from the game. Viewers send `!reward pickup 0`, `!reward delivery 8`, or `!reward movement 0`.
5. Each viewer has one latest vote across the window. Each reward component uses its most popular value; ties use the lower value. Unvoted components keep their existing setting. The streamer then starts training.

Integration uses Twitch EventSub WebSockets and `channel.chat.message` version 1. It validates tokens on connection and hourly, subscribes on session welcome, deduplicates notifications, handles server-directed reconnects, and resubscribes after a dropped connection. It never posts messages to Twitch. OAuth uses a random, session-bound CSRF state; access tokens are removed from the URL immediately and kept only in memory. Reloading requires reconnecting. Non-secret Client ID/channel settings remain in sessionStorage.

Official references:
- https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#implicit-grant-flow
- https://dev.twitch.tv/docs/eventsub/handling-websocket-events/
- https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelchatmessage

**Live OAuth/EventSub has not been verified with a registered Twitch application in this build.** Run the live checklist below before recording a hackathon demo.

## OBS

Open **OBS view** (`?overlay=1`) on the same origin. A second tab in the same browser profile synchronizes policy changes through BroadcastChannel. OBS Browser Source normally uses an isolated profile, so it will not automatically share a controller tab's state. For this version, use OBS Window Capture on the overlay tab. The 3D edition has a separate Streamer Derby room layer; Classic Café has no remote synchronization.

## Live verification checklist

- Authorize with your Twitch application and confirm the channel-connected indicator.
- Open voting, send commands from two viewer accounts, replace one account's vote, and verify the resulting recipe.
- Train the voted recipe and compare frozen policies.
- Disconnect and verify new messages no longer affect voting.
- Test the overlay in a second same-profile tab, then capture it in OBS.
- Record the actual Twitch stream; the local vote tester is labeled and is not proof of a live integration.

## Hackathon preparation

Before submission: verify current official requirements; prepare repository/run instructions, the working-on-Twitch demo video, a project description explaining how Codex was used, and the session ID of the main build chat. This project has not been submitted to Devpost.

## Current scope

One map, one robot, three reward controls, Twitch voting integration, frozen policy comparison, experiment export, responsive browser UI, and a same-profile OBS view. No accounts, paid APIs, GPU requirements, or multiplayer server.
