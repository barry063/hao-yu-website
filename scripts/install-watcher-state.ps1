param(
    [Parameter(Mandatory=$true)][string]$OldState,
    [Parameter(Mandatory=$true)][string]$SourceRoot,
    [Parameter(Mandatory=$true)][string]$Node,
    [Parameter(Mandatory=$true)][string]$Python,
    [Parameter(Mandatory=$true)][string]$Playwright,
    [Parameter(Mandatory=$true)][string]$Browser,
    [string]$PrivateRoot = (Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'HaoYuWebsiteWatcherNative')
)
$ErrorActionPreference = 'Stop'
$p07Repo = Split-Path -Parent $PSScriptRoot
$p07Local = [Environment]::GetFolderPath('LocalApplicationData')
$p07Full = [IO.Path]::GetFullPath($PrivateRoot)
if (-not $p07Full.StartsWith($p07Local + '\',[StringComparison]::OrdinalIgnoreCase) -or $p07Full -match 'OneDrive') { throw 'PRIVATE_INSTALL_LOCATION' }
New-Item -ItemType Directory -Path $p07Full -Force | Out-Null
# The signed-in user's own process creates persistent files. The default ACL
# is restricted to that user and SYSTEM; no private evidence enters the repo.
$p07Sid = [Security.Principal.WindowsIdentity]::GetCurrent().User
$p07Acl = Get-Acl -LiteralPath $p07Full
$p07Acl.SetAccessRuleProtection($true,$false)
$p07Acl.SetAccessRule([Security.AccessControl.FileSystemAccessRule]::new($p07Sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow'))
$p07Acl.SetAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new('S-1-5-18'),'FullControl','ContainerInherit,ObjectInherit','None','Allow'))
Set-Acl -LiteralPath $p07Full -AclObject $p07Acl
$p07State = Join-Path $p07Full 'workflow'
$p07Config = Join-Path $p07Full 'config.json'
& $Node (Join-Path $PSScriptRoot 'migrate-watcher-state.mjs') --from $OldState --to $p07State --source-root $SourceRoot --local-root $p07Local
if ($LASTEXITCODE -ne 0) { throw 'NATIVE_MIGRATION_FAILED' }
& $Node (Join-Path $PSScriptRoot 'watch-workflow.mjs') configure --config $p07Config --source-root $SourceRoot --state-root $p07State --python $Python --playwright $Playwright --browser $Browser --powershell (Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe')
if ($LASTEXITCODE -ne 0) { throw 'NATIVE_CONFIGURATION_FAILED' }
