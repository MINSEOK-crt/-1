$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = Get-Command node -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
$nodePath = if ($node) { $node.Source } else {
    Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
}
if (-not (Test-Path -LiteralPath $nodePath -PathType Leaf)) {
    throw 'Install Node.js 20 or later to run the Gemini demo.'
}
if ($env:GEMINI_API_KEY) {
    & $nodePath (Join-Path $projectPath 'server.mjs') 8765 --open
    exit $LASTEXITCODE
}
$secret = Read-Host 'Enter your Gemini API key (hidden)' -AsSecureString
if (-not $secret.Length) {
    throw 'A Gemini API key is required.'
}
$keyPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
try {
    $env:GEMINI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPtr)
    & $nodePath (Join-Path $projectPath 'server.mjs') 8765 --open
    exit $LASTEXITCODE
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPtr)
    Remove-Item Env:GEMINI_API_KEY -ErrorAction SilentlyContinue
    $secret.Dispose()
}
