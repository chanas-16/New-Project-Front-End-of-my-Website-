from flask import Flask, request, jsonify
import os
import json
import random
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')

# Paths to JSON database files
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
PRODUCTS_FILE = os.path.join(DATA_DIR, 'products.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
INQUIRIES_FILE = os.path.join(DATA_DIR, 'inquiries.json')

def read_json_file(filepath):
    if not os.path.exists(filepath):
        return []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

def write_json_file(filepath, data):
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error writing to {filepath}: {e}")
        return False

# --- Web Page Serving Routes ---
@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.route('/about')
@app.route('/about.html')
def about():
    return app.send_static_file('about.html')

@app.route('/products')
@app.route('/products.html')
def products():
    return app.send_static_file('products.html')

@app.route('/categories')
@app.route('/categories.html')
def categories():
    return app.send_static_file('categories.html')

@app.route('/contact')
@app.route('/contact.html')
def contact():
    return app.send_static_file('contact.html')


# --- API Endpoints ---

# 1. Get Product Catalog
@app.route('/api/products', methods=['GET'])
def get_products():
    products_list = read_json_file(PRODUCTS_FILE)
    return jsonify(products_list)


# 2. B2B Account Registration
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    company = data.get('company', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not company or not email or not password:
        return jsonify({'error': 'Missing company name, email, or password.'}), 400

    users = read_json_file(USERS_FILE)
    if any(u['email'].lower() == email.lower() for u in users):
        return jsonify({'error': 'A wholesale account with this email already exists.'}), 400

    new_user = {
        'company': company,
        'email': email,
        'password': password,  # Stored in plaintext for ease of mockup development
        'tier': 'Gold Wholesale Partner'
    }
    users.append(new_user)
    write_json_file(USERS_FILE, users)

    return jsonify({
        'message': 'B2B Wholesale account registered successfully.',
        'user': {
            'company': company,
            'email': email,
            'tier': new_user['tier']
        }
    })


# 3. B2B Account Login
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    users = read_json_file(USERS_FILE)
    user = next((u for u in users if u['email'].lower() == email.lower() and u['password'] == password), None)

    if user:
        return jsonify({
            'message': 'Login successful.',
            'user': {
                'company': user['company'],
                'email': user['email'],
                'tier': user.get('tier', 'Gold Wholesale Partner')
            }
        })
    else:
        return jsonify({'error': 'Invalid business email or password.'}), 401


# 4. Submit Sourcing Inquiry (Bulk Quote Request)
@app.route('/api/inquiries', methods=['POST'])
def submit_inquiry():
    data = request.json or {}
    company = data.get('company', '').strip()
    contact_person = data.get('contact', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    fabric = data.get('fabric', '').strip()
    volume = data.get('volume', '').strip()
    message = data.get('message', '').strip()
    
    # Optional fields from B2B Inquiry Cart submission
    items = data.get('items', [])
    subtotal = data.get('subtotal', 0.0)

    if not company or not email:
        return jsonify({'error': 'Company name and contact email are required.'}), 400

    ref_number = f"ANAS-INQ-{random.randint(100000, 999999)}"
    
    new_inquiry = {
        'ref': ref_number,
        'company': company,
        'contact': contact_person,
        'email': email,
        'phone': phone,
        'fabric': fabric,
        'volume': volume,
        'message': message,
        'items': items,
        'subtotal': subtotal,
        'date': datetime.now().isoformat()
    }

    inquiries = read_json_file(INQUIRIES_FILE)
    inquiries.append(new_inquiry)
    write_json_file(INQUIRIES_FILE, inquiries)

    return jsonify({
        'message': 'Wholesale quote request submitted successfully.',
        'ref': ref_number
    })


# 5. Fetch Sourcing Inquiries (Admin Panel usage)
@app.route('/api/inquiries', methods=['GET'])
def get_inquiries():
    inquiries_list = read_json_file(INQUIRIES_FILE)
    return jsonify(inquiries_list)


if __name__ == '__main__':
    import webbrowser
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        webbrowser.open("http://localhost:5000/")
    print("Starting Flask web server on http://localhost:5000/")
    app.run(debug=True, host='0.0.0.0', port=5000)
