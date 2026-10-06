param([string]$Config = (Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'HaoYuWebsiteWatcherNative\config.json'), [int]$Seconds = 600)
$ErrorActionPreference = 'Stop'
if ($Seconds -lt 600) { throw 'TEN_MINUTES_REQUIRED' }
$p07Config = Get-Content -LiteralPath $Config -Raw | ConvertFrom-Json
$p07Deadline = [DateTime]::UtcNow.AddSeconds(60)
do {
    $p07Settled = Get-Content -LiteralPath (Join-Path $p07Config.stateRoot 'watcher.json') -Raw | ConvertFrom-Json
    if ($p07Settled.status -eq 'NO_CHANGE') { break }
    if ([DateTime]::UtcNow -gt $p07Deadline) { throw 'IDLE_BASELINE_NOT_SETTLED' }
    Start-Sleep -Seconds 2
} while ($true)
$p07Owner = Get-Content -LiteralPath (Join-Path $p07Config.stateRoot 'locks\watcher\owner.json') -Raw | ConvertFrom-Json
$p07Node = Get-CimInstance Win32_Process -Filter ('ProcessId=' + [int]$p07Owner.pid)
if ($p07Node.ExecutablePath -ne $p07Config.node -or $p07Node.CommandLine -notlike ('*' + $Config + '*')) { throw 'MEASUREMENT_PROCESS_IDENTITY' }
$p07Ids = @([int]$p07Owner.pid, [int]$p07Node.ParentProcessId)
$p07Parent = Get-CimInstance Win32_Process -Filter ('ProcessId=' + [int]$p07Node.ParentProcessId)
$p07Wrapper = Get-CimInstance Win32_Process -Filter ('ProcessId=' + [int]$p07Parent.ParentProcessId)
if ($p07Wrapper.Name -eq 'wscript.exe') { $p07Ids += [int]$p07Wrapper.ProcessId }
$p07Console = @(Get-CimInstance Win32_Process -Filter ('ParentProcessId=' + [int]$p07Parent.ProcessId) | Where-Object { $_.Name -eq 'conhost.exe' -and $_.ExecutablePath -eq (Join-Path $env:SystemRoot 'System32\conhost.exe') })
# The hidden PowerShell console host is present before measurement, not an idle launch.
$p07Ids += @($p07Console | ForEach-Object { [int]$_.ProcessId })
$p07Starts = @{}
foreach ($p07Id in $p07Ids) { $p07Starts[$p07Id] = (Get-Process -Id $p07Id).TotalProcessorTime.TotalSeconds }
$p07Initial = Get-Content -LiteralPath (Join-Path $p07Config.stateRoot 'watcher-health.json') -Raw | ConvertFrom-Json
$p07Started = [DateTime]::UtcNow
$p07Samples = @()
$p07ObservedChildren = @()
try {
    while (([DateTime]::UtcNow - $p07Started).TotalSeconds -lt $Seconds) {
        $p07Processes = @($p07Ids | ForEach-Object { Get-Process -Id $_ -ErrorAction Stop })
        $p07Samples += @{seconds=([DateTime]::UtcNow-$p07Started).TotalSeconds; working_set_bytes=($p07Processes | Measure-Object WorkingSet64 -Sum).Sum; private_bytes=($p07Processes | Measure-Object PrivateMemorySize64 -Sum).Sum}
        $p07ObservedChildren += @(Get-CimInstance Win32_Process | Where-Object { $p07Ids -contains [int]$_.ParentProcessId -and $p07Ids -notcontains [int]$_.ProcessId } | Select-Object Name,ProcessId,ParentProcessId)
        Start-Sleep -Seconds 30
    }
    $p07Cpu=0
    foreach ($p07Id in $p07Ids) { $p07Cpu += (Get-Process -Id $p07Id).TotalProcessorTime.TotalSeconds - $p07Starts[$p07Id] }
    $p07Final = Get-Content -LiteralPath (Join-Path $p07Config.stateRoot 'watcher-health.json') -Raw | ConvertFrom-Json
    $p07Launches=($p07Final.workerLaunches-$p07Initial.workerLaunches)+($p07Final.notificationLaunches-$p07Initial.notificationLaunches)
    if ($p07Final.pid -ne $p07Initial.pid -or $p07Final.token -ne $p07Initial.token -or -not $p07Final.running) { throw 'MEASUREMENT_PROCESS_CHANGED' }
    $p07Result = @{result='PASS'; started=$p07Started.ToString('o'); finished=[DateTime]::UtcNow.ToString('o'); seconds=([DateTime]::UtcNow-$p07Started).TotalSeconds; cpu_seconds=$p07Cpu; initial=$p07Initial; final=$p07Final; polls=($p07Final.polls-$p07Initial.polls); preparations=($p07Final.preparations-$p07Initial.preparations); child_launches=$p07Launches; observed_children=$p07ObservedChildren; launch_measurement='Counters at both watcher launch sites, plus 30-second Windows process snapshots'; samples=$p07Samples; includes='Node watcher, hidden PowerShell launcher, detached WScript wrapper and existing native console host'; os_process_trace='NOT RUN: native trace subscription rejected'; battery_energy='NOT RUN'}
    if ($p07Result.preparations -ne 0 -or $p07Launches -ne 0 -or $p07ObservedChildren.Count -ne 0 -or $p07Cpu -gt 6) { $p07Result.result='FAIL' }
    $p07Result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path (Split-Path -Parent $Config) 'resource-checks.json') -Encoding UTF8
    $p07Result | Select-Object result,seconds,cpu_seconds,polls,preparations,child_launches,includes | ConvertTo-Json -Compress
    if ($p07Result.result -eq 'FAIL') { throw 'UNEXPECTED_IDLE_ACTIVITY' }
} finally {}
