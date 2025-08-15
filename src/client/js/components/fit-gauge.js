// Fit Gauge Component
window.FitGauge = {
    // Create and render a fit gauge
    render(containerId, percentage, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const config = {
            size: options.size || 128,
            strokeWidth: options.strokeWidth || 8,
            backgroundColor: options.backgroundColor || '#475569',
            foregroundColor: options.foregroundColor || this.getColorForPercentage(percentage),
            textColor: options.textColor || '#e2e8f0',
            animationDuration: options.animationDuration || 1000,
            showPercentage: options.showPercentage !== false,
            label: options.label || '',
            ...options
        };

        container.innerHTML = this.generateGaugeSVG(percentage, config);
        
        if (config.animationDuration > 0) {
            this.animateGauge(container, percentage, config);
        }
    },

    generateGaugeSVG(percentage, config) {
        const { size, strokeWidth, backgroundColor, foregroundColor, textColor, showPercentage, label } = config;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const center = size / 2;

        return `
            <div class="fit-gauge relative" style="width: ${size}px; height: ${size}px;">
                <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="transform -rotate-90">
                    <!-- Background circle -->
                    <circle 
                        cx="${center}" 
                        cy="${center}" 
                        r="${radius}" 
                        stroke="${backgroundColor}"
                        stroke-width="${strokeWidth}"
                        fill="none"
                        class="gauge-bg"
                    />
                    
                    <!-- Progress circle -->
                    <circle 
                        cx="${center}" 
                        cy="${center}" 
                        r="${radius}" 
                        stroke="${foregroundColor}"
                        stroke-width="${strokeWidth}"
                        fill="none"
                        stroke-linecap="round"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${circumference}"
                        class="gauge-progress transition-all duration-1000 ease-out"
                        style="filter: drop-shadow(0 0 6px ${foregroundColor}40);"
                    />
                </svg>
                
                <!-- Text content -->
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    ${showPercentage ? `
                        <span class="gauge-percentage text-2xl font-bold" style="color: ${textColor}; font-size: ${size/6}px;">
                            ${percentage}%
                        </span>
                    ` : ''}
                    ${label ? `
                        <span class="gauge-label text-xs text-gray-400 mt-1" style="font-size: ${size/16}px;">
                            ${label}
                        </span>
                    ` : ''}
                </div>
                
                <!-- Glow effect -->
                <div class="absolute inset-0 rounded-full opacity-20 pointer-events-none" 
                     style="background: radial-gradient(circle, ${foregroundColor}20 0%, transparent 70%);"></div>
            </div>
        `;
    },

    animateGauge(container, percentage, config) {
        const progressCircle = container.querySelector('.gauge-progress');
        const percentageText = container.querySelector('.gauge-percentage');
        
        if (!progressCircle) return;

        const radius = (config.size - config.strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const targetOffset = circumference - (percentage / 100) * circumference;

        // Animate the progress circle
        setTimeout(() => {
            progressCircle.style.strokeDashoffset = targetOffset;
        }, 100);

        // Animate the percentage text
        if (percentageText) {
            this.animateNumber(percentageText, 0, percentage, config.animationDuration);
        }

        // Add pulse effect for high scores
        if (percentage >= 80) {
            setTimeout(() => {
                progressCircle.style.animation = 'pulse 2s ease-in-out infinite';
            }, config.animationDuration);
        }
    },

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const difference = end - start;

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smooth animation
            const easedProgress = this.easeOutQuart(progress);
            const currentValue = Math.round(start + (difference * easedProgress));
            
            element.textContent = currentValue + '%';

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    },

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    },

    getColorForPercentage(percentage) {
        if (percentage >= 90) return '#10b981'; // green-500
        if (percentage >= 80) return '#22c55e'; // green-400
        if (percentage >= 70) return '#84cc16'; // lime-400
        if (percentage >= 60) return '#eab308'; // yellow-500
        if (percentage >= 50) return '#f59e0b'; // amber-500
        if (percentage >= 40) return '#f97316'; // orange-500
        if (percentage >= 30) return '#ef4444'; // red-500
        return '#dc2626'; // red-600
    },

    // Create multiple gauges with different configurations
    renderMultiple(gauges) {
        gauges.forEach(gauge => {
            this.render(gauge.containerId, gauge.percentage, gauge.options);
        });
    },

    // Create a comparison gauge (two values)
    renderComparison(containerId, currentValue, targetValue, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const config = {
            size: options.size || 128,
            strokeWidth: options.strokeWidth || 8,
            currentColor: options.currentColor || '#14b8a6',
            targetColor: options.targetColor || '#ef4444',
            backgroundColor: options.backgroundColor || '#475569',
            textColor: options.textColor || '#e2e8f0',
            animationDuration: options.animationDuration || 1000,
            ...options
        };

        container.innerHTML = this.generateComparisonGaugeSVG(currentValue, targetValue, config);
        
        if (config.animationDuration > 0) {
            this.animateComparisonGauge(container, currentValue, targetValue, config);
        }
    },

    generateComparisonGaugeSVG(currentValue, targetValue, config) {
        const { size, strokeWidth, backgroundColor, currentColor, targetColor, textColor } = config;
        const radius = (size - strokeWidth * 2) / 2;
        const circumference = 2 * Math.PI * radius;
        const center = size / 2;

        return `
            <div class="fit-gauge-comparison relative" style="width: ${size}px; height: ${size}px;">
                <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="transform -rotate-90">
                    <!-- Background circle -->
                    <circle 
                        cx="${center}" 
                        cy="${center}" 
                        r="${radius}" 
                        stroke="${backgroundColor}"
                        stroke-width="${strokeWidth}"
                        fill="none"
                    />
                    
                    <!-- Target circle (background) -->
                    <circle 
                        cx="${center}" 
                        cy="${center}" 
                        r="${radius}" 
                        stroke="${targetColor}40"
                        stroke-width="${strokeWidth}"
                        fill="none"
                        stroke-linecap="round"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${circumference}"
                        class="gauge-target transition-all duration-1000 ease-out"
                    />
                    
                    <!-- Current progress circle -->
                    <circle 
                        cx="${center}" 
                        cy="${center}" 
                        r="${radius}" 
                        stroke="${currentColor}"
                        stroke-width="${strokeWidth}"
                        fill="none"
                        stroke-linecap="round"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${circumference}"
                        class="gauge-current transition-all duration-1000 ease-out"
                        style="filter: drop-shadow(0 0 6px ${currentColor}40);"
                    />
                </svg>
                
                <!-- Text content -->
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="gauge-current-value text-xl font-bold" style="color: ${currentColor}; font-size: ${size/8}px;">
                        ${currentValue}%
                    </span>
                    <span class="gauge-vs text-xs text-gray-500" style="font-size: ${size/20}px;">vs</span>
                    <span class="gauge-target-value text-sm font-medium" style="color: ${targetColor}; font-size: ${size/12}px;">
                        ${targetValue}%
                    </span>
                </div>
                
                <!-- Legend -->
                <div class="absolute -bottom-8 left-0 right-0 flex justify-center space-x-4 text-xs">
                    <div class="flex items-center space-x-1">
                        <div class="w-2 h-2 rounded-full" style="background-color: ${currentColor};"></div>
                        <span class="text-gray-400">You</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <div class="w-2 h-2 rounded-full" style="background-color: ${targetColor};"></div>
                        <span class="text-gray-400">Required</span>
                    </div>
                </div>
            </div>
        `;
    },

    animateComparisonGauge(container, currentValue, targetValue, config) {
        const currentCircle = container.querySelector('.gauge-current');
        const targetCircle = container.querySelector('.gauge-target');
        const currentText = container.querySelector('.gauge-current-value');
        const targetText = container.querySelector('.gauge-target-value');
        
        if (!currentCircle || !targetCircle) return;

        const radius = (config.size - config.strokeWidth * 2) / 2;
        const circumference = 2 * Math.PI * radius;
        
        const currentOffset = circumference - (currentValue / 100) * circumference;
        const targetOffset = circumference - (targetValue / 100) * circumference;

        // Animate circles
        setTimeout(() => {
            targetCircle.style.strokeDashoffset = targetOffset;
            setTimeout(() => {
                currentCircle.style.strokeDashoffset = currentOffset;
            }, 200);
        }, 100);

        // Animate text
        if (currentText) {
            this.animateNumber(currentText, 0, currentValue, config.animationDuration);
        }
        if (targetText) {
            setTimeout(() => {
                this.animateNumber(targetText, 0, targetValue, config.animationDuration);
            }, 200);
        }
    },

    // Create a mini gauge for cards
    renderMini(containerId, percentage, options = {}) {
        const miniOptions = {
            size: 48,
            strokeWidth: 4,
            showPercentage: false,
            animationDuration: 800,
            ...options
        };

        this.render(containerId, percentage, miniOptions);
    },

    // Create an interactive gauge with hover effects
    renderInteractive(containerId, percentage, options = {}) {
        this.render(containerId, percentage, options);
        
        const container = document.getElementById(containerId);
        if (!container) return;

        const gauge = container.querySelector('.fit-gauge');
        if (!gauge) return;

        // Add hover effects
        gauge.style.cursor = 'pointer';
        gauge.style.transition = 'transform 0.2s ease';

        gauge.addEventListener('mouseenter', () => {
            gauge.style.transform = 'scale(1.05)';
            
            // Add glow effect
            const progressCircle = gauge.querySelector('.gauge-progress');
            if (progressCircle) {
                progressCircle.style.filter = `drop-shadow(0 0 12px ${options.foregroundColor || this.getColorForPercentage(percentage)}80)`;
            }
        });

        gauge.addEventListener('mouseleave', () => {
            gauge.style.transform = 'scale(1)';
            
            // Remove glow effect
            const progressCircle = gauge.querySelector('.gauge-progress');
            if (progressCircle) {
                progressCircle.style.filter = `drop-shadow(0 0 6px ${options.foregroundColor || this.getColorForPercentage(percentage)}40)`;
            }
        });

        // Add click handler if provided
        if (options.onClick) {
            gauge.addEventListener('click', () => options.onClick(percentage));
        }
    },

    // Update an existing gauge with new value
    update(containerId, newPercentage, animate = true) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const progressCircle = container.querySelector('.gauge-progress');
        const percentageText = container.querySelector('.gauge-percentage');
        
        if (!progressCircle) return;

        // Get current configuration
        const svg = container.querySelector('svg');
        const size = parseInt(svg.getAttribute('width'));
        const strokeWidth = parseInt(progressCircle.getAttribute('stroke-width'));
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const targetOffset = circumference - (newPercentage / 100) * circumference;

        // Update color based on new percentage
        const newColor = this.getColorForPercentage(newPercentage);
        progressCircle.setAttribute('stroke', newColor);

        if (animate) {
            // Animate to new value
            progressCircle.style.strokeDashoffset = targetOffset;
            
            if (percentageText) {
                const currentValue = parseInt(percentageText.textContent);
                this.animateNumber(percentageText, currentValue, newPercentage, 800);
            }
        } else {
            // Instant update
            progressCircle.style.strokeDashoffset = targetOffset;
            if (percentageText) {
                percentageText.textContent = newPercentage + '%';
            }
        }
    },

    // Create a gauge with segments (like a speedometer)
    renderSegmented(containerId, percentage, segments = 5, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const config = {
            size: options.size || 128,
            strokeWidth: options.strokeWidth || 8,
            backgroundColor: options.backgroundColor || '#475569',
            textColor: options.textColor || '#e2e8f0',
            segmentColors: options.segmentColors || [
                '#dc2626', '#f97316', '#eab308', '#22c55e', '#10b981'
            ],
            animationDuration: options.animationDuration || 1000,
            ...options
        };

        container.innerHTML = this.generateSegmentedGaugeSVG(percentage, segments, config);
        
        if (config.animationDuration > 0) {
            this.animateSegmentedGauge(container, percentage, segments, config);
        }
    },

    generateSegmentedGaugeSVG(percentage, segments, config) {
        const { size, strokeWidth, backgroundColor, textColor, segmentColors } = config;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const segmentLength = circumference / segments;
        const gap = 2; // Gap between segments
        const center = size / 2;

        let segmentsSVG = '';
        
        for (let i = 0; i < segments; i++) {
            const isActive = (i + 1) <= Math.ceil((percentage / 100) * segments);
            const color = isActive ? segmentColors[i] || segmentColors[segmentColors.length - 1] : backgroundColor;
            const offset = i * segmentLength + (i * gap);
            
            segmentsSVG += `
                <circle 
                    cx="${center}" 
                    cy="${center}" 
                    r="${radius}" 
                    stroke="${color}"
                    stroke-width="${strokeWidth}"
                    fill="none"
                    stroke-linecap="round"
                    stroke-dasharray="${segmentLength - gap} ${circumference - (segmentLength - gap)}"
                    stroke-dashoffset="${circumference - offset}"
                    class="gauge-segment-${i} transition-all duration-300 ease-out"
                    style="opacity: ${isActive ? 1 : 0.3};"
                />
            `;
        }

        return `
            <div class="fit-gauge-segmented relative" style="width: ${size}px; height: ${size}px;">
                <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="transform -rotate-90">
                    ${segmentsSVG}
                </svg>
                
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="gauge-percentage text-2xl font-bold" style="color: ${textColor}; font-size: ${size/6}px;">
                        ${percentage}%
                    </span>
                    <div class="flex space-x-1 mt-2">
                        ${Array.from({length: segments}, (_, i) => `
                            <div class="w-1 h-1 rounded-full segment-indicator-${i}" 
                                 style="background-color: ${(i + 1) <= Math.ceil((percentage / 100) * segments) ? segmentColors[i] || segmentColors[segmentColors.length - 1] : backgroundColor};"></div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    animateSegmentedGauge(container, percentage, segments, config) {
        const percentageText = container.querySelector('.gauge-percentage');
        const activeSegments = Math.ceil((percentage / 100) * segments);

        // Animate segments one by one
        for (let i = 0; i < segments; i++) {
            const segment = container.querySelector(`.gauge-segment-${i}`);
            const indicator = container.querySelector(`.segment-indicator-${i}`);
            
            if (segment && i < activeSegments) {
                setTimeout(() => {
                    segment.style.opacity = '1';
                    if (indicator) {
                        indicator.style.backgroundColor = config.segmentColors[i] || config.segmentColors[config.segmentColors.length - 1];
                    }
                }, i * 100);
            }
        }

        // Animate percentage text
        if (percentageText) {
            setTimeout(() => {
                this.animateNumber(percentageText, 0, percentage, config.animationDuration);
            }, activeSegments * 100);
        }
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    .fit-gauge .gauge-progress {
        transition: stroke-dashoffset 1s ease-out, stroke 0.3s ease;
    }
    
    .fit-gauge-comparison .gauge-current,
    .fit-gauge-comparison .gauge-target {
        transition: stroke-dashoffset 1s ease-out;
    }
    
    .fit-gauge-segmented .gauge-segment-0,
    .fit-gauge-segmented .gauge-segment-1,
    .fit-gauge-segmented .gauge-segment-2,
    .fit-gauge-segmented .gauge-segment-3,
    .fit-gauge-segmented .gauge-segment-4 {
        transition: opacity 0.3s ease-out;
    }
`;
document.head.appendChild(style);