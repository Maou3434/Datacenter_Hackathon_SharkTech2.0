from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import requests
from datetime import timedelta
from dotenv import load_dotenv

# Load .env into environment for local development
load_dotenv()

app = Flask(__name__)

# Configuration
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# CORS: allow frontend dev server
frontend_origin = os.environ.get('FRONTEND_ORIGIN', 'http://localhost:5173')
CORS(app, supports_credentials=True, origins=[frontend_origin])

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')

app.logger.debug('Server startup: GOOGLE_CLIENT_ID=%s, FRONTEND_ORIGIN=%s', GOOGLE_CLIENT_ID, frontend_origin)


def verify_id_token_with_google(id_token: str):
    """Verify the ID token using Google's tokeninfo endpoint.
    This is simple and avoids adding the google-auth library. For production,
    prefer google.oauth2.id_token.verify_oauth2_token.
    """
    if not id_token:
        app.logger.debug('verify_id_token_with_google: no id_token provided')
        return None

    try:
        resp = requests.get('https://oauth2.googleapis.com/tokeninfo', params={'id_token': id_token}, timeout=5)
    except Exception as e:
        app.logger.exception('tokeninfo request failed')
        return None

    app.logger.debug('tokeninfo status_code=%s', resp.status_code)
    if resp.status_code != 200:
        # log body for debugging
        app.logger.debug('tokeninfo response: %s', resp.text)
        return None

    try:
        data = resp.json()
    except Exception:
        app.logger.debug('tokeninfo returned non-json: %s', resp.text)
        return None

    # Validate audience
    if GOOGLE_CLIENT_ID and data.get('aud') != GOOGLE_CLIENT_ID:
        app.logger.debug('tokeninfo aud mismatch: expected=%s got=%s', GOOGLE_CLIENT_ID, data.get('aud'))
        return None

    return data


@app.route('/api/auth/signin', methods=['POST'])
def signin():
    payload = request.get_json() or {}
    id_token = payload.get('id_token')
    app.logger.debug('signin: received id_token, length=%d', len(id_token) if id_token else 0)
    if not id_token:
        app.logger.debug('signin: missing id_token')
        return jsonify({'error': 'missing id_token'}), 400

    app.logger.debug('signin: calling verify_id_token_with_google')
    info = verify_id_token_with_google(id_token)
    if not info:
        app.logger.debug('signin: token verification failed')
        return jsonify({'error': 'invalid token'}), 401

    app.logger.debug('signin: token verified, user=%s', info.get('email'))
    # Save user in session
    user = {
        'name': info.get('name'),
        'email': info.get('email'),
        'picture': info.get('picture')
    }
    session.permanent = True
    session['user'] = user
    app.logger.debug('signin: session saved for user=%s', user.get('email'))

    return jsonify({'status': 'ok', 'user': user})


@app.route('/api/auth/signout', methods=['POST'])
def signout():
    session.clear()
    return jsonify({'status': 'signed_out'})


@app.route('/api/auth/user', methods=['GET'])
def current_user():
    user = session.get('user')
    if not user:
        return jsonify({'user': None}), 200
    return jsonify({'user': user}), 200


def login_required(fn):
    from functools import wraps

    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get('user'):
            return jsonify({'error': 'authentication required'}), 401
        return fn(*args, **kwargs)

    return wrapper


@app.route('/api/protected/marketplace', methods=['GET'])
@login_required
def protected_marketplace():
    # Placeholder protected data for the Marketplace
    return jsonify({'message': 'This is protected marketplace data.', 'user': session.get('user')}), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', '1') == '1')
