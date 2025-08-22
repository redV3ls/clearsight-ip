// Test Narrative UI HTML content for Cloudflare Workers
export const TEST_NARRATIVE_UI_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Narrative CV Analysis Test</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .input-section {
            margin-bottom: 30px;
        }
        textarea {
            width: 100%;
            min-height: 150px;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
        }
        button {
            background: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        button:hover {
            background: #0056b3;
        }
        .results {
            margin-top: 30px;
        }
        .narrative {
            background: #f8f9fa;
            padding: 20px;
            border-left: 4px solid #007bff;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .section h3 {
            color: #333;
            margin-top: 0;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
        }
        .tab {
            padding: 10px 20px;
            background: #e9ecef;
            border: none;
            cursor: pointer;
            border-radius: 8px 8px 0 0;
            margin-right: 5px;
        }
        .tab.active {
            background: #007bff;
            color: white;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
    <div class="container">
        <h1>🎯 Narrative CV Analysis Test</h1>
        <p>Test the enhanced narrative-driven CV analysis that provides personalized career guidance.</p>
        
        <div class="input-section">
            <h2>Input</h2>
            <div>
                <label for="resumeText"><strong>Resume/CV Content:</strong></label>
                <textarea id="resumeText" placeholder="Paste your resume content here...">John Smith
Senior Software Engineer
Email: john.smith@email.com

PROFESSIONAL SUMMARY:
Experienced software engineer with 5+ years in full-stack development. Passionate about building scalable web applications and leading development teams.

EXPERIENCE:
Senior Software Engineer | TechCorp Inc. | 2020-2024
- Led development of microservices architecture serving 1M+ users
- Built responsive web applications using React and Node.js
- Implemented CI/CD pipelines reducing deployment time by 60%
- Mentored 3 junior developers and conducted code reviews

Full Stack Developer | StartupXYZ | 2018-2020
- Developed e-commerce platform from scratch using MERN stack
- Integrated payment systems and third-party APIs
- Optimized database queries improving performance by 40%

TECHNICAL SKILLS:
- Languages: JavaScript, TypeScript, Python, Java
- Frontend: React, Vue.js, HTML5, CSS3, SASS
- Backend: Node.js, Express, Django, Spring Boot
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes
- Tools: Git, Jenkins, JIRA, Figma

EDUCATION:
Bachelor of Science in Computer Science
State University | 2014-2018
GPA: 3.7/4.0

CERTIFICATIONS:
- AWS Certified Solutions Architect
- Certified Kubernetes Administrator</textarea>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #007bff;">
                <label for="jobDescription"><strong>🎯 Job Description (Optional - for Job Fit Analysis):</strong></label>
                <p style="margin: 10px 0; color: #666; font-size: 14px;">
                    <strong>💡 Pro Tip:</strong> Paste a job description here to get personalized analysis on how well your CV matches the role, 
                    including specific gap analysis and recommendations for improvement.
                </p>
                <textarea id="jobDescription" placeholder="Paste the complete job description here for detailed job fit analysis...

Example:
Senior Software Engineer - Frontend Focus
Company: TechCorp Inc.

Requirements:
- 5+ years of React development experience
- Strong TypeScript skills
- Experience with modern CI/CD pipelines
- Bachelor's degree in Computer Science or equivalent

Responsibilities:
- Lead frontend development initiatives
- Mentor junior developers
- Collaborate with design and product teams
...">Senior Full Stack Engineer
TechStartup Inc. | Remote

We're seeking a Senior Full Stack Engineer to join our innovative team building the next generation of fintech solutions.

REQUIREMENTS:
- 5+ years of full-stack development experience
- Expert-level proficiency in React and Node.js
- Strong experience with TypeScript
- Experience with cloud platforms (AWS preferred)
- Knowledge of microservices architecture
- Experience with containerization (Docker, Kubernetes)
- Understanding of financial systems and regulations (preferred)
- Strong problem-solving skills and attention to detail

RESPONSIBILITIES:
- Design and develop scalable web applications
- Collaborate with product and design teams
- Implement security best practices
- Optimize application performance
- Mentor junior developers

NICE TO HAVE:
- Experience with GraphQL
- Knowledge of blockchain technology
- Previous fintech experience
- DevOps experience</textarea>
            </div>
        </div>
        
        <div style="margin: 20px 0;">
            <button onclick="analyzeCV()" style="background: #28a745; font-size: 18px; padding: 15px 30px;">🔍 Analyze CV</button>
            <button onclick="clearJobDescription()" style="background: #ffc107; color: #000;">🗑️ Clear Job Description</button>
            <button onclick="clearResults()" style="background: #dc3545;">🗑️ Clear Results</button>
            
            <div id="analysisTypeIndicator" style="margin-top: 15px; padding: 10px; background: #e9ecef; border-radius: 5px; display: none;">
                <strong>Analysis Type:</strong> <span id="analysisTypeText"></span>
            </div>
        </div>
        
        <div id="results" class="results"></div>
    </div>

    <script>
        let currentAnalysisId = null;

        async function analyzeCV() {
            const resumeText = document.getElementById('resumeText').value.trim();
            const jobDescription = document.getElementById('jobDescription').value.trim();
            
            if (!resumeText) {
                showError('Please provide resume content');
                return;
            }
            
            // Show analysis type
            updateAnalysisTypeIndicator();
            
            const analysisType = jobDescription ? 'Job Fit Analysis' : 'Standalone Career Analysis';
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = \`
                <div class="loading">
                    🔄 Performing \${analysisType}... This may take up to 2 minutes.
                    <br><br>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px;">
                        <strong>What's happening:</strong><br>
                        \${jobDescription ? 
                            '• Analyzing your CV against the job requirements<br>• Identifying skill gaps and strengths<br>• Generating personalized recommendations' : 
                            '• Analyzing your career progression<br>• Identifying improvement opportunities<br>• Suggesting career development paths'
                        }
                    </div>
                </div>
            \`;
            
            try {
                // Submit analysis
                const formData = new FormData();
                formData.append('resumeText', resumeText);
                if (jobDescription) {
                    formData.append('jobDescriptionText', jobDescription);
                }
                
                const response = await fetch('/api/v1/analyze/resume', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    currentAnalysisId = result.analysis_id;
                    showSuccess(\`Analysis submitted successfully! ID: \${result.analysis_id}\`);
                    
                    // Poll for results
                    pollForResults(result.analysis_id);
                } else {
                    showError(\`Analysis failed: \${result.error?.message || 'Unknown error'}\`);
                }
                
            } catch (error) {
                showError(\`Network error: \${error.message}\`);
            }
        }
        
        async function pollForResults(analysisId) {
            const maxAttempts = 30; // 5 minutes max
            let attempts = 0;
            
            const poll = async () => {
                attempts++;
                
                try {
                    const response = await fetch(`/api/v1/analyze/resume/${analysisId}`, { credentials: 'include' });
                    const result = await response.json();
                    
                    console.log(\`[POLL-\${attempts}] Status: \${result.status}\`, result);
                    
                    if (result.status === 'completed') {
                        console.log('✅ Analysis completed! Displaying results...');
                        displayResults(result);
                    } else if (result.status === 'failed') {
                        console.error('❌ Analysis failed:', result.error);
                        showError(\`Analysis failed: \${result.error?.message || result.error?.user_message || 'Unknown error'}\`);
                    } else if (attempts < maxAttempts) {
                        // Still processing, check again in 10 seconds
                        console.log(\`⏳ Still processing... attempt \${attempts}/\${maxAttempts}\`);
                        setTimeout(poll, 10000);
                        updateLoadingMessage(attempts);
                    } else {
                        console.error('⏰ Analysis timed out after', maxAttempts, 'attempts');
                        showError('Analysis timed out. Please try again.');
                    }
                    
                } catch (error) {
                    console.error(\`❌ Polling error on attempt \${attempts}:\`, error);
                    if (attempts < maxAttempts) {
                        setTimeout(poll, 10000);
                    } else {
                        showError(\`Polling failed: \${error.message}\`);
                    }
                }
            };
            
            poll();
        }
        
        function updateLoadingMessage(attempts) {
            const resultsDiv = document.getElementById('results');
            const dots = '.'.repeat((attempts % 3) + 1);
            resultsDiv.innerHTML = \`<div class="loading">🔄 Analyzing your CV\${dots} (\${attempts * 10}s elapsed)</div>\`;
        }
        
        function displayResults(analysis) {
            console.log('🎨 Displaying results:', analysis);
            const resultsDiv = document.getElementById('results');
            
            let html = '<h2>📊 Analysis Results</h2>';
            
            // Show analysis type and job description status
            const hasJobDescription = analysis.hasJobDescription || analysis.analysisType === 'job-comparison';
            const analysisTypeLabel = hasJobDescription ? 'Job Fit Analysis' : 'Standalone Career Analysis';
            
            html += \`
                <div class="success" style="margin-bottom: 20px;">
                    ✅ \${analysisTypeLabel} completed successfully!
                    \${hasJobDescription ? '<br>📋 Job description was analyzed for fit assessment' : ''}
                </div>
            \`;
            
            // Show the main narrative content (this is the key improvement)
            if (analysis.narrative) {
                // Parse Markdown and linkify URLs for clickable links
                let narrativeHtml = (typeof marked !== 'undefined') 
                    ? marked.parse(analysis.narrative)
                    : analysis.narrative.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
                // Ensure anchors open in a new tab and are safe
                narrativeHtml = narrativeHtml.replace(/<a\s+href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
                // Autolink bare URLs
                narrativeHtml = narrativeHtml.replace(/(^|[^"'>])(https?:\/\/[^\s<]+)/g, (m, p, url) => p + '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>');

                html += 
                    '<div class="narrative" style="background: #f0f8ff; border-left: 4px solid #007bff; padding: 25px; margin: 20px 0; border-radius: 8px;">' +
                        '<h3>📖 ' + (hasJobDescription ? 'Your Job Fit Analysis' : 'Your Career Story') + '</h3>' +
                        '<div style="line-height: 1.6; font-size: 16px;">' +
                            narrativeHtml +
                        '</div>' +
                    '</div>';
            }
            
            // Analysis metadata
            html += \`
                <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 14px; color: #666;">
                    <h4 style="margin-top: 0; color: #333;">📊 Analysis Details</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        <div><strong>Analysis ID:</strong> \${analysis.analysisId || analysis.analysis_id || 'N/A'}</div>
                        <div><strong>Type:</strong> \${analysis.analysisType || (hasJobDescription ? 'job-comparison' : 'standalone')}</div>
                        <div><strong>Word Count:</strong> \${analysis.wordCount || 'N/A'}</div>
                        <div><strong>Processing Time:</strong> \${analysis.processingTime ? Math.round(analysis.processingTime/1000) + 's' : 'N/A'}</div>
                        <div><strong>AI Provider:</strong> \${analysis.aiProvider || 'DeepSeek'}</div>
                        <div><strong>Timestamp:</strong> \${analysis.timestamp ? new Date(analysis.timestamp).toLocaleString() : 'N/A'}</div>
                    </div>
                </div>
            \`;
            
            resultsDiv.innerHTML = html;
        }
        
        function showError(message) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = \`<div class="error">❌ \${message}</div>\`;
        }
        
        function showSuccess(message) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = \`<div class="success">✅ \${message}</div>\`;
        }
        
        function clearResults() {
            document.getElementById('results').innerHTML = '';
            document.getElementById('analysisTypeIndicator').style.display = 'none';
            currentAnalysisId = null;
        }
        
        function clearJobDescription() {
            document.getElementById('jobDescription').value = '';
            updateAnalysisTypeIndicator();
        }
        
        function updateAnalysisTypeIndicator() {
            const jobDescription = document.getElementById('jobDescription').value.trim();
            const indicator = document.getElementById('analysisTypeIndicator');
            const typeText = document.getElementById('analysisTypeText');
            
            if (jobDescription) {
                typeText.textContent = '🎯 Job Fit Analysis - Your CV will be analyzed against the specific job requirements';
                indicator.style.display = 'block';
                indicator.style.background = '#d4edda';
                indicator.style.borderLeft = '4px solid #28a745';
            } else {
                typeText.textContent = '📖 Standalone Career Analysis - General career guidance and improvement suggestions';
                indicator.style.display = 'block';
                indicator.style.background = '#fff3cd';
                indicator.style.borderLeft = '4px solid #ffc107';
            }
        }
        
        // Update analysis type indicator when job description changes
        document.addEventListener('DOMContentLoaded', function() {
            const jobDescField = document.getElementById('jobDescription');
            jobDescField.addEventListener('input', updateAnalysisTypeIndicator);
            updateAnalysisTypeIndicator(); // Initial call
        });
    </script>
</body>
</html>`;