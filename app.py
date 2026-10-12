import os
 
import joblib
import numpy as np
from flask import Flask, jsonify, render_template, request
 
import database
from preprocess import wordopt
 
BASE = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)
 
# ---- Load the Logistic Regression model ONCE when the server starts ----
model = joblib.load(os.path.join(BASE, "model", "model.pkl"))
tfidf = joblib.load(os.path.join(BASE, "model", "tfidf.pkl"))
FEATURES = np.array(tfidf.get_feature_names_out())
COEF = model.coef_[0]          # positive weight -> Real, negative weight -> Fake
 
 
@app.route("/")
def home():
    return render_template("index.html")
 
 
@app.route("/predict", methods=["POST"])
def predict():
    text = (request.get_json(silent=True) or {}).get("text", "").strip()
    if len(text) < 20:
        return jsonify({"error": "Please enter at least 20 characters."}), 400
 
    vec = tfidf.transform([wordopt(text)])
    probs = model.predict_proba(vec)[0]                 # [P(Fake), P(Real)]
    label = int(probs.argmax())
    prediction = "Real" if label == 1 else "Fake"
    confidence = round(float(probs.max()) * 100, 2)
 
    # words that influenced this decision (weight x tf-idf value)
    row = vec.tocoo()
    contrib = {FEATURES[c]: float(v * COEF[c]) for c, v in zip(row.col, row.data)}
    top = sorted(contrib.items(), key=lambda kv: abs(kv[1]), reverse=True)[:10]
    words = [{"word": w, "points_to": "Real" if s > 0 else "Fake"} for w, s in top]
 
    check_id = database.add_check(text, prediction, confidence)
    return jsonify({
        "id": check_id,
        "prediction": prediction,
        "confidence": confidence,
        "prob_real": round(float(probs[1]) * 100, 2),
        "prob_fake": round(float(probs[0]) * 100, 2),
        "top_words": words,
    })
 
 
@app.route("/history")
def history():
    return jsonify(database.get_history(request.args.get("filter")))
 
 
@app.route("/stats")
def stats():
    return jsonify(database.get_stats())
 
 
@app.route("/delete/<int:check_id>", methods=["DELETE"])
def delete(check_id):
    database.delete_check(check_id)
    return jsonify({"ok": True})
 
 
@app.route("/clear", methods=["POST"])
def clear():
    database.clear_all()
    return jsonify({"ok": True})
 
 
if __name__ == "__main__":
    database.init_db()
    app.run(debug=True, port=5000)