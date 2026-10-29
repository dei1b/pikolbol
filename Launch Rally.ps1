$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
$taskPort = 8787
$taskUrl = "http://127.0.0.1:$taskPort"
try {
    $taskHealth = $null
    try { $taskHealth = Invoke-RestMethod "$taskUrl/offline-health" -TimeoutSec 2 } catch {}
    if ($taskHealth.app -ne 'rally-offline') {
        $taskNode = Join-Path $taskRoot 'runtime\node.exe'
        if (!(Test-Path -LiteralPath $taskNode)) { $taskNode = (Get-Command node.exe -ErrorAction Stop).Source }
        Start-Process -FilePath $taskNode -ArgumentList @('"' + (Join-Path $taskRoot 'server.mjs') + '"') -WorkingDirectory $taskRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskRoot 'server.log') -RedirectStandardError (Join-Path $taskRoot 'server-error.log')
        for ($taskTry = 0; $taskTry -lt 40; $taskTry++) {
            Start-Sleep -Milliseconds 250
            try { $taskHealth = Invoke-RestMethod "$taskUrl/offline-health" -TimeoutSec 1; if ($taskHealth.app -eq 'rally-offline') { break } } catch {}
        }
        if ($taskHealth.app -ne 'rally-offline') { throw 'The local game server could not start. Check server-error.log in the game folder.' }
    }
    $taskEdge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object {Test-Path -LiteralPath $_} | Select-Object -First 1
    if ($taskEdge) { Start-Process -FilePath $taskEdge -ArgumentList "--app=$taskUrl" } else { Start-Process $taskUrl }
} catch {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show($_.Exception.Message, 'Rally Offline') | Out-Null
}
