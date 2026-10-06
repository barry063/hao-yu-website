param(
    [ValidateSet('READY','PROBLEM','TEST')][string]$Kind,
    [ValidatePattern('^[a-f0-9]{16}$')][string]$Tag
)
$ErrorActionPreference = 'Stop'
# Use Windows' existing PowerShell shortcut identity. No new app registration,
# external delivery service, evidence text or local paths enter the notice.
$p07AppId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
$null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
$null = [Windows.UI.Notifications.ToastNotifier, Windows.UI.Notifications, ContentType = WindowsRuntime]
$null = [Windows.UI.Notifications.NotificationSetting, Windows.UI.Notifications, ContentType = WindowsRuntime]
$null = [Windows.UI.Notifications.ToastNotificationHistory, Windows.UI.Notifications, ContentType = WindowsRuntime]
$null = [Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime]
$null = [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime]
$p07Message = switch ($Kind) {
    'READY' { 'A checked website and CV proposal is ready. Use the watcher status command to find the exact candidate, then review it before requesting publication.' }
    'PROBLEM' { 'The website watcher needs attention. Use the watcher status command and private workflow record for the next action.' }
    'TEST' { 'Watcher notification verification. This is a test; no academic facts or published files have changed.' }
}
$p07Xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$p07Xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>Hao Yu website watcher</text><text>' + $p07Message + '</text></binding></visual></toast>')
$p07Toast = [Windows.UI.Notifications.ToastNotification]::new($p07Xml)
$p07Toast.Tag = $Tag
$p07Toast.Group = 'HaoYuWatcher'
$p07Toast.ExpirationTime = [DateTimeOffset]::Now.AddHours(24)
$p07Notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($p07AppId)
# Some PowerShell 5.1 WinRT projections return a null Setting enum. Delivery is
# established by Windows' notification history rather than that projection.
$p07Notifier.Show($p07Toast)
Start-Sleep -Milliseconds 700
$p07History = [Windows.UI.Notifications.ToastNotificationManager]::History.GetHistory($p07AppId)
$p07Found = @($p07History | Where-Object { $_.Tag -eq $Tag -and $_.Group -eq 'HaoYuWatcher' }).Count -gt 0
if (-not $p07Found) { throw 'NOTIFICATION_NOT_IN_WINDOWS_HISTORY' }
@{ state = 'WINDOWS_HISTORY_CONFIRMED'; kind = $Kind; tag = $Tag; time = [DateTime]::UtcNow.ToString('o') } | ConvertTo-Json -Compress
