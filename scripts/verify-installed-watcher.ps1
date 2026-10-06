param([string]$Config = (Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'HaoYuWebsiteWatcherNative\config.json'))
$ErrorActionPreference = 'Stop'
$p07Config = Get-Content -LiteralPath $Config -Raw | ConvertFrom-Json
$p07Manager = Join-Path $p07Config.repo 'scripts\manage-watcher.ps1'
$p07HealthFile = Join-Path $p07Config.stateRoot 'watcher-health.json'
$p07Checks = @()
function Invoke-P07([string]$Operation) {
    & $p07Config.powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File $p07Manager -Action $Operation -Config $Config
    if ($LASTEXITCODE -ne 0) { throw ('LIFECYCLE_' + $Operation) }
}
function Wait-P07 {
    for ($p07Wait=0; $p07Wait -lt 40; $p07Wait++) {
        if (Test-Path -LiteralPath $p07HealthFile) {
            $p07Health = Get-Content -LiteralPath $p07HealthFile -Raw | ConvertFrom-Json
            $p07State = Get-Content -LiteralPath (Join-Path $p07Config.stateRoot 'watcher.json') -Raw | ConvertFrom-Json
            $p07Process = Get-CimInstance Win32_Process -Filter ('ProcessId=' + [int]$p07Health.pid)
            if ($p07Process -and $p07Health.running -and $p07State.status -eq 'NO_CHANGE') { return $p07Health }
        }
        Start-Sleep -Seconds 1
    }
    throw 'INSTALLED_START_TIMEOUT'
}
Invoke-P07 'Install'; Invoke-P07 'Revalidate'
$p07First = Wait-P07
$p07Checks += @{id='INSTALLED_START';result='PASS'}
$p07Task = Get-ScheduledTask -TaskName 'HaoYuWebsiteWatcher'
if ($p07Task.Settings.WakeToRun -or $p07Task.Settings.DisallowStartIfOnBatteries -or $p07Task.Settings.StopIfGoingOnBatteries -or $p07Task.Settings.RunOnlyIfNetworkAvailable -or $p07Task.Settings.ExecutionTimeLimit -ne 'PT0S' -or $p07Task.Settings.MultipleInstances -ne 2 -or $p07Task.Principal.LogonType -ne 3 -or $p07Task.Principal.RunLevel -ne 0) { throw 'INSTALLED_SETTINGS' }
if ($p07Task.Triggers.Count -ne 1 -or $p07Task.Triggers[0].CimClass.CimClassName -ne 'MSFT_TaskLogonTrigger') { throw 'SIGNIN_TRIGGER' }
$p07Checks += @{id='TASK_SETTINGS';result='PASS';wake_to_run=$false;on_battery=$true;network_required=$false;execution_timeout='PT0S';instances='IgnoreNew';logon='Interactive';privilege='Limited';trigger='Current-user sign-in';restart_count=$p07Task.Settings.RestartCount}
Invoke-P07 'Start'; Start-Sleep -Seconds 2
$p07Same = Wait-P07
if ($p07Same.pid -ne $p07First.pid) { throw 'DUPLICATE_TASK_START' }
$p07Checks += @{id='INSTALLED_DUPLICATE_SUPPRESSION';result='PASS'}
Invoke-P07 'Stop'
if ((Get-Content -LiteralPath $p07HealthFile -Raw | ConvertFrom-Json).running) { throw 'STOP_STATUS' }
Invoke-P07 'Start'; $p07Restarted = Wait-P07
if ($p07Restarted.preparations -ne 0) { throw 'RESTART_REBUILD' }
$p07Checks += @{id='INSTALLED_STOP_RESTART';result='PASS'}
# Simulate interruption of the identified idle watcher only, never other processes.
$p07Process = Get-CimInstance Win32_Process -Filter ('ProcessId=' + [int]$p07Restarted.pid)
if ($p07Process.ExecutablePath -ne $p07Config.node -or $p07Process.CommandLine -notlike ('*' + $Config + '*')) { throw 'INTERRUPT_IDENTITY' }
Stop-Process -Id $p07Restarted.pid -Force
Start-Sleep -Seconds 2
Invoke-P07 'Start'; $p07Recovered = Wait-P07
if ($p07Recovered.pid -eq $p07Restarted.pid) { throw 'INTERRUPT_RECOVERY' }
$p07Checks += @{id='INSTALLED_INTERRUPTION_RECOVERY';result='PASS'}
Invoke-P07 'Disable'
if ((Get-ScheduledTask -TaskName 'HaoYuWebsiteWatcher').State -ne 'Disabled') { throw 'DISABLE_FAILED' }
$p07Checks += @{id='INSTALLED_DISABLE';result='PASS'}
Invoke-P07 'Uninstall'
if (Get-ScheduledTask -TaskName 'HaoYuWebsiteWatcher' -ErrorAction SilentlyContinue) { throw 'UNINSTALL_FAILED' }
if (-not (Test-Path -LiteralPath (Join-Path $p07Config.stateRoot 'published.json')) -or -not (Test-Path -LiteralPath (Join-Path $p07Config.stateRoot 'approvals')) -or -not (Test-Path -LiteralPath (Join-Path $p07Config.stateRoot 'rollback'))) { throw 'PRIVATE_HISTORY_LOST' }
$p07Checks += @{id='INSTALLED_UNINSTALL_PRESERVES_HISTORY';result='PASS'}
Invoke-P07 'Install'; Invoke-P07 'Start'; $null = Wait-P07
$p07Checks += @{id='INSTALLED_REINSTALL';result='PASS'}
Invoke-P07 'NotifyTest'
$p07Checks += @{id='INSTALLED_NOTIFICATION_HISTORY';result='PASS'}
$p07Result = @{state='INSTALLED_LIFECYCLE_VERIFIED';checks=$p07Checks;time=[DateTime]::UtcNow.ToString('o');signout_signin='NOT RUN';physical_sleep_resume='NOT RUN';OneDrive_live_sync='NOT RUN'}
$p07Result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path (Split-Path -Parent $Config) 'installed-checks.json') -Encoding UTF8
$p07Result | ConvertTo-Json -Depth 6
