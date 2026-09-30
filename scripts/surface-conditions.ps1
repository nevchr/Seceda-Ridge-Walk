param([string]$Stage = 'initial')
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class SecedaPower { [StructLayout(LayoutKind.Sequential)] public struct Status { public byte ACLineStatus, BatteryFlag, BatteryLifePercent, SystemStatusFlag; public uint BatteryLifeTime, BatteryFullLifeTime; } [DllImport("kernel32.dll")] public static extern bool GetSystemPowerStatus(out Status s); }'
Add-Type -AssemblyName System.Windows.Forms
$status = New-Object SecedaPower+Status
[SecedaPower]::GetSystemPowerStatus([ref]$status) | Out-Null
$result = [ordered]@{ time=(Get-Date -Format o); stage=$Stage; acOnline=($status.ACLineStatus -eq 1); batteryPercent=$status.BatteryLifePercent; batterySaver=$status.SystemStatusFlag; scheme=(powercfg /getactivescheme | Out-String).Trim(); displays=@([System.Windows.Forms.Screen]::AllScreens | ForEach-Object { @{name=$_.DeviceName; primary=$_.Primary; width=$_.Bounds.Width; height=$_.Bounds.Height} }); note='Windows reported AC and active power scheme. No system power settings changed. Render-buffer size and GPU are recorded separately inside each game run.' }
if (Get-Command nvidia-smi -ErrorAction SilentlyContinue) { $result.gpuTelemetry = (nvidia-smi --query-gpu=name,temperature.gpu,power.draw,pstate,clocks.gr,clocks.mem --format=csv | Out-String).Trim() }
$result | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 "artifacts/surface-v015/conditions-$Stage.json"
$result | ConvertTo-Json -Depth 5
