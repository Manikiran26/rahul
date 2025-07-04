from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json
import uuid
import random
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# In-memory storage (in production, use a database)
excuses_db = []
saved_excuses_db = []
emergency_alerts_db = []
apologies_db = []

# Excuse templates
EXCUSE_TEMPLATES = {
    'medical': [
        "I woke up with severe food poisoning from last night's dinner",
        "My doctor scheduled an emergency appointment for concerning symptoms",
        "I'm experiencing a migraine that's making it impossible to function",
        "I had an allergic reaction and need to stay home for observation"
    ],
    'family': [
        "My elderly relative had a fall and I need to rush to the hospital",
        "There's a family emergency that requires my immediate attention",
        "My child's school called about an incident requiring parent pickup",
        "A close family member is having a mental health crisis"
    ],
    'work': [
        "My laptop crashed and I lost all my work - IT is investigating",
        "There's been a data breach affecting our department's systems",
        "I'm dealing with a critical client emergency that can't wait",
        "The presentation files got corrupted and need to be rebuilt"
    ],
    'transport': [
        "My car broke down on the highway and I'm waiting for a tow",
        "There's been a major accident blocking all routes to the office",
        "The train service has been suspended due to signal failures",
        "My Uber driver got into an accident and I'm stranded"
    ],
    'technology': [
        "My internet provider had a massive outage in my area",
        "My phone fell in water and I can't access important work files",
        "There's been a power outage affecting my entire neighborhood",
        "My home security system malfunctioned and I need to wait for repairs"
    ],
    'weather': [
        "Severe flooding has made the roads to my house impassable",
        "A tree fell on my car during the storm last night",
        "The extreme weather conditions make travel dangerous",
        "My heating system failed during the cold snap and pipes might freeze"
    ],
    'emergency': [
        "I witnessed an accident and need to stay to give a police statement",
        "There's been a gas leak in my building and we're evacuating",
        "I found an injured animal and am rushing it to the vet",
        "My neighbor's house alarm won't stop and I'm helping them resolve it"
    ],
    'personal': [
        "I'm having an anxiety attack and need some time to recover",
        "I locked myself out and the locksmith can't come until this afternoon",
        "I spilled coffee all over my only clean work outfit",
        "My babysitter canceled at the last minute and I can't find a replacement"
    ]
}

APOLOGY_TEMPLATES = {
    'sincere': {
        'short': [
            "I sincerely apologize for my absence. I understand this may have caused inconvenience, and I take full responsibility.",
            "I'm truly sorry for not being able to make it. This was completely unintentional, and I deeply regret any disruption caused.",
            "Please accept my heartfelt apology for missing our commitment. I value our relationship and am sorry for letting you down."
        ],
        'medium': [
            "I want to offer my sincere apologies for my unexpected absence. I understand that my not being there may have caused significant inconvenience and disruption to your plans. This situation was completely beyond my control, but I recognize that doesn't diminish the impact on you. I take full responsibility for not communicating sooner and deeply regret any stress or frustration this may have caused.",
            "I am writing to express my deepest apologies for my absence. I understand that reliability is important, and I failed to meet that expectation. While the circumstances were truly unavoidable, I should have found a way to communicate more effectively with you. I sincerely regret any inconvenience, disappointment, or additional burden this may have placed on you."
        ]
    },
    'casual': {
        'short': [
            "Hey, really sorry about missing out! Something crazy came up and I couldn't make it. Hope it wasn't too much of a hassle!",
            "So sorry for the no-show! Had a bit of an emergency situation. Thanks for understanding!",
            "Apologies for bailing! Totally unplanned situation. Hope we can reschedule soon!"
        ],
        'medium': [
            "I'm really sorry for not showing up! I know it's super frustrating when someone doesn't come through, and I feel terrible about it. Something unexpected happened that I just couldn't get out of, but I should have let you know sooner. I hope it didn't mess up your day too much, and I'd love to make it up to you somehow.",
            "Hey, I owe you a big apology for my disappearing act! I know how annoying it is when people don't show up, especially without much notice. I had this crazy situation pop up that I just couldn't handle remotely. I should have called you right away instead of hoping I could still make it work. Really sorry for any trouble this caused!"
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
        enhanced = f"URGENT: {enhanced}. This requires immediate attention."
    elif context.get('urgency') == 'high':
        enhanced = f"{enhanced}. This is quite serious and can't be delayed."
    
    if context.get('relationship') == 'professional':
        enhanced = f"{enhanced} I sincerely apologize for any inconvenience this may cause."
    elif context.get('relationship') == 'close':
        enhanced = f"{enhanced} I'm really sorry about this, I know it's not ideal timing."
    
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
    return render_template('index.html')

@app.route('/api/generate-excuse', methods=['POST'])
def generate_excuse():
    try:
        data = request.get_json()
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
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/generate-apology', methods=['POST'])
def generate_apology():
    try:
        data = request.get_json()
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
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/save-excuse', methods=['POST'])
def save_excuse():
    try:
        data = request.get_json()
        excuse = data.get('excuse')
        
        if excuse:
            saved_excuses_db.append(excuse)
            return jsonify({'success': True, 'message': 'Excuse saved successfully'})
        else:
            return jsonify({'success': False, 'error': 'No excuse provided'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/emergency-alert', methods=['POST'])
def create_emergency_alert():
    try:
        data = request.get_json()
        
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
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        stats = {
            'totalExcuses': len(excuses_db),
            'savedExcuses': len(saved_excuses_db),
            'emergencyAlerts': len(emergency_alerts_db),
            'avgBelievability': sum(e.get('believabilityScore', 0) for e in excuses_db) // max(len(excuses_db), 1) if excuses_db else 0
        }
        
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/excuses', methods=['GET'])
def get_excuses():
    try:
        return jsonify({'success': True, 'excuses': excuses_db})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/saved-excuses', methods=['GET'])
def get_saved_excuses():
    try:
        return jsonify({'success': True, 'savedExcuses': saved_excuses_db})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)