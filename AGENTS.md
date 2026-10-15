# CorsairDash: Sovereign Seas — Guidelines, Instances & Modder Rules

## 1. Mission & Overview
**`CorsairDash: Sovereign Seas`** (`corsair-dash`) is a 32-bit / 64-bit maritime goods transport, modular ship loadout, pirate swarm, and sea-monster boss arcade game inspired by `DixieDash`.
- **GitHub Repository**: [https://github.com/ronaldtbriggs-blip/corsair-dash](https://github.com/ronaldtbriggs-blip/corsair-dash)
- **Local Directory**: `C:\Users\gilde\Documents\Corsair-Dash`
- **Production Web Instance (`prod`)**: [https://corsairdash.web.app](https://corsairdash.web.app)
- **Dev / Modding Web Instance (`dev`)**: [https://corsairdash-dev.web.app](https://corsairdash-dev.web.app)

---

## 2. Core Architecture & Conversion from DixieDash
- `index.html` & `style.css`: Golden Age of Sail HUD, **Captain's Royal Charter Ledger & Spyglass Dock** (replacing the Dasher smartphone UI), **Shipyard & Loadout Store Modal (`#loadout-modal`)**, **Wharf Cargo Unloading Modal (`#dropoff-modal`)**, **Sea Shanty Choir Menu (`#menu-modal`)**, and **Universal Modder Holodeck Studio (`#mod-studio-modal`)**.
- `data.js`: Master configuration for the **6 Ship Tiers** (`Coastal Sloop` ➔ `First-Rate Man-o'-War`, 2 to 12 Loadout Slots), **8 Loadout Modules**, **12 2.5D Island Ports**, **4 Legendary Boss Monsters**, **3 Difficulty Modes**, and procedural archipelago hazards.
- `map.js`: 2.5D / 3D perspective ocean renderer (`ArchipelagoMap`) with animated swells, live wind streamlines, spinning whirlpools, razor coral reefs, 3D sea stacks, and bespoke island port architecture.
- `pirates.js`: `PirateAndTradeManager` managing swarming Pirate Cutters, Corsair Brigantines, and Crimson Skull Galleons with difficulty-driven pirate density escalation, plus civilian East India Merchantmen and Royal Navy Patrol Frigates.
- `bosses.js`: `BossMonsterEventManager` managing the 4 Boss Monster events (*The Abyssal Kraken*, *The Flying Dutchman*, *Crimson Jaws Megalodon*, and *Azure Leviathan Serpent*) — players can slay them for 1,000g–1,800g bounties or outrun them for a Daring Escape bonus.
- `audio.js`: Web Audio API **4-Track Sea Shanty Concertina & Crew Choir Synthesizer** + broadside cannon thunder, wood splinters, brass 8-bells contract chimes, and ocean wind soundscape.

---

## 3. Antigravity & Universal Modder Integration
- `agents/antigravity_orchestrator.py`: Multi-agent Google Antigravity SDK Modder Orchestrator (`mod-orchestrator`, `mod-offline-worker`, `mod-game-worker`).
- `agents/ci_runner.py`: Headless GitHub Actions CI & telemetry runner (`npm run mod:audit`).
- `knowledge/games/corsair-dash/architecture-and-modding.md`: Official Universal Modder field note.
