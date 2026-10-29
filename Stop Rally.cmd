@echo off
powershell.exe -NoProfile -WindowStyle Hidden -Command "try { Invoke-WebRequest -UseBasicParsing -Method Post -Uri 'http://127.0.0.1:8787/offline-stop' | Out-Null } catch {}"
