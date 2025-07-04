// Global state
let currentView = 'dashboard';
let currentExcuseContext = {
    situation: 'work',
    urgency: 'medium',
    audience: 'work',
    relationship: 'professional'
};
let currentApologyConfig = {
    tone: 'sincere',
    length: 'medium'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen briefly for better UX
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        initializeApp();
    }, 1000);
});

function initializeApp() {
    console.log('Initializing ExcuseAI application...');
    setupNavigation();
    setupExcuseGenerator();
    setupApologyGenerator();
    loadDashboard();
    showView('dashboard');
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            showView(view);
        });
    });
}

function showView(viewName) {
    console.log('Showing view:', viewName);
    
    // Hide all views
    const views = document.querySelectorAll('.view-content');
    views.forEach(view => view.classList.add('hidden'));
    
    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.remove('hidden');
    }
    
    // Update navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active-nav');
        if (btn.getAttribute('data-view') === viewName) {
            btn.classList.add('active-nav');
        }
    });
    
    currentView = viewName;
    
    // Load view-specific content
    switch(viewName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'saved':
            loadSavedExcuses();
            break;
    }
}

function setupExcuseGenerator() {
    const categories = [
        { value: 'work', label: 'Work', icon: '💼' },
        { value: 'medical', label: 'Medical', icon: '🏥' },
        { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
        { value: 'transport', label: 'Transport', icon: '🚗' },
        { value: 'technology', label: 'Technology', icon: '💻' },
        { value: 'weather', label: 'Weather', icon: '🌧️' },
        { value: 'emergency', label: 'Emergency', icon: '🚨' },
        { value: 'personal', label: 'Personal', icon: '👤' }
    ];

    const urgencyLevels = [
        { value: 'low', label: 'Low', color: 'emerald' },
        { value: 'medium', label: 'Medium', color: 'yellow' },
        { value: 'high', label: 'High', color: 'orange' },
        { value: 'critical', label: 'Critical', color: 'red' }
    ];

    // Setup situation buttons
    const situationContainer = document.getElementById('situation-buttons');
    if (situationContainer) {
        situationContainer.innerHTML = categories.map(cat => `
            <button onclick="updateContext('situation', '${cat.value}')" 
                    class="situation-btn flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${currentExcuseContext.situation === cat.value ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'}"
                    data-value="${cat.value}">
                <span>${cat.icon}</span>
                <span class="text-sm font-medium">${cat.label}</span>
            </button>
        `).join('');
    }

    // Setup urgency buttons
    const urgencyContainer = document.getElementById('urgency-buttons');
    if (urgencyContainer) {
        urgencyContainer.innerHTML = urgencyLevels.map(urgency => `
            <button onclick="updateContext('urgency', '${urgency.value}')" 
                    class="urgency-btn p-3 rounded-lg border transition-all duration-200 ${currentExcuseContext.urgency === urgency.value ? `bg-${urgency.color}-600/20 border-${urgency.color}-500 text-${urgency.color}-300` : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'}"
                    data-value="${urgency.value}">
                <span class="text-sm font-medium">${urgency.label}</span>
            </button>
        `).join('');
    }
}

function setupApologyGenerator() {
    const tones = [
        { value: 'sincere', label: 'Sincere', color: 'emerald' },
        { value: 'casual', label: 'Casual', color: 'blue' }
    ];

    const lengths = [
        { value: 'short', label: 'Short' },
        { value: 'medium', label: 'Medium' }
    ];

    // Setup tone buttons
    const toneContainer = document.getElementById('tone-buttons');
    if (toneContainer) {
        toneContainer.innerHTML = tones.map(tone => `
            <button onclick="updateApologyConfig('tone', '${tone.value}')" 
                    class="tone-btn p-3 rounded-lg border transition-all duration-200 ${currentApologyConfig.tone === tone.value ? `bg-${tone.color}-600/20 border-${tone.color}-500 text-${tone.color}-300` : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'}"
                    data-value="${tone.value}">
                <span class="text-sm font-medium">${tone.label}</span>
            </button>
        `).join('');
    }

    // Setup length buttons
    const lengthContainer = document.getElementById('length-buttons');
    if (lengthContainer) {
        lengthContainer.innerHTML = lengths.map(length => `
            <button onclick="updateApologyConfig('length', '${length.value}')" 
                    class="length-btn p-3 rounded-lg border transition-all duration-200 ${currentApologyConfig.length === length.value ? 'bg-pink-600/20 border-pink-500 text-pink-300' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'}"
                    data-value="${length.value}">
                <span class="text-sm font-medium">${length.label}</span>
            </button>
        `).join('');
    }
}

function updateContext(key, value) {
    currentExcuseContext[key] = value;
    
    // Update audience and relationship from selects
    const audienceSelect = document.getElementById('audience-select');
    const relationshipSelect = document.getElementById('relationship-select');
    
    if (audienceSelect) currentExcuseContext.audience = audienceSelect.value;
    if (relationshipSelect) currentExcuseContext.relationship = relationshipSelect.value;
    
    // Update button states
    updateButtonStates();
}

function updateApologyConfig(key, value) {
    currentApologyConfig[key] = value;
    updateApologyButtonStates();
}

function updateButtonStates() {
    // Update situation buttons
    document.querySelectorAll('.situation-btn').forEach(btn => {
        const value = btn.getAttribute('data-value');
        if (value === currentExcuseContext.situation) {
            btn.className = 'situation-btn flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 bg-blue-600/20 border-blue-500 text-blue-300';
        } else {
            btn.className = 'situation-btn flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700';
        }
    });

    // Update urgency buttons
    document.querySelectorAll('.urgency-btn').forEach(btn => {
        const value = btn.getAttribute('data-value');
        const colors = { low: 'emerald', medium: 'yellow', high: 'orange', critical: 'red' };
        const color = colors[value];
        
        if (value === currentExcuseContext.urgency) {
            btn.className = `urgency-btn p-3 rounded-lg border transition-all duration-200 bg-${color}-600/20 border-${color}-500 text-${color}-300`;
        } else {
            btn.className = 'urgency-btn p-3 rounded-lg border transition-all duration-200 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700';
        }
    });
}

function updateApologyButtonStates() {
    // Update tone buttons
    document.querySelectorAll('.tone-btn').forEach(btn => {
        const value = btn.getAttribute('data-value');
        const colors = { sincere: 'emerald', casual: 'blue' };
        const color = colors[value];
        
        if (value === currentApologyConfig.tone) {
            btn.className = `tone-btn p-3 rounded-lg border transition-all duration-200 bg-${color}-600/20 border-${color}-500 text-${color}-300`;
        } else {
            btn.className = 'tone-btn p-3 rounded-lg border transition-all duration-200 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700';
        }
    });

    // Update length buttons
    document.querySelectorAll('.length-btn').forEach(btn => {
        const value = btn.getAttribute('data-value');
        if (value === currentApologyConfig.length) {
            btn.className = 'length-btn p-3 rounded-lg border transition-all duration-200 bg-pink-600/20 border-pink-500 text-pink-300';
        } else {
            btn.className = 'length-btn p-3 rounded-lg border transition-all duration-200 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700';
        }
    });
}

async function generateExcuse() {
    console.log('Generating excuse with context:', currentExcuseContext);
    
    const btn = document.getElementById('generate-excuse-btn');
    const resultContainer = document.getElementById('excuse-result');
    
    // Update context from selects
    const audienceSelect = document.getElementById('audience-select');
    const relationshipSelect = document.getElementById('relationship-select');
    
    if (audienceSelect) currentExcuseContext.audience = audienceSelect.value;
    if (relationshipSelect) currentExcuseContext.relationship = relationshipSelect.value;
    
    // Show loading state
    btn.innerHTML = '<div class="loading-spinner mr-2"></div><span>Generating...</span>';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/generate-excuse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                context: currentExcuseContext
            })
        });
        
        const data = await response.json();
        console.log('Excuse generation response:', data);
        
        if (data.success) {
            displayExcuseResult(data.excuse);
        } else {
            throw new Error(data.error || 'Failed to generate excuse');
        }
    } catch (error) {
        console.error('Error generating excuse:', error);
        resultContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                <h3 class="text-lg font-medium text-red-300 mb-2">Error</h3>
                <p class="text-red-400">Failed to generate excuse. Please try again.</p>
                <p class="text-red-300 text-sm mt-2">${error.message}</p>
            </div>
        `;
    } finally {
        // Reset button
        btn.innerHTML = '<i class="fas fa-magic mr-2"></i><span>Generate Excuse</span>';
        btn.disabled = false;
    }
}

function displayExcuseResult(excuse) {
    const resultContainer = document.getElementById('excuse-result');
    const scoreColor = excuse.believabilityScore >= 80 ? 'emerald' : 
                      excuse.believabilityScore >= 60 ? 'yellow' : 'red';
    
    resultContainer.innerHTML = `
        <div class="space-y-6">
            <!-- Believability Score -->
            <div class="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-chart-line text-${scoreColor}-400"></i>
                    <span class="font-medium text-white">Believability Score</span>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full bg-${scoreColor}-400"></div>
                    <span class="text-xl font-bold text-white">${excuse.believabilityScore}%</span>
                </div>
            </div>

            <!-- Excuse Content -->
            <div class="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <h3 class="font-semibold text-white mb-2">${excuse.title}</h3>
                <p class="text-slate-300 leading-relaxed">${excuse.content}</p>
                <div class="flex items-center space-x-4 mt-4 pt-4 border-t border-slate-600">
                    <span class="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full capitalize">
                        ${excuse.category}
                    </span>
                    <div class="flex items-center space-x-1 text-slate-400 text-sm">
                        <i class="fas fa-clock"></i>
                        <span>${new Date(excuse.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-3">
                <button onclick="copyToClipboard(\`${excuse.content.replace(/`/g, '\\`')}\`, this)" class="btn-secondary flex items-center justify-center space-x-2 p-3 text-slate-300 rounded-lg">
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                </button>
                <button onclick="saveExcuse('${excuse.id}')" class="flex items-center justify-center space-x-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                    <i class="fas fa-save"></i>
                    <span>Save</span>
                </button>
            </div>
        </div>
    `;
}

async function generateApology() {
    console.log('Generating apology with config:', currentApologyConfig);
    
    const btn = document.getElementById('generate-apology-btn');
    const resultContainer = document.getElementById('apology-result');
    
    // Show loading state
    btn.innerHTML = '<div class="loading-spinner mr-2"></div><span>Generating...</span>';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/generate-apology', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                config: currentApologyConfig
            })
        });
        
        const data = await response.json();
        console.log('Apology generation response:', data);
        
        if (data.success) {
            displayApologyResult(data.apology);
        } else {
            throw new Error(data.error || 'Failed to generate apology');
        }
    } catch (error) {
        console.error('Error generating apology:', error);
        resultContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                <h3 class="text-lg font-medium text-red-300 mb-2">Error</h3>
                <p class="text-red-400">Failed to generate apology. Please try again.</p>
                <p class="text-red-300 text-sm mt-2">${error.message}</p>
            </div>
        `;
    } finally {
        // Reset button
        btn.innerHTML = '<i class="fas fa-heart mr-2"></i><span>Generate Apology</span>';
        btn.disabled = false;
    }
}

function displayApologyResult(apology) {
    const resultContainer = document.getElementById('apology-result');
    
    resultContainer.innerHTML = `
        <div class="space-y-6">
            <!-- Apology Metrics -->
            <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-3 bg-slate-700/50 rounded-lg">
                    <div class="text-sm text-slate-400">Tone</div>
                    <div class="font-medium text-white capitalize">${apology.tone}</div>
                </div>
                <div class="text-center p-3 bg-slate-700/50 rounded-lg">
                    <div class="text-sm text-slate-400">Length</div>
                    <div class="font-medium text-white capitalize">${apology.length}</div>
                </div>
                <div class="text-center p-3 bg-slate-700/50 rounded-lg">
                    <div class="text-sm text-slate-400">Words</div>
                    <div class="font-medium text-white">${apology.content.split(' ').length}</div>
                </div>
            </div>

            <!-- Apology Content -->
            <div class="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <div class="prose prose-slate max-w-none">
                    <p class="text-slate-300 leading-relaxed whitespace-pre-wrap">${apology.content}</p>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-3">
                <button onclick="copyToClipboard(\`${apology.content.replace(/`/g, '\\`')}\`, this)" class="btn-secondary flex items-center justify-center space-x-2 p-3 text-slate-300 rounded-lg">
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                </button>
                <button class="flex items-center justify-center space-x-2 p-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors">
                    <i class="fas fa-save"></i>
                    <span>Save</span>
                </button>
            </div>
        </div>
    `;
}

async function createEmergencyAlert() {
    const type = document.getElementById('alert-type').value;
    const sender = document.getElementById('alert-sender').value;
    const content = document.getElementById('alert-content').value;
    
    if (!sender || !content) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/emergency-alert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: type,
                sender: sender,
                content: content
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Emergency alert created successfully!', 'success');
            // Clear form
            document.getElementById('alert-sender').value = '';
            document.getElementById('alert-content').value = '';
        } else {
            throw new Error(data.error || 'Failed to create alert');
        }
    } catch (error) {
        console.error('Error creating alert:', error);
        showNotification('Failed to create emergency alert. Please try again.', 'error');
    }
}

async function loadDashboard() {
    console.log('Loading dashboard...');
    
    try {
        // Load stats
        const statsResponse = await fetch('/api/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            displayStats(statsData.stats);
        }
        
        // Load recent excuses
        const excusesResponse = await fetch('/api/excuses');
        const excusesData = await excusesResponse.json();
        
        if (excusesData.success) {
            displayRecentExcuses(excusesData.excuses.slice(0, 3));
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

function displayStats(stats) {
    const statsGrid = document.getElementById('stats-grid');
    if (!statsGrid) return;
    
    const statItems = [
        {
            label: 'Excuses Generated',
            value: stats.totalExcuses,
            icon: 'fas fa-comment-dots',
            color: 'from-blue-500 to-blue-600',
            change: '+12%'
        },
        {
            label: 'Saved Excuses',
            value: stats.savedExcuses,
            icon: 'fas fa-star',
            color: 'from-emerald-500 to-emerald-600',
            change: '+8%'
        },
        {
            label: 'Emergency Alerts',
            value: stats.emergencyAlerts,
            icon: 'fas fa-exclamation-triangle',
            color: 'from-orange-500 to-orange-600',
            change: '+3%'
        },
        {
            label: 'Avg. Believability',
            value: stats.avgBelievability + '%',
            icon: 'fas fa-chart-line',
            color: 'from-purple-500 to-purple-600',
            change: '+15%'
        }
    ];
    
    statsGrid.innerHTML = statItems.map(stat => `
        <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center">
                    <i class="${stat.icon} text-white"></i>
                </div>
                <span class="text-emerald-400 text-sm font-medium">${stat.change}</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-1">${stat.value}</h3>
            <p class="text-slate-400 text-sm">${stat.label}</p>
        </div>
    `).join('');
}

function displayRecentExcuses(excuses) {
    const container = document.getElementById('recent-excuses');
    if (!container) return;
    
    if (excuses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-comment-dots text-4xl text-slate-500 mb-3"></i>
                <p class="text-slate-400">No excuses generated yet</p>
                <button onclick="showView('generator')" class="mt-3 text-blue-400 hover:text-blue-300 transition-colors">
                    Create your first excuse
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="space-y-4">
            ${excuses.map(excuse => {
                const scoreColor = excuse.believabilityScore >= 80 ? 'emerald' : 
                                  excuse.believabilityScore >= 60 ? 'yellow' : 'red';
                return `
                    <div class="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-700/70 transition-colors">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="font-medium text-white">${excuse.title}</h3>
                            <div class="flex items-center space-x-2">
                                <div class="w-2 h-2 rounded-full bg-${scoreColor}-400"></div>
                                <span class="text-sm text-slate-400">${excuse.believabilityScore}%</span>
                            </div>
                        </div>
                        <p class="text-slate-300 text-sm line-clamp-2">${excuse.content}</p>
                        <div class="flex items-center justify-between mt-3">
                            <span class="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded-md capitalize">
                                ${excuse.category}
                            </span>
                            <span class="text-xs text-slate-400">
                                ${new Date(excuse.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function loadSavedExcuses() {
    console.log('Loading saved excuses...');
    
    try {
        const response = await fetch('/api/saved-excuses');
        const data = await response.json();
        
        if (data.success) {
            displaySavedExcuses(data.savedExcuses);
        }
    } catch (error) {
        console.error('Error loading saved excuses:', error);
        showNotification('Failed to load saved excuses', 'error');
    }
}

function displaySavedExcuses(excuses) {
    const container = document.getElementById('saved-excuses-content');
    if (!container) return;
    
    if (excuses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16">
                <i class="fas fa-bookmark text-6xl text-slate-500 mb-4"></i>
                <h3 class="text-lg font-medium text-slate-300 mb-2">No Saved Excuses</h3>
                <p class="text-slate-400 mb-6">Start generating and saving excuses to build your collection</p>
                <button onclick="showView('generator')" class="btn-primary px-6 py-3 text-white rounded-lg font-medium">
                    Generate Your First Excuse
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 grid-responsive">
            ${excuses.map(excuse => {
                const scoreColor = excuse.believabilityScore >= 80 ? 'emerald' : 
                                  excuse.believabilityScore >= 60 ? 'yellow' : 'red';
                return `
                    <div class="card p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                                <h3 class="font-semibold text-white mb-1">${excuse.title}</h3>
                                <div class="flex items-center space-x-3 text-sm text-slate-400">
                                    <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded-md capitalize">
                                        ${excuse.category}
                                    </span>
                                    <div class="flex items-center space-x-1">
                                        <i class="fas fa-calendar text-xs"></i>
                                        <span>${new Date(excuse.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 rounded-full bg-${scoreColor}-400"></div>
                                <span class="font-medium text-white">${excuse.believabilityScore}%</span>
                            </div>
                        </div>
                        <p class="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">${excuse.content}</p>
                        <div class="flex items-center space-x-2">
                            <button onclick="copyToClipboard(\`${excuse.content.replace(/`/g, '\\`')}\`, this)" class="btn-secondary flex items-center space-x-1 px-3 py-2 text-slate-300 rounded-lg text-sm">
                                <i class="fas fa-copy text-xs"></i>
                                <span>Copy</span>
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function saveExcuse(excuseId) {
    try {
        // Find the excuse in the current session
        const response = await fetch('/api/excuses');
        const data = await response.json();
        
        if (data.success) {
            const excuse = data.excuses.find(e => e.id === excuseId);
            if (excuse) {
                const saveResponse = await fetch('/api/save-excuse', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ excuse: excuse })
                });
                
                const saveData = await saveResponse.json();
                if (saveData.success) {
                    showNotification('Excuse saved successfully!', 'success');
                } else {
                    throw new Error(saveData.error);
                }
            }
        }
    } catch (error) {
        console.error('Error saving excuse:', error);
        showNotification('Failed to save excuse. Please try again.', 'error');
    }
}

async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check mr-1"></i><span>Copied!</span>';
        button.classList.add('bg-emerald-600', 'text-white');
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('bg-emerald-600', 'text-white');
        }, 2000);
    } catch (error) {
        console.error('Failed to copy text:', error);
        showNotification('Failed to copy to clipboard', 'error');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-emerald-600' : 
        type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    } text-white`;
    
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add some console logging for debugging
console.log('ExcuseAI JavaScript loaded successfully');