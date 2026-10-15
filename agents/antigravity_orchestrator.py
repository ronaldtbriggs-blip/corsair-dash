"""
Google Antigravity SDK Multi-Agent Modding & Deployment Orchestrator for CorsairDash: Sovereign Seas
(`ronaldtbriggs-blip/corsair-dash`).

Combines the Universal Modder 3-worker architecture (`mod-orchestrator`, `mod-offline-worker`,
`mod-game-worker`) with CorsairDash subsystem inspection and Dev/Prod Firebase Hosting deployment.

Usage:
  python agents/antigravity_orchestrator.py "Add a new Sea Monster Boss and deploy to dev"
"""

import argparse
import asyncio
import json
import pathlib
import subprocess
import sys

ROOT_DIR = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from agents.ci_runner import scan_corsair_workspace  # noqa: E402


def corsair_scan_workspace() -> str:
    """Scans the CorsairDash workspace, engine telemetry, ship tiers, loadout modules, bosses, and active instances."""
    return json.dumps(scan_corsair_workspace(ROOT_DIR), indent=2)


def corsair_read_kb_note(note_path: str = "games/corsair-dash/architecture-and-modding.md") -> str:
    """Reads a CorsairDash modding field note from `knowledge/`."""
    target = (ROOT_DIR / "knowledge" / note_path.lstrip("/")).resolve()
    if not target.is_file():
        return json.dumps({"error": f"Note not found: {note_path}"})
    return target.read_text(encoding="utf-8", errors="replace")


def corsair_deploy_instance(target: str = "dev") -> str:
    """Deploys CorsairDash to the specified Firebase Hosting instance ('dev', 'prod', or 'all')."""
    if target not in ("dev", "prod", "all"):
        return json.dumps({"error": "target must be 'dev', 'prod', or 'all'"})
    script = f"deploy:{target}"
    proc = subprocess.run(
        ["npm", "run", script],
        cwd=str(ROOT_DIR),
        capture_output=True,
        text=True,
        shell=(sys.platform == "win32"),
    )
    return json.dumps(
        {
            "target": target,
            "exit_code": proc.returncode,
            "stdout": proc.stdout[-2000:],
            "stderr": proc.stderr[-1000:],
        },
        indent=2,
    )


def build_agent_config():
    """Builds the Google Antigravity SDK `LocalAgentConfig` with CorsairDash Modder subagents and tools."""
    from google.antigravity import LocalAgentConfig, types

    mod_offline_worker = types.SubagentConfig(
        name="mod_offline_worker",
        description=(
            "Offline mod authoring worker for CorsairDash: Sovereign Seas. Studies "
            "`knowledge/games/corsair-dash/architecture-and-modding.md` and authors new ship tiers, "
            "loadout modules, island ports, sea shanties, and boss monsters in `data.js`, `game.js`, `map.js`, `pirates.js`, and `bosses.js`."
        ),
        capabilities=types.SubagentCapabilities(
            agent_behavior=types.AgentBehavior.AUTONOMOUS,
            enabled_tools=[
                types.BuiltinTools.VIEW_FILE,
                types.BuiltinTools.WRITE_TO_FILE,
                types.BuiltinTools.REPLACE_FILE_CONTENT,
            ],
        ),
    )

    mod_game_worker = types.SubagentConfig(
        name="mod_game_worker",
        description=(
            "Live verification & multi-instance deployment worker for CorsairDash. Runs `node -c` syntax checks "
            "and deploys modded builds to Firebase Hosting (`https://corsairdash-dev.web.app` and `https://corsairdash.web.app`)."
        ),
        capabilities=types.SubagentCapabilities(
            agent_behavior=types.AgentBehavior.AUTONOMOUS,
            enabled_tools=[
                types.BuiltinTools.VIEW_FILE,
                types.BuiltinTools.RUN_COMMAND,
            ],
        ),
    )

    return LocalAgentConfig(
        system_instructions=(
            "You are the Antigravity CorsairDash Modder Orchestrator (`mod-orchestrator`) for "
            "`ronaldtbriggs-blip/corsair-dash`. Follow the Universal Modder workflow:\n"
            "1) Read the CorsairDash architecture note (`corsair_read_kb_note`),\n"
            "2) Inspect workspace telemetry (`corsair_scan_workspace`),\n"
            "3) Delegate code/content authoring to `mod_offline_worker`,\n"
            "4) Delegate syntax verification and Dev deployment (`corsair_deploy_instance('dev')`) to `mod_game_worker`,\n"
            "5) Promote to Production (`corsair_deploy_instance('prod')`) when verified."
        ),
        tools=[
            corsair_scan_workspace,
            corsair_read_kb_note,
            corsair_deploy_instance,
        ],
        subagents=[mod_offline_worker, mod_game_worker],
        capabilities=types.CapabilitiesConfig(
            enable_subagents=True,
            max_subagent_depth=2,
        ),
    )


async def run_prompt(prompt: str) -> None:
    from google.antigravity import Agent

    config = build_agent_config()
    async with Agent(config) as agent:
        response = await agent.chat(prompt)
        async for chunk in response:
            print(chunk, end="", flush=True)
        print()


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Antigravity CorsairDash Multi-Agent Modder Orchestrator")
    parser.add_argument("prompt", help="Modding or deployment goal for CorsairDash")
    args = parser.parse_args()
    asyncio.run(run_prompt(args.prompt))


if __name__ == "__main__":
    main()
