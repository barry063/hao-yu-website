# P07 — local watcher implementation and installation plan

Agreed design: 6 October 2026. Status: `PLANNED_NOT_IMPLEMENTED`.
Parent acceptance contract: [CONTENT_PROPAGATION_PLAN.md](CONTENT_PROPAGATION_PLAN.md#p07--optional-local-watcher), P07-A–C.
Progress record: [WEBSITE_UPDATE_PLAN.md](WEBSITE_UPDATE_PLAN.md).

## Purpose and current scope

Detect changes to the declared canonical evidence, prepare a checked public
website/CV proposal when needed, and notify Hao when review or reconciliation is
required. Publication remains the existing reviewed release operation.

The user approved the design and a two-minute interval, requested this document
for a new Codex session, and subsequently requested versioning/pushing the plan.
The documentation checkpoint includes only this plan and its parent progress
records. It does not implement or install a watcher, register a scheduled task,
migrate private state or change visitor content. The continuation prompt below explicitly authorises
implementation and installation when the user submits it in the next session.
Existing authority must be followed without another request to repeat it.

P01–P06 are complete. The current local baseline is main commit
`f0721b08a95ea09abcacd7ac4cdd1966aaae311e`. Its final Pages run `37455061073`
succeeded and candidate-bound live verification returned `LIVE_VERIFIED`; the
user subsequently confirmed the website. Recheck current Git/source state at
implementation time rather than treating these dated facts as fresh checks.

## Agreed user experience

1. The watcher starts in the background when the user signs into Windows.
2. While the laptop is awake, it checks the selected files every **120 seconds**.
3. Stable changes invoke the existing local preparation workflow. A successful
   proposal contains the public change summary, website preview and public CV.
4. A Windows notification announces a candidate needing review or an actionable
   problem. A saved local status remains available if the notification is missed.
5. Hao reviews the proposal and explicitly requests any subsequent publication.
   The watcher never approves, promotes, stages, commits, pushes or publishes.

| Laptop state | Intended behaviour |
| --- | --- |
| Awake and signed in | Periodic lightweight checks; preparation only when needed |
| Locked, still awake | Continue checking under the same signed-in account |
| Sleeping or hibernating | No dependable checking until resume; no wake request |
| Resumed | Recheck current files and catch up after writes settle |
| Shut down or signed out | Stop; start again on the next sign-in |

Task Scheduler launches one watcher at sign-in. It does not launch a new process
every two minutes. The running watcher owns the interval. The task must have
`WakeToRun=false`; the process must make no request to prevent sleep. Resume and
restart recovery need actual verification on this laptop. Windows' relevant
behaviour is described in [logon triggers](https://learn.microsoft.com/en-us/windows/win32/taskschd/logon-trigger-example--scripting-),
[wake settings](https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-waketorun)
and [Modern Standby application execution](https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/integrating-apps-with-modern-standby).

## Source scope and resource cost

Use the sources declared in the existing reviewed configuration. At this
snapshot they are:

| ID | Path relative to the canonical workspace |
| --- | --- |
| EB | `1 Master Academic CV/Evidence_Bank.md` |
| PUB | `4 Publication list/Master_Publication_List.md` |
| CONTRIB | `4 Publication list/Publication_Contributions.json` |
| PROFILE | `3 Research Profile/Hao_Yu_Application_Evidence_Wording.md` |
| EXPORT | `1 Master Academic CV/Current_Export_Record.json` |

These five files totalled 138,596 bytes, about 139 KB, when inspected on
6 October 2026. Routine checks should read/hash this small allowlist and wait on
an asynchronous timer between checks. Do not recursively scan the CV workspace,
application archives, referee files, website candidates or unrelated OneDrive
directories. Record local paths in private configuration, not this public plan.

Use content fingerprints rather than relying exclusively on filesystem events.
This is a proposed response to save/rename/synchronisation behaviour, not a claim
that OneDrive reliability has already been tested. Node documents event-watch
limitations in its [filesystem documentation](https://nodejs.org/api/fs.html#caveats).

Do not launch Python, Chrome, Git or a full build on every timer tick. The normal
tick should not make network calls. Start the existing preparation/checks only
after relevant stable input changes. Its browser/PDF checks can temporarily use
more resources; one preparation runs at a time. CPU, memory and battery effects
have not been benchmarked. Measure idle CPU time, memory and process launches
over at least ten minutes; record the polling workload separately from a build.
Unexpected sustained activity must be resolved before installation.

## Detection, preparation and recovery

Implement these behaviours using the existing adapters and approval contract:

- Check on startup, then every 120 seconds; also recheck after a long timer gap
  consistent with resume. Two minutes is a detection interval, not a promise that
  a complete browser-validated candidate will be ready within two minutes.
- After detecting a changed fingerprint, wait at least ten seconds and reread
  the whole declared set. Prepare only if the readings agree. Reset the settling
  period when more changes arrive. Missing/locked files retry with bounded waits;
  a persistent problem produces one actionable notice.
- Coalesce burst saves into one preparation. Serialize watcher instances and
  manual preparation/state-changing operations using an explicit ownership lock.
  Recover a stale lock only after establishing that its owner has exited; never
  stop unrelated processes. Preserve the manual prepare command as a fallback.
- Reuse `prepare` without `force-candidate`. It already snapshots and rechecks
  inputs before returning a checked package. Recheck the snapshot before issuing
  a ready notice; a change during preparation must not leave a stale proposal
  presented as ready. Queue one fresh attempt once the newest inputs settle.
- Persist the last processed input fingerprint, current pending candidate and
  notification identity privately. Do not rebuild/notify again for unchanged
  inputs after restart, another timer tick or a midnight date change.
- Choose one release date in Europe/London for a stable preparation attempt and
  retain it across retries of those inputs. Never change an existing package's
  date or output bytes. The date is the preparation date, not publication proof.
- Track the existing policy, published baseline and generator/configuration
  bindings so a relevant change invalidates pending review/approval. If a private
  source edit changes a fingerprint, an older approval is still stale even when
  public semantics are unchanged. Preserve immutable historical packages.
- A generator-only change may invalidate review; do not silently force a release
  merely because watched code changed. Pause on code/configuration changes that
  require revalidation and explain the next manual action.
- Resume from the saved processed state after interruption. Treat leftover build
  directories as incomplete, never ready candidates. Clean only verified,
  watcher-owned paths. Retain the last published inventory and rollback history.

| Preparation/status result | Watcher response |
| --- | --- |
| `NO_CHANGE` | Save processed fingerprints; no routine notification or new candidate |
| `READY_FOR_REVIEW` | Save exact candidate/target and one ready notice; offer local review instructions |
| `NEEDS_RECONCILIATION` | Save the private issue location; issue one generic attention notice |
| `FAILED` | Retain published baseline, save safe error status, notify once; retry according to bounded policy |
| Pending candidate becomes stale | Mark it superseded; reprepare when appropriate or notify what needs review |

Notify again only when the actionable state changes, the candidate is materially
superseded, or the user explicitly asks to be reminded. Keep raw evidence,
diagnostics and private absolute paths out of desktop notices and normal logs.
Verify native notification delivery; saving a status file alone is not proof that
the notification worked. If Windows suppresses a notice, retain the status and
document the supported way to inspect it. No email, Slack or Codex chat messaging
is included in this design.

The existing limitation remains: manuscript statuses are duplicated across
canonical records. Conflicts require reconciliation. P07 does not restructure
canonical ownership or turn arbitrary scientific prose into verified facts.

## Private state and installation

The prior session's private workflow state is in the unsandboxed user's temporary
directory, in `hao-yu-propagation-2026-10-06`. Sandbox TEMP may point elsewhere.
Locate it privately and validate it; do not assume it still exists. It contains
calibrations, source snapshots, approvals, published baseline and rollback data.
It must remain outside both repositories.

Before persistent installation:

1. Read both workspaces' AGENTS.md, inspect Git status and recheck current source
   fingerprints. Preserve the existing planning documents and any user changes.
   Create a separate local branch, suggested `implementation/p07`.
2. Check the existing Node, Python, pinned Python packages, Playwright and Chrome
   runtimes. Reuse available runtimes; do not introduce dependencies unnecessarily.
   A scheduled task must receive explicit executable paths, working directory and
   required runtime settings rather than depending on an interactive shell.
3. Select a persistent private folder under the current user's local application
   data, suggested `HaoYuWebsiteWatcher`, outside OneDrive and both workspaces.
   Keep configuration, state, ownership lock, bounded logs and notification
   records there. Validate resolved paths and user access before copying.
4. Stop existing workflow activity, copy the old private state, then compare the
   source and destination inventories/hashes and load it through existing state
   validation. Preserve the original as a backup. Retain calibration history,
   exact approvals, published baseline and rollback manifests; do not initialise
   a pending proposal as already published. If old state is unavailable, reconstruct
   only through the existing reviewed calibration procedure with verified release
   evidence, and record any history that cannot be recovered.
5. Complete synthetic tests and a foreground/manual watcher trial before creating
   a persistent task. Prove startup/stop/status, change detection and notification
   with fixtures; do not edit real academic facts to manufacture a demonstration.
6. Register one task under the signed-in user's account, suggested name
   `HaoYuWebsiteWatcher`, with a sign-in trigger and hidden background launcher.
   Prevent duplicate instances; use bounded restart handling, no wake setting,
   no sleep prevention and no unconditional daily execution timeout. Configure
   it to work on battery as well as mains while awake; do not require network
   connectivity for polling. Record the effective settings and launch definition.
7. Start the installed task and verify actual status, notification delivery,
   resource behaviour, duplicate suppression and resume/restart handling. Verify
   disable/uninstall and reinstall in a controlled trial, preserving private
   history. Leave one functioning instance installed at handoff if all required
   checks pass under the continuation instruction.

If a required test cannot be performed, report `NOT RUN` and keep the affected
acceptance criterion incomplete. Do not claim P07 DONE solely from fixture tests
or successful task registration. Diagnose failures and continue independent work.

## Proposed deliverables and commands

These are proposed interfaces, not commands implemented today. Final names may
change; update README and this plan to match the actual interface.

| Deliverable | Purpose |
| --- | --- |
| `scripts/watch-workflow.mjs` and shared lifecycle helpers | Timer, settling, locking, deduplication, private status and preparation orchestration |
| Windows launcher/management script | Explicit runtime configuration, hidden startup and Task Scheduler lifecycle |
| Watcher fixture/lifecycle tests | P07-A–C proof without changing real canonical facts |
| README watcher guide | Actual start, stop, status, install, disable/uninstall and manual fallback commands |
| `docs/releases/<date>-p07.md` and machine check record | Public-safe acceptance results, measurements and installed-task evidence |

Provide a foreground mode with Ctrl+C, managed start/stop/status, and an explicit
installer/uninstaller. Stopping/disabling prevents future preparation; uninstalling
removes the task and launcher registration while preserving private history unless
the user separately requests its deletion. Start/stop operations must target only
the identified watcher instance. Preview remains local and serves only the public
candidate visitor allowlist. Do not start a permanent preview server by default.

Keep the currently available fallback documented:

```text
npm --silent run workflow -- prepare --source-root <canonical-root> --state-root <private-state> --release-date YYYY-MM-DD
node scripts/preview.mjs 4173 tmp/candidates/<full-id>/visitor
```

## Acceptance and verification checklist

Every check below is **NOT RUN for P07** at plan creation. Record the command or
manual procedure, actual result, date and evidence location when implementing.

| Contract | Checks required before completion |
| --- | --- |
| P07-A | Explicit installation instruction; 120-second default; declared-source allowlist; stable-write settling; burst coalescing; restart/resume/OneDrive recovery; unrelated files ignored; working start/stop/status/install/uninstall; actual task settings and idle resource measurements |
| P07-B | Ready/problem notification delivery; quiet NO_CHANGE; persistent duplicate suppression; stale pending review identified; private evidence absent from notices/public files/logs; no approval, promotion, staging, commit, push, publication or canonical writes by the watcher |
| P07-C | Synthetic burst saves, partial/atomic writes, missing/locked files, conflicting evidence, private-only changes, no public change, source/code/policy drift, duplicate start, interruption, stale-lock recovery and manual-operation concurrency; real installed lifecycle checks; manual fallback retained |

Run the existing relevant tests after implementation. Hash root visitor files and
the dataset before/after watcher trials to prove no promotion occurred. Verify
canonical source integrity with current fingerprints. Inspect any proposed public
report for private paths/content before staging it. Keep raw logs/screenshots or
source snapshots in appropriate private/ignored locations; public summaries must
contain only cleared information. Save evidence and update both parent trackers.
P08, hosting migration, automated release and canonical restructuring stay outside
this task.

## Prompt for the next Codex session

Open a new session in this same website repository and paste the following. This
prompt supplies the opt-in to implement and install the tested local watcher; it
does not authorise a Git commit/push or website publication.

```text
Implement P07 using AGENTS.md, docs/WEBSITE_UPDATE_PLAN.md,
docs/CONTENT_PROPAGATION_PLAN.md and docs/P07_WATCHER_IMPLEMENTATION_PLAN.md.

Inspect Git status first and preserve the planning documents and any existing
user changes. Read the canonical workspace's AGENTS.md, recheck sources
and existing private state, and work on a separate local implementation/p07 branch.

Use the agreed 120-second interval, stable-write settling, declared-source
allowlist, existing prepare/check workflow, persistent private state, quiet
NO_CHANGE behaviour, duplicate suppression and local Windows notifications.
Provide working start/stop/status and install/uninstall controls.

After meaningful fixture and foreground checks pass, I authorise copying and
verifying the existing private state into persistent local application data and
installing the tested per-user Windows sign-in task. Leave wake-to-run disabled
and preserve normal sleep behaviour. Verify the actual installed lifecycle and
resource cost; leave one functioning watcher running when checks pass. Do not
ask me to repeat this installation authorisation.

Keep canonical CV files and released website files unchanged. The watcher must
never approve, promote, stage, commit, push or publish. Do not install new
dependencies unless necessary; reuse the existing runtimes where possible.
Do not commit, push, merge or publish this implementation without a separate
instruction. Do not implement P08 or migrate canonical ownership.

Verify P07-A–C and the detailed checklist, record actual results/evidence, update
the progress plans and operator guide, and report the installed task, controls,
remaining limitations and any unavailable checks as NOT RUN. Stop for review
after P07; do not mark it DONE until its required checks are actually satisfied.
```
