---
title: "CorsairDash: Sovereign Seas — Architecture, Conversion from DixieDash & Modding Playbook"
game: "CorsairDash: Sovereign Seas"
engine: "Custom HTML5 2.5D/3D Canvas Maritime Engine (ES6 + Web Audio Synthesizer)"
repos:
  - "https://github.com/ronaldtbriggs-blip/corsair-dash"
  - "https://github.com/ronaldtbriggs-blip/universal-modder"
instances:
  prod: "https://corsairdash.web.app"
  dev: "https://corsairdash-dev.web.app"
---

# CorsairDash: Sovereign Seas — Universal Modder Field Note

## 1. Conversion from `DixieDash` to the Golden Age of Sail
`CorsairDash: Sovereign Seas` takes the high-energy arcade delivery loop of `DixieDash` and transforms every system into an authentic maritime trading, ship-building, pirate-evasion, and sea-monster hunting experience:

| DixieDash Component | CorsairDash Conversion | Dropped / Replaced |
| :--- | :--- | :--- |
| **Dasher 5G Smartphone App** | **Captain's Royal Charter Ledger & Brass Spyglass** (`#phone-dock`) with Carrier Pigeon contract dispatches & brass 8-bell chimes | Dropped cellular UI & modern ratings |
| **St. George Asphalt Roads & Houses** | **8,400x8,400 Pelagic Ocean & 12 2.5D Extruded Island Ports** (`map.js`) with lagoons, wharves, wind streamlines, whirlpools, coral reefs & sea stacks | Dropped desert streets, traffic lanes, and suburban houses |
| **Single Delivery Car** | **6 Progressive Vessel Tiers** (`Coastal Sloop` ➔ `Topsail Schooner` ➔ `Corsair Brigantine` ➔ `East India Fluyt` ➔ `Royal Frigate` ➔ `First-Rate Man-o'-War`) | Added multi-mast scaling & Shipyard drydock |
| **No Vehicle Loadout** | **Modular Shipwright Loadout Store (`#loadout-modal`)**: 2 to 12 slots per ship tier, 8 stackable modules (`Cargo Hold`, `Broadside Cannons`, `Swivel Culverins`, `Iron Hull`, `Silk Sails`, `Copper Keel`, `Carpenter Crew`, `Greek Fire Barrels`) | Creates pure Smuggler Runner (0 gun modules = +12% Speed & +25% Payout) vs Armed Privateer trade-offs |
| **SunRiver Civilian Traffic (`traffic.js`)** | **Swarming Pirate Raiders & Merchant/Royal Navy Trade Vessels (`pirates.js`)** with difficulty-driven pirate density escalation & floating plunder chests | Pirates actively flank, lead-shoot cannonballs, and skirmish with Royal Navy patrols |
| **St. George Marathon (`marathon.js`)** | **4 Legendary Boss Monsters (`bosses.js`)**: *The Abyssal Kraken*, *The Flying Dutchman*, *Crimson Jaws Megalodon*, and *Azure Leviathan Serpent* | Can be slain for 1,000g–1,800g bounties OR outrun for a Daring Escape bonus |
| **32-Bit Synthwave Radio (`audio.js`)** | **4-Track Sea Shanty Concertina & Crew Choir (`audio.js`)** (*Drunken Sailor's Reel*, *Wellerman's Doubloon Jig*, *Leave Her, Johnny*, *Spanish Ladies Hornpipe*) | Multi-voice accordion reed synthesis + deck-stomp percussion |
| **Outward Screen Door Photo Modal** | **Harbor Wharf Crane Unload vs High-Speed Surf Jettison Modal (`#dropoff-modal`)** | Risk/reward cargo unloading at island piers |

## 2. How to Mod CorsairDash
1. **Add a New Ship Tier or Rebalance Loadout Slots**: Edit `window.CORSAIR_DATA.shipTiers` or `window.CORSAIR_DATA.loadoutModules` in `data.js`.
2. **Add a New Boss Monster**: Append a boss entry to `window.CORSAIR_DATA.bossMonsters` in `data.js` and add its attack/render branch in `bosses.js`.
3. **Use the In-Game Universal Modder Holodeck Studio**: Click `🛠️ MODS` in the top HUD to live-spawn Boss Monsters, grant test Gold, unlock the Tier 6 Man-o'-War, or export a `.json` modpack.
4. **Verify & Deploy**:
   - `node -c data.js && node -c game.js`
   - `npm run mod:audit`
   - `npm run deploy:dev` (`https://corsairdash-dev.web.app`)
   - `npm run deploy:prod` (`https://corsairdash.web.app`)
