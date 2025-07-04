from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json
import uuid
import random
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configure Flask to serve static files properly
app.static_folder = 'static'
app.static_url_path = '/static'

# In-memory storage (in production, use a database)
excuses_db = []
saved_excuses_db = []
emergency_alerts_db = []
apologies_db = []

# Excuse templates
EXCUSE_TEMPLATES = {
    'medical': [
        "I woke up with severe food poisoning from last night's dinner and can barely keep anything down",
        "My doctor scheduled an emergency appointment for concerning symptoms that developed overnight",
        "I'm experiencing a severe migraine with visual disturbances that's making it impossible to function",
        "I had an allergic reaction to something and need to stay home for observation and medication"
    ],
    'family': [
        "My elderly relative had a serious fall and I need to rush to the hospital immediately",
        "There's a family emergency that requires my immediate attention and presence",
        "My child's school called about a serious incident requiring immediate parent pickup",
        "A close family member is having a mental health crisis and needs my support"
    ],
    'work': [
        "My laptop crashed and I lost all my work - IT is investigating a potential security breach",
        "There's been a critical data breach affecting our department's systems and I need to secure files",
        "I'm dealing with a critical client emergency that can't wait and requires immediate attention",
        "The presentation files got corrupted and I need to rebuild everything from backup systems"
    ],
    'transport': [
        "My car broke down on the highway and I'm waiting for emergency roadside assistance",
        "There's been a major multi-car accident blocking all routes to the office",
        "The train service has been completely suspended due to signal failures and safety concerns",
        "My ride-share driver got into an accident and I'm stranded with no alternative transportation"
    ],
    'technology': [
        "My internet provider had a massive outage affecting the entire area",
        "My phone fell in water and I can't access any important work files or communications",
        "There's been a power outage affecting my entire neighborhood for several hours",
        "My home security system malfunctioned and I need to wait for emergency repairs"
    ],
    'weather': [
        "Severe flooding has made all roads to my house completely impassable",
        "A large tree fell on my car during the storm and I'm trapped at home",
        "The extreme weather conditions make travel extremely dangerous and inadvisable",
        "My heating system failed during the cold snap and I need to prevent pipes from freezing"
    ],
    'emergency': [
        "I witnessed a serious accident and need to stay to give a detailed police statement",
        "There's been a gas leak in my building and we're being evacuated by emergency services",
        "I found an injured animal and am rushing it to the emergency veterinary clinic",
        "My neighbor's house alarm won't stop and I'm helping them resolve a potential break-in"
    ],
    'personal': [
        "I'm having a severe anxiety attack and need some time to recover and stabilize",
        "I locked myself out and the locksmith can't come until this afternoon",
        "I spilled coffee all over my only clean work outfit and need time to resolve this",
        "My babysitter canceled at the last minute and I can't find a replacement on short notice"
    ]
}

APOLOGY_TEMPLATES = {
    'sincere': {
        'short': [
            "I sincerely apologize for my absence. I understand this may have caused inconvenience, and I take full responsibility for the situation.",
            "I'm truly sorry for not being able to make it. This was completely unintentional, and I deeply regret any disruption this may have caused.",
            "Please accept my heartfelt apology for missing our commitment. I value our relationship and am genuinely sorry for letting you down."
        ],
        'medium': [
            "I want to offer my sincere apologies for my unexpected absence. I understand that my not being there may have caused significant inconvenience and disruption to your plans. This situation was completely beyond my control, but I recognize that doesn't diminish the impact on you. I take full responsibility for not communicating sooner and deeply regret any stress or frustration this may have caused.",
            "I am writing to express my deepest apologies for my absence. I understand that reliability is important, and I failed to meet that expectation. While the circumstances were truly unavoidable, I should have found a way to communicate more effectively with you. I sincerely regret any inconvenience, disappointment, or additional burden this may have placed on you."
        ],
        'long': [
            "I want to begin by offering my most sincere and heartfelt apologies for my unexpected absence. I understand that when someone fails to show up as expected, it can create a ripple effect of inconvenience, frustration, and disappointment that extends far beyond just the immediate moment. I recognize that my absence may have disrupted your carefully laid plans, caused you to rearrange your schedule, or perhaps even put additional burden on others who had to compensate for my missing presence.\n\nWhile I want to explain that the circumstances leading to my absence were truly beyond my control and completely unforeseen, I also understand that explanations, however valid, cannot undo the inconvenience caused. I take full responsibility for not having better contingency plans in place and for not communicating with you sooner about my situation.\n\nI deeply value our relationship and the trust you place in me, and I am genuinely sorry for letting you down. Moving forward, I am committed to implementing better communication strategies and backup plans to ensure this type of situation doesn't occur again."
        ]
    },
    'casual': {
        'short': [
            "Hey, really sorry about missing out! Something crazy came up and I couldn't make it. Hope it wasn't too much of a hassle!",
            "So sorry for the no-show! Had a bit of an emergency situation pop up. Thanks for understanding!",
            "Apologies for bailing! Totally unplanned situation that I couldn't get out of. Hope we can reschedule soon!"
        ],
        'medium': [
            "I'm really sorry for not showing up! I know it's super frustrating when someone doesn't come through, and I feel terrible about it. Something unexpected happened that I just couldn't get out of, but I should have let you know sooner. I hope it didn't mess up your day too much, and I'd love to make it up to you somehow.",
            "Hey, I owe you a big apology for my disappearing act! I know how annoying it is when people don't show up, especially without much notice. I had this crazy situation pop up that I just couldn't handle remotely. I should have called you right away instead of hoping I could still make it work. Really sorry for any trouble this caused!"
        ],
        'long': [
            "I'm reaching out to apologize for my unexpected absence and for not being there when I said I would be. I know how frustrating and inconsiderate it must seem when someone just doesn't show up, especially when you're counting on them. Trust me, I'm usually pretty reliable, so this whole situation has been as stressful for me as I'm sure it was inconvenient for you.\n\nSomething completely unexpected came up that required my immediate attention, and honestly, I thought I could handle it quickly and still make it. But as these things tend to go, it spiraled into something much bigger and more time-consuming than I anticipated. I should have reached out to you much sooner instead of holding onto hope that I could still pull through.\n\nI really appreciate your patience and understanding, and I hope we can work something out to make up for this. I know actions speak louder than words, so I'm committed to being more communicative in the future and having better backup plans."
        ]
    }
}

def calculate_believability_score(context):
    """Calculate believability score based on context"""
    score = 70  # Base score
    
    # Adjust based on urgency
    urgency_scores = {'critical': 20, 'high': 10, 'medium': 5, 'low': -5}
    score += urgency_scores.get(context.get('urgency', 'medium'), 0)
    
    # Adjust based on audience
    audience_scores = {'authority': 15, 'work': 10, 'family': 5, 'friends': -5, 'romantic': -10}
    score += audience_scores.get(context.get('audience', 'work'), 0)
    
    # Adjust based on relationship
    relationship_scores = {'distant': 15, 'professional': 10, 'casual': 5, 'close': -5}
    score += relationship_scores.get(context.get('relationship', 'professional'), 0)
    
    return max(min(score, 95), 20)

def enhance_excuse_for_context(excuse, context):
    """Enhance excuse based on context"""
    enhanced = excuse
    
    if context.get('urgency') == 'critical':
        enhanced = f"URGENT: {enhanced}. This requires immediate attention and cannot be delayed."
    elif context.get('urgency') == 'high':
        enhanced = f"{enhanced}. This is quite serious and can't be delayed any further."
    
    if context.get('relationship') == 'professional':
        enhanced = f"{enhanced} I sincerely apologize for any inconvenience this may cause to our professional commitments."
    elif context.get('relationship') == 'close':
        enhanced = f"{enhanced} I'm really sorry about this, I know the timing is terrible."
    
    return enhanced

def generate_title(category):
    """Generate title based on category"""
    titles = {
        'medical': 'Health Emergency',
        'family': 'Family Crisis',
        'work': 'Work Emergency',
        'transport': 'Transportation Issue',
        'technology': 'Technical Problem',
        'weather': 'Weather Related',
        'emergency': 'Emergency Situation',
        'personal': 'Personal Matter'
    }
    return titles.get(category, 'Unexpected Situation')

@app.route('/')
def index():
    """Serve the main application page"""
    return render_template('index.html')

@app.route('/api/generate-excuse', methods=['POST'])
def generate_excuse():
    """Generate a new excuse based on context"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        context = data.get('context', {})
        
        category = context.get('situation', 'personal')
        templates = EXCUSE_TEMPLATES.get(category, EXCUSE_TEMPLATES['personal'])
        base_excuse = random.choice(templates)
        
        believability_score = calculate_believability_score(context)
        enhanced_excuse = enhance_excuse_for_context(base_excuse, context)
        
        excuse = {
            'id': str(uuid.uuid4()),
            'title': generate_title(category),
            'content': enhanced_excuse,
            'category': category,
            'believabilityScore': believability_score,
            'context': context,
            'timestamp': int(datetime.now().timestamp() * 1000),
            'language': 'en'
        }
        
        excuses_db.append(excuse)
        
        return jsonify({'success': True, 'excuse': excuse})
    except Exception as e:
        print(f"Error generating excuse: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/generate-apology', methods=['POST'])
def generate_apology():
    """Generate an apology based on configuration"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        config = data.get('config', {})
        
        tone = config.get('tone', 'sincere')
        length = config.get('length', 'medium')
        
        templates = APOLOGY_TEMPLATES.get(tone, APOLOGY_TEMPLATES['sincere'])
        length_templates = templates.get(length, templates['medium'])
        selected_template = random.choice(length_templates)
        
        apology = {
            'id': str(uuid.uuid4()),
            'content': selected_template,
            'tone': tone,
            'length': length,
            'followUp': config.get('followUp', False)
        }
        
        apologies_db.append(apology)
        
        return jsonify({'success': True, 'apology': apology})
    except Exception as e:
        print(f"Error generating apology: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/save-excuse', methods=['POST'])
def save_excuse():
    """Save an excuse to the saved collection"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        excuse = data.get('excuse')
        
        if excuse:
            saved_excuses_db.append(excuse)
            return jsonify({'success': True, 'message': 'Excuse saved successfully'})
        else:
            return jsonify({'success': False, 'error': 'No excuse provided'}), 400
    except Exception as e:
        print(f"Error saving excuse: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/emergency-alert', methods=['POST'])
def create_emergency_alert():
    """Create a new emergency alert"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        alert = {
            'id': str(uuid.uuid4()),
            'type': data.get('type', 'call'),
            'sender': data.get('sender', ''),
            'content': data.get('content', ''),
            'scheduledTime': data.get('scheduledTime'),
            'isActive': True
        }
        
        emergency_alerts_db.append(alert)
        
        return jsonify({'success': True, 'alert': alert})
    except Exception as e:
        print(f"Error creating emergency alert: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get application statistics"""
    try:
        stats = {
            'totalExcuses': len(excuses_db),
            'savedExcuses': len(saved_excuses_db),
            'emergencyAlerts': len(emergency_alerts_db),
            'avgBelievability': sum(e.get('believabilityScore', 0) for e in excuses_db) // max(len(excuses_db), 1) if excuses_db else 0
        }
        
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        print(f"Error getting stats: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/excuses', methods=['GET'])
def get_excuses():
    """Get all generated excuses"""
    try:
        return jsonify({'success': True, 'excuses': excuses_db})
    except Exception as e:
        print(f"Error getting excuses: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/saved-excuses', methods=['GET'])
def get_saved_excuses():
    """Get all saved excuses"""
    try:
        return jsonify({'success': True, 'savedExcuses': saved_excuses_db})
    except Exception as e:
        print(f"Error getting saved excuses: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting AI-Powered Excuse Generator System...")
    print("📱 Open your browser and go to: http://localhost:5000")
    print("💡 Features available:")
    print("   - Generate context-aware excuses")
    print("   - Create heartfelt apologies")
    print("   - Set up emergency alerts")
    print("   - Save and manage excuses")
    print("⚠️  Remember: Use responsibly and ethically!")
    app.run(debug=True, host='0.0.0.0', port=5000)