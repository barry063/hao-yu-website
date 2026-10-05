# Resize the existing portrait and draw a current social card with native Windows
# image APIs. The original portrait stays unchanged for provenance and QA.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$siteRoot = Split-Path -Parent $PSScriptRoot
$sourceImage = [System.Drawing.Image]::FromFile((Join-Path $siteRoot 'assets\hao-yu.jpg'))
try {
    $portraitWidth = 480
    $portraitHeight = [int][Math]::Round($sourceImage.Height * $portraitWidth / $sourceImage.Width)
    $portrait = New-Object System.Drawing.Bitmap $portraitWidth,$portraitHeight
    $graphics = [System.Drawing.Graphics]::FromImage($portrait)
    try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($sourceImage, 0, 0, $portraitWidth, $portraitHeight)
        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
        $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
        $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality),([long]88)
        $portrait.Save((Join-Path $siteRoot 'assets\hao-yu-portrait.jpg'), $encoder, $parameters)
        $parameters.Dispose()
        Write-Output "Portrait: $portraitWidth x $portraitHeight"
    } finally { $graphics.Dispose(); $portrait.Dispose() }
} finally { $sourceImage.Dispose() }

$card = New-Object System.Drawing.Bitmap 1200,630
$canvas = [System.Drawing.Graphics]::FromImage($card)
try {
    $canvas.Clear([System.Drawing.ColorTranslator]::FromHtml('#fafaf8'))
    $canvas.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $inkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#172322'))
    $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#1b514b'))
    $mutedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#526160'))
    $nameFont = New-Object System.Drawing.Font 'Georgia',64,([System.Drawing.FontStyle]::Bold)
    $textFont = New-Object System.Drawing.Font 'Arial',24
    $smallFont = New-Object System.Drawing.Font 'Arial',17
    $canvas.FillRectangle($accentBrush, 70, 80, 72, 5)
    $canvas.DrawString('Hao Yu', $nameFont, $inkBrush, 65, 130)
    $canvas.DrawString('PhD researcher in Engineering', $textFont, $inkBrush, 70, 280)
    $canvas.DrawString('University of Cambridge', $textFont, $mutedBrush, 70, 330)
    $canvas.DrawString('Low-dimensional materials | Synthesis | Spectroscopy', $smallFont, $accentBrush, 70, 445)
    $canvas.DrawString('Thesis submitted 30 September 2026', $smallFont, $mutedBrush, 70, 505)
    $card.Save((Join-Path $siteRoot 'assets\og-image.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    $inkBrush.Dispose(); $accentBrush.Dispose(); $mutedBrush.Dispose()
    $nameFont.Dispose(); $textFont.Dispose(); $smallFont.Dispose()
    Write-Output 'Social card: 1200 x 630'
} finally { $canvas.Dispose(); $card.Dispose() }
