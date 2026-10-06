param([string]$Config = (Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'HaoYuWebsiteWatcherNative\config.json'))
$ErrorActionPreference = 'Stop'
$p07Config = Get-Content -LiteralPath $Config -Raw | ConvertFrom-Json
$p07Configuration = Get-Content -LiteralPath (Join-Path $p07Config.stateRoot 'state.json') -Raw | ConvertFrom-Json
$p07Declared = @($p07Configuration.sources | Where-Object { $_.id -eq 'EXPORT' })
if ($p07Declared.Count -ne 1) { throw 'DECLARED_SOURCE_REQUIRED' }
$p07Source = [IO.Path]::GetFullPath((Join-Path $p07Config.sourceRoot $p07Declared[0].path))
if (-not $p07Source.StartsWith(([IO.Path]::GetFullPath($p07Config.sourceRoot) + '\'),[StringComparison]::OrdinalIgnoreCase)) { throw 'SOURCE_LOCATION' }
$p07StateFile = Join-Path $p07Config.stateRoot 'watcher.json'
$p07HealthFile = Join-Path $p07Config.stateRoot 'watcher-health.json'
$p07Before = Get-Content -LiteralPath $p07HealthFile -Raw | ConvertFrom-Json
$p07BeforeState = Get-Content -LiteralPath $p07StateFile -Raw | ConvertFrom-Json
if (-not $p07Before.running -or $p07BeforeState.status -ne 'NO_CHANGE') { throw 'IDLE_WATCHER_REQUIRED' }
$p07Hash = (Get-FileHash -LiteralPath $p07Source -Algorithm SHA256).Hash
$p07Started = [DateTime]::UtcNow
$p07Handle = [IO.File]::Open($p07Source,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::None)
try {
    $p07Deadline = [DateTime]::UtcNow.AddSeconds(150)
    do {
        $p07State = Get-Content -LiteralPath $p07StateFile -Raw | ConvertFrom-Json
        if ($p07State.status -eq 'RETRYING_SOURCE_READ') { break }
        if ([DateTime]::UtcNow -gt $p07Deadline) { throw 'READ_RETRY_NOT_OBSERVED' }
        Start-Sleep -Seconds 1
    } while ($true)
    $p07RetryTime = [DateTime]::UtcNow.ToString('o')
} finally { $p07Handle.Dispose() }
$p07Deadline = [DateTime]::UtcNow.AddSeconds(150)
do {
    $p07AfterState = Get-Content -LiteralPath $p07StateFile -Raw | ConvertFrom-Json
    if ($p07AfterState.status -eq 'NO_CHANGE' -and $p07AfterState.readFailures -eq 0) { break }
    if ([DateTime]::UtcNow -gt $p07Deadline) { throw 'READ_RECOVERY_NOT_OBSERVED' }
    Start-Sleep -Seconds 1
} while ($true)
$p07After = Get-Content -LiteralPath $p07HealthFile -Raw | ConvertFrom-Json
if ((Get-FileHash -LiteralPath $p07Source -Algorithm SHA256).Hash -ne $p07Hash -or $p07After.pid -ne $p07Before.pid -or $p07AfterState.processed -ne $p07BeforeState.processed -or $p07After.preparations -ne $p07Before.preparations -or $p07After.notificationLaunches -ne $p07Before.notificationLaunches) { throw 'READ_RECOVERY_INVARIANT' }
$p07Result = @{result='PASS';started=$p07Started.ToString('o');retry_observed=$p07RetryTime;recovered=[DateTime]::UtcNow.ToString('o');method='Read-only exclusive access to declared EXPORT source in the actual OneDrive workspace; no source writes';source_sha256=$p07Hash.ToLowerInvariant();same_instance=$true;same_processed_fingerprint=$true;additional_preparations=0;additional_notifications=0;status='NO_CHANGE';live_remote_sync='NOT RUN'}
$p07Result | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path (Split-Path -Parent $Config) 'source-read-checks.json') -Encoding UTF8
$p07Result | ConvertTo-Json -Compress
