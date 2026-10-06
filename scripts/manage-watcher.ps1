param(
    [Parameter(Mandatory=$true)][ValidateSet('Install','Start','Stop','Status','Disable','Uninstall','Revalidate','NotifyTest')][string]$Action,
    [string]$Config = (Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'HaoYuWebsiteWatcherNative\config.json')
)
$ErrorActionPreference = 'Stop'
$p07Config = Get-Content -LiteralPath $Config -Raw | ConvertFrom-Json
$p07TaskName = 'HaoYuWebsiteWatcher'
$p07Folder = Split-Path -Parent $Config
$p07Launch = Join-Path $p07Folder 'launch.ps1'
$p07Detached = Join-Path $p07Folder 'launch.vbs'
$p07Wscript = Join-Path $env:SystemRoot 'System32\wscript.exe'
$p07Cli = Join-Path $p07Config.repo 'scripts\watch-workflow.mjs'
function Stop-P07 {
    $p07OwnerPath = Join-Path $p07Config.stateRoot 'locks\watcher\owner.json'
    if (-not (Test-Path -LiteralPath $p07OwnerPath)) { return }
    $p07Owner = Get-Content -LiteralPath $p07OwnerPath -Raw | ConvertFrom-Json
    $p07Process = Get-CimInstance Win32_Process -Filter ('ProcessId=' + [int]$p07Owner.pid)
    if (-not $p07Process) { return }
    if ($p07Process.ExecutablePath -ne $p07Config.node -or $p07Process.CommandLine -notlike ('*' + $p07Cli + '*') -or $p07Process.CommandLine -notlike ('*' + $Config + '*')) { throw 'WATCHER_PROCESS_IDENTITY_REFUSED' }
    @{token=$p07Owner.token} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $p07Config.stateRoot 'watcher-stop.json') -Encoding UTF8
    for ($p07Wait=0; $p07Wait -lt 30; $p07Wait++) {
        if (-not (Get-Process -Id $p07Owner.pid -ErrorAction SilentlyContinue)) { return }
        Start-Sleep -Seconds 1
    }
    throw 'WATCHER_STOP_PENDING'
}
function Start-P07 {
    $p07Task = Get-ScheduledTask -TaskName $p07TaskName -ErrorAction SilentlyContinue
    if ($p07Task) {
        if ($p07Task.State -eq 'Disabled') { Enable-ScheduledTask -TaskName $p07TaskName | Out-Null }
        Start-ScheduledTask -TaskName $p07TaskName
    } else {
        if (-not (Test-Path -LiteralPath $p07Launch)) { throw 'INSTALL_REQUIRED' }
        Start-Process -FilePath $p07Wscript -ArgumentList ('//B //NoLogo "' + $p07Detached + '"') -WindowStyle Hidden
    }
}
switch ($Action) {
    'Install' {
        $p07Existing = Get-ScheduledTask -TaskName $p07TaskName -ErrorAction SilentlyContinue
        if ($p07Existing) { throw 'EXISTING_TASK_PRESERVED_UNINSTALL_FIRST' }
        # Persist explicit paths/settings; scheduled execution does not depend on PATH.
        $p07Escaped = $Config.Replace("'", "''")
        $p07LauncherText = @"
`$ErrorActionPreference = 'Stop'
`$p07Runtime = Get-Content -LiteralPath '$p07Escaped' -Raw | ConvertFrom-Json
`$env:SITE_PYTHON = `$p07Runtime.python
`$env:SITE_PLAYWRIGHT_MODULE = `$p07Runtime.playwright
`$env:SITE_BROWSER_EXECUTABLE = `$p07Runtime.browser
Set-Location -LiteralPath `$p07Runtime.repo
& `$p07Runtime.node (Join-Path `$p07Runtime.repo 'scripts\watch-workflow.mjs') run --config '$p07Escaped'
exit `$LASTEXITCODE
"@
        Set-Content -LiteralPath $p07Launch -Value $p07LauncherText -Encoding UTF8
        $p07Command = '"' + $p07Config.powershell + '" -NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $p07Launch + '"'
        $p07Vbs = 'Dim shell, result' + "`r`n" + 'Set shell = CreateObject("WScript.Shell")' + "`r`n" + 'result = shell.Run("' + $p07Command.Replace('"','""') + '", 0, True)' + "`r`n" + 'WScript.Quit result'
        Set-Content -LiteralPath $p07Detached -Value $p07Vbs -Encoding ASCII
        $p07User = [Security.Principal.WindowsIdentity]::GetCurrent().Name
        $p07Trigger = New-ScheduledTaskTrigger -AtLogOn -User $p07User
        $p07Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable
        $p07Settings.WakeToRun = $false
        $p07Settings.RunOnlyIfNetworkAvailable = $false
        $p07Settings.Hidden = $true
        $p07Principal = New-ScheduledTaskPrincipal -UserId $p07User -LogonType Interactive -RunLevel Limited
        $p07TaskAction = New-ScheduledTaskAction -Execute $p07Wscript -Argument ('//B //NoLogo "' + $p07Detached + '"') -WorkingDirectory $p07Config.repo
        Register-ScheduledTask -TaskName $p07TaskName -Action $p07TaskAction -Trigger $p07Trigger -Settings $p07Settings -Principal $p07Principal -Description 'Read-only website source polling; prepares reviewed proposals, never publishes.' | Out-Null
    }
    'Start' { Start-P07 }
    'Stop' { Stop-P07 }
    'Status' {
        & $p07Config.node $p07Cli status --config $Config
        Get-ScheduledTask -TaskName $p07TaskName -ErrorAction SilentlyContinue | Select-Object TaskName,State
    }
    'Disable' { Stop-P07; Disable-ScheduledTask -TaskName $p07TaskName | Out-Null }
    'Uninstall' {
        Stop-P07
        if (Get-ScheduledTask -TaskName $p07TaskName -ErrorAction SilentlyContinue) { Unregister-ScheduledTask -TaskName $p07TaskName -Confirm:$false }
        if (Test-Path -LiteralPath $p07Launch) { Remove-Item -LiteralPath $p07Launch }
        if (Test-Path -LiteralPath $p07Detached) { Remove-Item -LiteralPath $p07Detached }
        # Configuration, candidates, approvals, calibration and rollback survive.
    }
    'Revalidate' { Stop-P07; & $p07Config.node $p07Cli revalidate --config $Config; if ($LASTEXITCODE -ne 0) { throw 'REVALIDATION_FAILED' }; Start-P07 }
    'NotifyTest' { & $p07Config.powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File (Join-Path $p07Config.repo 'scripts\watcher-notify.ps1') -Kind TEST -Tag '0000000000000000'; if ($LASTEXITCODE -ne 0) { throw 'NOTIFICATION_TEST_FAILED' } }
}
