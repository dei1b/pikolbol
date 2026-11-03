$ErrorActionPreference='Stop'
$taskRoot=$PSScriptRoot
$taskSdk=Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$taskTools=Join-Path $taskSdk 'build-tools\35.0.0'
$taskJava='C:\Program Files\Java\jdk-21\bin'
$taskPlatform=Join-Path $taskSdk 'platforms\android-35\android.jar'
$taskBuild=Join-Path $taskRoot 'build'
New-Item -ItemType Directory -Force -Path $taskBuild,(Join-Path $taskBuild 'classes'),(Join-Path $taskBuild 'dex'),(Join-Path $taskRoot 'res\drawable') | Out-Null
Copy-Item -LiteralPath (Join-Path $taskRoot '..\site\icons\icon-192.png') -Destination (Join-Path $taskRoot 'res\drawable\icon.png')
function Invoke-BuildTool($taskExe,$taskArgs){ & $taskExe @taskArgs; if($LASTEXITCODE -ne 0){throw "Build tool failed: $taskExe"} }
Invoke-BuildTool (Join-Path $taskTools 'aapt.exe') @('package','-f','--ignore-assets','!.git:!.svn:.*:*~','-M',(Join-Path $taskRoot 'AndroidManifest.xml'),'-S',(Join-Path $taskRoot 'res'),'-A',(Join-Path $taskRoot '..\site'),'-I',$taskPlatform,'-F',(Join-Path $taskBuild 'resources.apk'))
$taskSources=@(Get-ChildItem -LiteralPath (Join-Path $taskRoot 'src') -Filter '*.java' -Recurse | ForEach-Object {$_.FullName})
Invoke-BuildTool (Join-Path $taskJava 'javac.exe') (@('--release','8','-classpath',$taskPlatform,'-d',(Join-Path $taskBuild 'classes'))+$taskSources)
Invoke-BuildTool (Join-Path $taskJava 'jar.exe') @('--create','--file',(Join-Path $taskBuild 'classes.jar'),'-C',(Join-Path $taskBuild 'classes'),'.')
$taskOldJava=$env:JAVA_HOME
try{
 $env:JAVA_HOME=Split-Path $taskJava
 Invoke-BuildTool (Join-Path $taskTools 'd8.bat') @('--lib',$taskPlatform,'--min-api','26','--output',(Join-Path $taskBuild 'dex'),(Join-Path $taskBuild 'classes.jar'))
 Copy-Item -LiteralPath (Join-Path $taskBuild 'resources.apk') -Destination (Join-Path $taskBuild 'unsigned.apk')
 Push-Location (Join-Path $taskBuild 'dex')
 try {Invoke-BuildTool (Join-Path $taskTools 'aapt.exe') @('add',(Join-Path $taskBuild 'unsigned.apk'),'classes.dex')} finally {Pop-Location}
 Invoke-BuildTool (Join-Path $taskTools 'zipalign.exe') @('-f','4',(Join-Path $taskBuild 'unsigned.apk'),(Join-Path $taskBuild 'aligned.apk'))
 $taskKey=Join-Path $taskRoot 'rally-local.keystore'
 if(!(Test-Path -LiteralPath $taskKey)){Invoke-BuildTool (Join-Path $taskJava 'keytool.exe') @('-genkeypair','-keystore',$taskKey,'-storepass','rally-offline-local','-keypass','rally-offline-local','-alias','rally','-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=Rally Offline Local')}
 Invoke-BuildTool (Join-Path $taskTools 'apksigner.bat') @('sign','--ks',$taskKey,'--ks-pass','pass:rally-offline-local','--key-pass','pass:rally-offline-local','--out',(Join-Path $taskRoot 'Rally-Offline.apk'),(Join-Path $taskBuild 'aligned.apk'))
 Invoke-BuildTool (Join-Path $taskTools 'apksigner.bat') @('verify','--verbose',(Join-Path $taskRoot 'Rally-Offline.apk'))
}finally{$env:JAVA_HOME=$taskOldJava}
Get-Item -LiteralPath (Join-Path $taskRoot 'Rally-Offline.apk') | Select-Object FullName,Length
