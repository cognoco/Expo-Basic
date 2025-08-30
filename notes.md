 1. Call Windows commands from WSL2:
  # In WSL2, you can run Windows executables
  ip=$(/mnt/c/Windows/System32/ipconfig.exe | grep -A 4 "Wi-Fi" | grep "IPv4" | awk '{print $NF}')
  2. Use PowerShell from WSL2:
  ip=$(powershell.exe -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {\$_.InterfaceAlias -like '*Wi-Fi*'} | Select-Object -ExpandProperty IPAddress")