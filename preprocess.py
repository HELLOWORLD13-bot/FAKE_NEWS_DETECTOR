import re
import string
 
 
# IMPORTANT: this must be EXACTLY the same cleaning function you used in your
# notebook when training the model (including the Reuters removal).
# If your notebook version is different, copy it here.
def wordopt(text):
    text = text.lower()
    text = re.sub(r"^.*?\(reuters\)\s*-?\s*", "", text)     # remove "CITY (Reuters) -"
    text = re.sub(r"\[.*?\]", "", text)
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    text = re.sub(r"<.*?>+", "", text)
    text = re.sub(r"[%s]" % re.escape(string.punctuation), "", text)
    text = re.sub(r"\n", " ", text)
    text = re.sub(r"\w*\d\w*", "", text)
    return text