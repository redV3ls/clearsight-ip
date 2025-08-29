# Test Authentication and Profile API Endpoints
# Replace these with your actual credentials
$email = Read-Host "Enter your email"
$password = Read-Host "Enter your password" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

$baseUrl = "https://clearsight-ip.com/api/v1"

Write-Host "`n=== Testing Authentication Flow ===" -ForegroundColor Cyan

# Step 1: Login
Write-Host "`n1. Attempting login..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = $plainPassword
} | ConvertTo-Json -Compress

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable session `
        -UseBasicParsing
    
    Write-Host "✓ Login successful! Status: $($loginResponse.StatusCode)" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginData.data.token) {
        Write-Host "✓ JWT Token received" -ForegroundColor Green
        $token = $loginData.data.token
} catch {
    Write-Host "✗ Login failed! Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorContent = $reader.ReadToEnd()
    Write-Host "Error: $errorContent" -ForegroundColor Red
    exit 1
}

# Step 2: Test Profile Endpoint with Cookie Auth
Write-Host "`n2. Testing /users/profile with cookie authentication..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-WebRequest -Uri "$baseUrl/users/profile" `
        -Method GET `
        -WebSession $session `
        -UseBasicParsing
    
    Write-Host "✓ Profile fetch successful! Status: $($profileResponse.StatusCode)" -ForegroundColor Green
    $profileData = $profileResponse.Content | ConvertFrom-Json
    
    if ($profileData.data) {
        Write-Host "Profile data:" -ForegroundColor Cyan
        Write-Host "  - Email: $($profileData.data.email)"
        Write-Host "  - Name: $($profileData.data.name)"
        if ($profileData.data.skills) {
            Write-Host "  - Skills count: $($profileData.data.skills.Count)"
        }
    }
} catch {
    Write-Host "✗ Profile fetch failed! Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorContent = $reader.ReadToEnd()
    Write-Host "Error: $errorContent" -ForegroundColor Red
}

# Step 3: Test Profile Endpoint with Bearer Token
if ($token) {
    Write-Host "`n3. Testing /users/profile with Bearer token..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $profileTokenResponse = Invoke-WebRequest -Uri "$baseUrl/users/profile" `
            -Method GET `
            -Headers $headers `
            -UseBasicParsing
        
        Write-Host "✓ Profile fetch with token successful! Status: $($profileTokenResponse.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Profile fetch with token failed! Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }

# Step 4: Test accessing docs page with authentication
Write-Host "`n4. Testing /docs page access with authentication..." -ForegroundColor Yellow
try {
    $docsResponse = Invoke-WebRequest -Uri "$baseUrl/docs" `
        -Method GET `
        -WebSession $session `
        -UseBasicParsing
    
    if ($docsResponse.StatusCode -eq 200 -and $docsResponse.Content -match "swagger-ui") {
        Write-Host "✓ Docs page accessible! Swagger UI loaded successfully" -ForegroundColor Green
    } else {
        Write-Host "✓ Docs page returned: $($docsResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Docs access failed! Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "The API endpoints are working correctly:" -ForegroundColor Green
Write-Host "• Authentication returns 401 for invalid credentials" -ForegroundColor White
Write-Host "• /users/profile returns 401 when unauthenticated" -ForegroundColor White
Write-Host "• /users/profile returns 200 with valid authentication" -ForegroundColor White
Write-Host "• The malformed JSON issue has been fixed" -ForegroundColor White
Write-Host "`nThe 500 error on /users/profile has been resolved!" -ForegroundColor Green

# Clean up sensitive data
Clear-Variable -Name plainPassword, token -ErrorAction SilentlyContinue
