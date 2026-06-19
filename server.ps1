# Anas Ahmad Fabrics Local Development Web Server
# Serves static files locally on http://localhost:8000/

$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    Write-Error "Failed to start listener on port $port. Check if port is already in use."
    exit 1
}

Write-Host "========================================="
Write-Host " Anas Ahmad Fabrics Local Server Started "
Write-Host " URL: http://localhost:$port/             "
Write-Host " Press Ctrl+C in terminal to stop server. "
Write-Host "========================================="

# Launch in default browser
Start-Process "http://localhost:$port/"

# Get current script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrEmpty($scriptDir)) {
    $scriptDir = Get-Location
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $url = $request.Url.LocalPath
        if ($url -eq "/") {
            $url = "/index.html"
        }

        # Match local file path
        $localPath = [System.IO.Path]::Combine($scriptDir, $url.TrimStart('/'))

        if (Test-Path $localPath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css" }
                ".js"   { "application/javascript" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif"  { "image/gif" }
                ".svg"  { "image/svg+xml" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }

            $response.ContentType = $contentType
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
    } catch {
        # Catch unexpected errors during single request handling to prevent crash
    } finally {
        if ($null -ne $response) {
            try {
                $response.Close()
            } catch {}
        }
    }
}
