# PowerShell Script zum Testen des Mailjet Webhooks

Write-Host "🚀 Testing Mailjet Webhook with PowerShell" -ForegroundColor Green
Write-Host "=" * 50

# Test URLs
$webhookUrl = "https://a4plus.eu/api/emails/mailjet-webhook"
$webhookUrlWww = "https://www.a4plus.eu/api/emails/mailjet-webhook"

# Sample payload
$payload = @{
    event = "email"
    from_email = "samuel.behr7@gmail.com"
    from_name = "Samuel Behr"
    email = "info@a4plus.eu"
    subject = "PowerShell Test Email"
    text_part = "Dies ist ein Test von PowerShell"
    MessageID = "test-ps-$(Get-Date -Format 'yyyyMMddHHmmss')"
    time = [int][double]::Parse((Get-Date -UFormat %s))
} | ConvertTo-Json

Write-Host "`n🔍 Testing GET endpoint (without www)..." -ForegroundColor Yellow
Write-Host "URL: $webhookUrl"

try {
    $getResponse = Invoke-WebRequest -Uri $webhookUrl -Method GET -UseBasicParsing
    Write-Host "✅ Status: $($getResponse.StatusCode)" -ForegroundColor Green
    Write-Host "📄 Response: $($getResponse.Content.Substring(0, [Math]::Min(200, $getResponse.Content.Length)))"
} catch {
    Write-Host "❌ GET Request failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📊 Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host "`n🧪 Testing POST endpoint (without www)..." -ForegroundColor Yellow
Write-Host "URL: $webhookUrl"
Write-Host "Payload: $payload"

try {
    $postResponse = Invoke-WebRequest -Uri $webhookUrl -Method POST -Body "[$payload]" -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ POST Status: $($postResponse.StatusCode)" -ForegroundColor Green
    Write-Host "📄 POST Response: $($postResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ POST Request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "📊 Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "🔗 Location Header: $($_.Exception.Response.Headers['Location'])" -ForegroundColor Yellow
    }
}

Write-Host "`n🔍 Testing GET endpoint (with www)..." -ForegroundColor Yellow
Write-Host "URL: $webhookUrlWww"

try {
    $getResponseWww = Invoke-WebRequest -Uri $webhookUrlWww -Method GET -UseBasicParsing
    Write-Host "✅ Status: $($getResponseWww.StatusCode)" -ForegroundColor Green
    Write-Host "📄 Response: $($getResponseWww.Content.Substring(0, [Math]::Min(200, $getResponseWww.Content.Length)))"
} catch {
    Write-Host "❌ GET Request failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📊 Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host "`n🧪 Testing POST endpoint (with www)..." -ForegroundColor Yellow
Write-Host "URL: $webhookUrlWww"

try {
    $postResponseWww = Invoke-WebRequest -Uri $webhookUrlWww -Method POST -Body "[$payload]" -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ POST Status: $($postResponseWww.StatusCode)" -ForegroundColor Green
    Write-Host "📄 POST Response: $($postResponseWww.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ POST Request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "📊 Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n" + "=" * 50
Write-Host "🏁 PowerShell webhook test completed" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check if any requests returned HTTP 200" -ForegroundColor White
Write-Host "2. Look for redirect responses (3xx status codes)" -ForegroundColor White
Write-Host "3. Update vercel.json to fix API route redirects" -ForegroundColor White
