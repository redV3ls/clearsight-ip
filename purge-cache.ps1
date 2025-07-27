# Cloudflare Cache Purge Script
# Replace these with your actual values
$ZONE_ID = "YOUR_ZONE_ID"
$API_TOKEN = "YOUR_API_TOKEN"

# Purge everything
$headers = @{
    "Authorization" = "Bearer $API_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    purge_everything = $true
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" `
    -Method POST `
    -Headers $headers `
    -Body $body

Write-Host "Cache purge result: $($response.success)"
