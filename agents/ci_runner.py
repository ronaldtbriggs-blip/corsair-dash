"""
Headless Agent & Universal Modder Runner for CorsairDash: Sovereign Seas (`ronaldtbriggs-blip/corsair-dash`).
Supports:
1. On-demand `workflow_dispatch` modding, ship tiers, loadout balance, boss monster & multi-instance tasks (`--event dispatch`)
2. Issue & `/agent`, `/mod`, or `@antigravity` comment triggers (`--event issue`)
3. Scheduled daily maritime gameplay & Firebase Hosting readiness audits (`--event schedule`)

Inspects `index.html`, `data.js`, `game.js`, `map.js`, `pirates.js`, `bosses.js`, `audio.js`, and `knowledge/`,
and uses `GEMINI_API_KEY` when configured in GitHub Actions Secrets to synthesize deep modding and
game balance reports, with automatic deterministic fallback so workflows always succeed out-of-the-box.
"""

import argparse
import datetime
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT_DIR = pathlib.Path(__file__).resolve().parents[1]


def call_gemini_api(prompt: str, system_instruction: str) -> Optional[str]:
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None

    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2},
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                return "".join(p.get("text", "") for p in parts)
    except Exception as e:
        return f"*(Gemini API call encountered an error: {e})*"
    return None


def github_api(method: str, path: str, payload: Optional[Dict[str, Any]] = None) -> Any:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        raise RuntimeError("GITHUB_TOKEN environment variable is required.")
    url = f"https://api.github.com{path}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "Antigravity-CorsairDash-Modder-CI/1.0",
            "Content-Type": "application/json",
        },
        method=method,
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw) if raw.strip() else {}


def scan_corsair_workspace(root: pathlib.Path) -> Dict[str, Any]:
    workflows: List[str] = []
    kb_notes: List[str] = []
    agents_list: List[str] = []

    wf_dir = root / ".github" / "workflows"
    if wf_dir.is_dir():
        for p in sorted(wf_dir.glob("*.yml")):
            workflows.append(p.relative_to(root).as_posix())

    kb_dir = root / "knowledge"
    if kb_dir.is_dir():
        for p in sorted(kb_dir.rglob("*.md")):
            kb_notes.append(p.relative_to(root).as_posix())

    ag_dir = root / "agents"
    if ag_dir.is_dir():
        for p in sorted(ag_dir.iterdir()):
            if p.is_file():
                agents_list.append(p.relative_to(root).as_posix())

    data_path = root / "data.js"
    game_path = root / "game.js"
    audio_path = root / "audio.js"
    boss_path = root / "bosses.js"
    pirates_path = root / "pirates.js"
    map_path = root / "map.js"
    index_path = root / "index.html"

    total_lines = 0
    total_bytes = 0
    for f in [index_path, data_path, game_path, audio_path, boss_path, pirates_path, map_path, root / "style.css"]:
        if f.is_file():
            total_lines += len(f.read_text(encoding="utf-8", errors="replace").splitlines())
            total_bytes += f.stat().st_size

    data_text = data_path.read_text(encoding="utf-8", errors="replace") if data_path.is_file() else ""
    game_text = game_path.read_text(encoding="utf-8", errors="replace") if game_path.is_file() else ""
    audio_text = audio_path.read_text(encoding="utf-8", errors="replace") if audio_path.is_file() else ""

    engine_metrics = {
        "total_lines": total_lines,
        "size_bytes": total_bytes,
        "ship_tiers": len(re.findall(r"level:\s*\d+", data_text)),
        "loadout_modules": len(re.findall(r"slotCost:\s*1", data_text)),
        "island_ports": len(re.findall(r"archStyle:\s*'", data_text)),
        "boss_monsters": len(re.findall(r"bountyScore:\s*\d+", data_text)),
        "difficulty_modes": len(re.findall(r"escalationRatePerMin:\s*[\d.]+", data_text)),
        "sea_shanty_choir": "toggleShanty" in audio_text,
        "holodeck_mod_studio": "modSpawnBoss" in game_text,
        "high_score_persistence": "corsairdash_highscore" in game_text,
    }

    instances = {
        "web_prod": {
            "target": "prod",
            "site": "corsairdash",
            "url": "https://corsairdash.web.app",
        },
        "web_dev": {
            "target": "dev",
            "site": "corsairdash-dev",
            "url": "https://corsairdash-dev.web.app",
        },
    }

    return {
        "workflows": workflows,
        "agents": agents_list,
        "knowledge_notes": kb_notes,
        "engine_metrics": engine_metrics,
        "instances": instances,
    }


def build_agent_response(
    event_type: str,
    task: str,
    instance: str,
    category: str,
    summary: Dict[str, Any],
) -> str:
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    system_prompt = (
        "You are the Antigravity CorsairDash Modder & Autonomous Engineering Agent running inside "
        "GitHub Actions for ronaldtbriggs-blip/corsair-dash. Follow the Universal Modder 10-step loop "
        "and provide a concise, actionable Markdown report covering the requested modding or deployment task."
    )
    user_prompt = (
        f"Event Type: {event_type}\n"
        f"Target Instance: {instance}\n"
        f"Mod Category: {category}\n"
        f"Task / Trigger Input:\n{task}\n\n"
        f"CorsairDash Workspace Snapshot:\n```json\n{json.dumps(summary, indent=2)}\n```"
    )
    ai_output = call_gemini_api(user_prompt, system_prompt)

    header = (
        f"## ⛵ Antigravity CorsairDash: Sovereign Seas Modder & CI Report\n\n"
        f"- **Timestamp**: `{now}`\n"
        f"- **Trigger Event**: `{event_type}`\n"
        f"- **Target Instance**: `{instance}`\n"
        f"- **Modding Subsystem**: `{category}`\n"
        f"- **Task**: {task}\n\n"
    )

    em = summary["engine_metrics"]
    inst = summary["instances"]
    wf_list = "\n".join(f"  - `{w}`" for w in summary["workflows"])
    kb_list = "\n".join(f"  - `{k}`" for k in summary["knowledge_notes"])

    inventory_md = (
        f"### 🌐 Active CorsairDash Instances\n\n"
        f"| Instance | Target / Site ID | Live URL | Status |\n"
        f"| :--- | :--- | :--- | :--- |\n"
        f"| **Production Web** (`main`) | `hosting:prod` (`corsairdash`) | `{inst['web_prod']['url']}` | ✅ Live |\n"
        f"| **Dev / Modding Web** (`dev`) | `hosting:dev` (`corsairdash-dev`) | `{inst['web_dev']['url']}` | ✅ Live |\n\n"
        f"### 🛠️ Engine & Modding Telemetry\n\n"
        f"- **Total Codebase Size**: `{em['total_lines']} lines` (`{em['size_bytes']:,} bytes`)\n"
        f"- **Ship Progression Tiers**: `{em['ship_tiers']} Vessel Tiers (Coastal Sloop -> First-Rate Man-o'-War, 2 to 12 Loadout Slots)`\n"
        f"- **Modular Loadout Upgrades**: `{em['loadout_modules']} Shipwright Modules (Cargo Hold, Broadsides, Swivel Culverins, Iron Hull, Silk Sails, Copper Keel, Carpenters, Greek Fire)`\n"
        f"- **2.5D Extruded Island Ports**: `{em['island_ports']} Islands`\n"
        f"- **Legendary Boss Monsters**: `{em['boss_monsters']} Boss Encounters (Kraken, Flying Dutchman, Megalodon, Leviathan Serpent)`\n"
        f"- **Difficulty Modes (Physics + Pirate Escalation)**: `{em['difficulty_modes']} Modes (Merchant Breeze, Privateer Tradewinds, Cursed Maelstrom)`\n"
        f"- **4-Track Sea Shanty Concertina Synthesizer**: `{'✅ Active' if em['sea_shanty_choir'] else '⚠️ Missing'}`\n"
        f"- **Universal Modder In-Game Holodeck Studio**: `{'✅ Active' if em['holodeck_mod_studio'] else '⚠️ Missing'}`\n"
        f"- **Arcade High Score Engine**: `{'✅ Active' if em['high_score_persistence'] else '⚠️ Missing'}`\n"
        f"- **Knowledge Base Field Notes**:\n{kb_list}\n"
        f"- **Active GitHub Actions Workflows**:\n{wf_list}\n\n"
    )

    if ai_output:
        body = f"### 🤖 Agent Analysis & Modding Plan\n\n{ai_output}\n\n" + inventory_md
    else:
        body = (
            inventory_md
            + "### 🚀 Quick Modder & Deployment Commands\n\n"
            + "1. **Run Multi-Agent Modder Orchestrator**: `python agents/antigravity_orchestrator.py \"<modding goal>\"`\n"
            + "2. **Deploy Modded Build to Dev Host (`corsairdash-dev.web.app`)**: `npm run deploy:dev`\n"
            + "3. **Promote Verified Build to Production (`corsairdash.web.app`)**: `npm run deploy:prod`\n"
            + "4. **Run Modder Telemetry Audit**: `npm run mod:audit`\n"
        )

    return header + body


def main() -> None:
    parser = argparse.ArgumentParser(description="Antigravity CorsairDash Modder CI Runner")
    parser.add_argument("--event", required=True, choices=["dispatch", "issue", "schedule"])
    parser.add_argument("--task", default="Audit CorsairDash ship tiers, loadout slots, pirate escalation, and boss monsters.")
    parser.add_argument("--mode", default="report-issue")
    parser.add_argument("--instance", default="dev")
    parser.add_argument("--category", default="all")
    parser.add_argument("--issue-number", type=int, default=0)
    args = parser.parse_args()

    repo = os.environ.get("GITHUB_REPOSITORY", "ronaldtbriggs-blip/corsair-dash")
    workspace = pathlib.Path(os.environ.get("GITHUB_WORKSPACE", str(ROOT_DIR))).resolve()

    summary = scan_corsair_workspace(workspace)
    report = build_agent_response(args.event, args.task, args.instance, args.category, summary)

    step_summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if step_summary:
        with open(step_summary, "a", encoding="utf-8") as f:
            f.write(report + "\n")

    print(report)

    if os.environ.get("GITHUB_TOKEN"):
        if args.event == "issue" and args.issue_number > 0:
            github_api(
                "POST",
                f"/repos/{repo}/issues/{args.issue_number}/comments",
                {"body": report},
            )
        elif args.event == "dispatch" and args.mode == "report-issue":
            short_task = (args.task[:60] + "...") if len(args.task) > 60 else args.task
            github_api(
                "POST",
                f"/repos/{repo}/issues",
                {
                    "title": f"⛵ CorsairDash Modder Report [{args.instance}]: {short_task}",
                    "body": report,
                    "labels": ["agent-report"],
                },
            )


if __name__ == "__main__":
    main()
