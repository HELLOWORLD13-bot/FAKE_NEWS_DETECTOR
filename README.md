# 📰 Fake News Detector

A web application that checks whether a news article looks **Real** or **Fake**. It shows a **confidence score** and the **words that influenced the decision**, and keeps a **history** of past checks.

Built as a B.Tech mini project using NLP and classical machine learning (TF-IDF + Logistic Regression) with a Flask backend and SQLite database.


## Features

- Paste any news article and get a Real/Fake prediction
- Confidence score with probability bars for Real and Fake
- "Influential words" explanation from the model's coefficients
- History table with Real/Fake filter and delete options
- Statistics cards and a Real vs Fake donut chart
- Light and dark mode, responsive layout

## How it works

```
Fake.csv + True.csv → cleaning → text preprocessing → TF-IDF
→ train/test split → model training → evaluation → save model (joblib)
→ Flask API → web dashboard → SQLite history
```

1. **Data:** Fake and True news datasets, labeled Fake = 0 and Real = 1.
2. **Cleaning:** lowercase, remove links, punctuation, numbers, duplicates and the `(Reuters)` dateline (to avoid data leakage).
3. **Features:** TF-IDF vectorization.
4. **Models compared:** Logistic Regression, Decision Tree, Gradient Boosting.
5. **Final model:** Logistic Regression, chosen for reliable confidence scores, explainability, speed and small model size.

## Results

| Model | Accuracy | Precision | Recall | F1-Score |
|---|---|---|---|---|
| Logistic Regression | [98.5]% | [98.36]% | [98.51]% | [98.44]% |
| Gradient Boosting | [99.44]% | [99.44]% | [99.7]% | [99.4]% |
| Decision Tree | [99.47]% | [99.57]% | [99.31]% | [99.4]% |

Evaluated on a held-out [25]% test split with `random_state=42`.

## Tech stack

| Category | Tools |
|---|---|
| Language | Python |
| ML / NLP | scikit-learn, NLTK, Pandas, NumPy, Joblib |
| Backend | Flask |
| Database | SQLite |
| Frontend | HTML, CSS, JavaScript |

## Project structure

```
fake-news-detector/
├── app.py              # Flask app and API routes
├── database.py         # SQLite helper functions
├── preprocess.py       # text cleaning function
├── requirements.txt
├── model/
│   ├── model.pkl       # trained Logistic Regression
│   └── tfidf.pkl       # fitted TF-IDF vectorizer
├── templates/index.html
├── static/css/style.css
├── static/js/app.js
└── notebooks/          # training notebook
```

## Getting started

```bash
git clone https://github.com/HELLOWORLD13-bot/fake-news-detector.git
cd fake-news-detector
python -m venv venv
venv\Scripts\activate        # Windows  (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000 in your browser.

> The `model/` folder must contain `model.pkl` and `tfidf.pkl`. Generate them by running the training notebook.

## API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/predict` | Body `{"text": "..."}`, returns prediction, confidence and top words |
| GET | `/history?filter=Real\|Fake` | Returns recent checks |
| GET | `/stats` | Returns Real/Fake counts |
| DELETE | `/delete/<id>` | Deletes one check |
| POST | `/clear` | Deletes all history |

## Limitations

- The model judges **writing style and vocabulary**, not factual truth.
- It was trained on mostly 2016 to 2017 US political news, so it may be less reliable on other topics or newer events.
- English only.

## Future improvements

- URL-based article detection
- News source credibility check
- User feedback and retraining
- Deep learning models (LSTM / BERT) and multilingual support

## Dataset
**Dataset credit:** Fake and True news dataset, accessed via the Kaggle notebook ["Fake News Detection" by mdnaimislam165436](https://www.kaggle.com/code/mdnaimislam165436/fake-news-detection/input).

## Authors

Prayash C Sharma, B.Tech Computer Science, Assam Don Bosco University

## License

[MIT License / for educational use]
