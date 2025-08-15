// Charts Component for Analysis Workspace
window.Charts = {
    // Initialize chart library (using Chart.js as example)
    init() {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            this.loadChartJS().then(() => {
                this.setupChartDefaults();
            });
        } else {
            this.setupChartDefaults();
        }
    },

    async loadChartJS() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    },

    setupChartDefaults() {
        if (typeof Chart === 'undefined') return;

        Chart.defaults.color = '#e2e8f0'; // text-gray-200
        Chart.defaults.backgroundColor = '#14b8a6'; // primary color
        Chart.defaults.borderColor = '#475569'; // slate-600
        Chart.defaults.font.family = 'Inter, sans-serif';
    },

    // Skill Coverage Bar Chart
    renderSkillCoverageChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || typeof Chart === 'undefined') return;

        // Clear existing chart
        const existingChart = Chart.getChart(container);
        if (existingChart) existingChart.destroy();

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        const skillsData = data.skills || this.getMockSkillsData();
        
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: skillsData.map(skill => skill.name),
                datasets: [{
                    label: 'Skill Coverage',
                    data: skillsData.map(skill => skill.coverage),
                    backgroundColor: skillsData.map(skill => this.getSkillColor(skill.status)),
                    borderColor: skillsData.map(skill => this.getSkillBorderColor(skill.status)),
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#e2e8f0',
                        bodyColor: '#e2e8f0',
                        borderColor: '#475569',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const skill = skillsData[context.dataIndex];
                                return [
                                    `Coverage: ${context.parsed.y}%`,
                                    `Status: ${skill.status}`,
                                    `Evidence: ${skill.evidence || 'None'}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#334155',
                            drawBorder: false
                        },
                        ticks: {
                            maxRotation: 45,
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: '#334155',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            callback: (value) => value + '%'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    },

    // Competency Radar Chart
    renderCompetencyRadar(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(container);
        if (existingChart) existingChart.destroy();

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        const competencyData = data.competencies || this.getMockCompetencyData();

        new Chart(canvas, {
            type: 'radar',
            data: {
                labels: competencyData.map(comp => comp.category),
                datasets: [{
                    label: 'Your Skills',
                    data: competencyData.map(comp => comp.current),
                    backgroundColor: 'rgba(20, 184, 166, 0.2)',
                    borderColor: '#14b8a6',
                    borderWidth: 2,
                    pointBackgroundColor: '#14b8a6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }, {
                    label: 'Job Requirements',
                    data: competencyData.map(comp => comp.required),
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#e2e8f0',
                        bodyColor: '#e2e8f0',
                        borderColor: '#475569',
                        borderWidth: 1
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: '#334155'
                        },
                        angleLines: {
                            color: '#334155'
                        },
                        pointLabels: {
                            color: '#94a3b8',
                            font: {
                                size: 12
                            }
                        },
                        ticks: {
                            color: '#64748b',
                            backdropColor: 'transparent',
                            callback: (value) => value + '%'
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                }
            }
        });
    },

    // Coverage Heatmap
    renderCoverageHeatmap(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = ''; // Clear existing content

        const heatmapData = data.heatmap || this.getMockHeatmapData();
        
        // Create heatmap using CSS Grid
        const heatmap = document.createElement('div');
        heatmap.className = 'coverage-heatmap';
        heatmap.style.cssText = `
            display: grid;
            grid-template-columns: 150px repeat(${heatmapData.cvSections.length}, 1fr);
            gap: 2px;
            padding: 16px;
            background: #1e293b;
            border-radius: 8px;
        `;

        // Add header row
        const cornerCell = document.createElement('div');
        cornerCell.className = 'heatmap-cell header';
        cornerCell.textContent = 'JD Sections';
        cornerCell.style.cssText = 'padding: 8px; font-weight: 600; color: #e2e8f0; background: #334155; border-radius: 4px;';
        heatmap.appendChild(cornerCell);

        heatmapData.cvSections.forEach(section => {
            const headerCell = document.createElement('div');
            headerCell.className = 'heatmap-cell header';
            headerCell.textContent = section;
            headerCell.style.cssText = `
                padding: 8px;
                font-weight: 600;
                color: #e2e8f0;
                background: #334155;
                border-radius: 4px;
                font-size: 12px;
                text-align: center;
                writing-mode: vertical-rl;
                text-orientation: mixed;
            `;
            heatmap.appendChild(headerCell);
        });

        // Add data rows
        heatmapData.jdSections.forEach((jdSection, rowIndex) => {
            // Row header
            const rowHeader = document.createElement('div');
            rowHeader.className = 'heatmap-cell row-header';
            rowHeader.textContent = jdSection;
            rowHeader.style.cssText = `
                padding: 8px;
                font-weight: 500;
                color: #e2e8f0;
                background: #334155;
                border-radius: 4px;
                font-size: 12px;
                display: flex;
                align-items: center;
            `;
            heatmap.appendChild(rowHeader);

            // Data cells
            heatmapData.cvSections.forEach((cvSection, colIndex) => {
                const coverage = heatmapData.coverage[rowIndex][colIndex];
                const cell = document.createElement('div');
                cell.className = 'heatmap-cell data';
                cell.textContent = coverage + '%';
                
                const intensity = coverage / 100;
                const backgroundColor = this.getHeatmapColor(intensity);
                
                cell.style.cssText = `
                    padding: 12px 8px;
                    text-align: center;
                    font-weight: 600;
                    color: ${intensity > 0.5 ? '#ffffff' : '#1e293b'};
                    background: ${backgroundColor};
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                `;
                
                cell.addEventListener('mouseenter', () => {
                    cell.style.transform = 'scale(1.05)';
                    this.showHeatmapTooltip(cell, jdSection, cvSection, coverage);
                });
                
                cell.addEventListener('mouseleave', () => {
                    cell.style.transform = 'scale(1)';
                    this.hideHeatmapTooltip();
                });
                
                heatmap.appendChild(cell);
            });
        });

        container.appendChild(heatmap);
    },

    // Seniority/Years Stacked Bar Chart
    renderSeniorityChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(container);
        if (existingChart) existingChart.destroy();

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        const seniorityData = data.seniority || this.getMockSeniorityData();

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: seniorityData.map(item => item.role),
                datasets: [{
                    label: 'Required Years',
                    data: seniorityData.map(item => item.required),
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                    borderWidth: 1
                }, {
                    label: 'Your Experience',
                    data: seniorityData.map(item => item.current),
                    backgroundColor: '#14b8a6',
                    borderColor: '#0d9488',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#e2e8f0',
                        bodyColor: '#e2e8f0',
                        borderColor: '#475569',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${context.parsed.y} years`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#334155',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#334155',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            callback: (value) => value + ' yrs'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    },

    // Fit Gauge (SVG-based)
    renderFitGauge(containerId, percentage, size = 128) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const radius = (size - 16) / 2;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = (percentage / 100) * circumference;

        container.innerHTML = `
            <div class="fit-gauge" style="width: ${size}px; height: ${size}px;">
                <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                    <circle 
                        cx="${size/2}" 
                        cy="${size/2}" 
                        r="${radius}" 
                        class="gauge-bg"
                        stroke="#475569"
                        stroke-width="8"
                        fill="none"
                    ></circle>
                    <circle 
                        cx="${size/2}" 
                        cy="${size/2}" 
                        r="${radius}" 
                        class="gauge-fill"
                        stroke="#14b8a6"
                        stroke-width="8"
                        fill="none"
                        stroke-linecap="round"
                        stroke-dasharray="${strokeDasharray} ${circumference}"
                        stroke-dashoffset="0"
                        transform="rotate(-90 ${size/2} ${size/2})"
                        style="transition: stroke-dasharray 1s ease-in-out;"
                    ></circle>
                    <text 
                        x="${size/2}" 
                        y="${size/2}" 
                        text-anchor="middle" 
                        dy="0.3em" 
                        class="gauge-text"
                        style="font-size: ${size/6}px; font-weight: bold; fill: #e2e8f0;"
                    >
                        ${percentage}%
                    </text>
                </svg>
            </div>
        `;
    },

    // Helper methods
    getSkillColor(status) {
        switch (status) {
            case 'matched': return 'rgba(34, 197, 94, 0.8)';
            case 'partial': return 'rgba(234, 179, 8, 0.8)';
            case 'missing': return 'rgba(239, 68, 68, 0.8)';
            default: return 'rgba(148, 163, 184, 0.8)';
        }
    },

    getSkillBorderColor(status) {
        switch (status) {
            case 'matched': return '#22c55e';
            case 'partial': return '#eab308';
            case 'missing': return '#ef4444';
            default: return '#94a3b8';
        }
    },

    getHeatmapColor(intensity) {
        // Create a color gradient from dark blue to bright teal
        const colors = [
            '#1e293b', // 0%
            '#334155', // 20%
            '#475569', // 40%
            '#0891b2', // 60%
            '#06b6d4', // 80%
            '#14b8a6'  // 100%
        ];
        
        const index = Math.floor(intensity * (colors.length - 1));
        const nextIndex = Math.min(index + 1, colors.length - 1);
        const factor = (intensity * (colors.length - 1)) - index;
        
        if (factor === 0) return colors[index];
        
        // Simple color interpolation
        return this.interpolateColor(colors[index], colors[nextIndex], factor);
    },

    interpolateColor(color1, color2, factor) {
        // Simple hex color interpolation
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },

    showHeatmapTooltip(element, jdSection, cvSection, coverage) {
        const tooltip = document.createElement('div');
        tooltip.id = 'heatmap-tooltip';
        tooltip.className = 'fixed z-50 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white shadow-lg pointer-events-none';
        tooltip.innerHTML = `
            <div class="font-semibold mb-1">Coverage: ${coverage}%</div>
            <div class="text-gray-300">JD: ${jdSection}</div>
            <div class="text-gray-300">CV: ${cvSection}</div>
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
    },

    hideHeatmapTooltip() {
        const tooltip = document.getElementById('heatmap-tooltip');
        if (tooltip) tooltip.remove();
    },

    // Mock data generators
    getMockSkillsData() {
        return [
            { name: 'JavaScript', coverage: 95, status: 'matched', evidence: 'Used extensively' },
            { name: 'React', coverage: 88, status: 'matched', evidence: 'Multiple projects' },
            { name: 'Node.js', coverage: 65, status: 'partial', evidence: 'Some backend work' },
            { name: 'AWS', coverage: 78, status: 'matched', evidence: 'Cloud deployment' },
            { name: 'Docker', coverage: 45, status: 'partial', evidence: 'Basic containerization' },
            { name: 'Kubernetes', coverage: 15, status: 'missing', evidence: 'Not mentioned' },
            { name: 'TypeScript', coverage: 25, status: 'missing', evidence: 'Limited experience' },
            { name: 'GraphQL', coverage: 35, status: 'partial', evidence: 'API development' }
        ];
    },

    getMockCompetencyData() {
        return [
            { category: 'Frontend', current: 85, required: 80 },
            { category: 'Backend', current: 70, required: 85 },
            { category: 'DevOps', current: 45, required: 70 },
            { category: 'Database', current: 75, required: 65 },
            { category: 'Testing', current: 60, required: 75 },
            { category: 'Security', current: 40, required: 60 }
        ];
    },

    getMockHeatmapData() {
        return {
            jdSections: ['Technical Skills', 'Experience', 'Education', 'Certifications', 'Soft Skills'],
            cvSections: ['Summary', 'Skills', 'Work History', 'Education', 'Projects'],
            coverage: [
                [25, 85, 45, 15, 35], // Technical Skills
                [65, 40, 95, 25, 55], // Experience
                [15, 20, 35, 90, 25], // Education
                [10, 75, 20, 80, 15], // Certifications
                [45, 30, 65, 10, 70]  // Soft Skills
            ]
        };
    },

    getMockSeniorityData() {
        return [
            { role: 'Frontend Dev', required: 3, current: 4 },
            { role: 'Backend Dev', required: 4, current: 2 },
            { role: 'DevOps', required: 5, current: 1 },
            { role: 'Team Lead', required: 6, current: 3 }
        ];
    }
};

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.Charts.init();
});

// Auto-render charts when results tabs are shown
document.addEventListener('tabChanged', (event) => {
    const tabName = event.detail.tabName;
    const data = event.detail.data;
    
    setTimeout(() => {
        switch (tabName) {
            case 'skills-gap':
                window.Charts.renderSkillCoverageChart('skillCoverageChart', data);
                window.Charts.renderCompetencyRadar('competencyRadar', data);
                break;
            case 'evidence':
                window.Charts.renderCoverageHeatmap('coverageHeatmap', data);
                break;
        }
    }, 100); // Small delay to ensure DOM is ready
});