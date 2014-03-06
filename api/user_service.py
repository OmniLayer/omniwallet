import bcrypt
from flask import Flask, request, jsonify
app = Flask(__name__)
app.debug = True

@app.route('/salt')
def challenge():
  uuid = request.args.get('uuid', '')
  salt = bcrypt.hashpw(uuid.encode('UTF-8'), bcrypt.gensalt())
  random_str = bcrypt.hashpw(bcrypt.gensalt(), bcrypt.gensalt())[7:]

  response = {
      'salt': salt,
      'random_str': random_str
  }
  return jsonify(response)


