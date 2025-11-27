import json
import random

# Load the JSON file
with open('public/assets/questions.json', 'r') as f:
    data = json.load(f)

# Function to shuffle a list
def shuffle_list(lst):
    random.shuffle(lst)
    return lst

# Shuffle each category
for level in ['beginner', 'intermediate', 'advanced']:
    for category in ['multiple_choice', 'fill_blank', 'error_identification', 'sentence_completion']:
        if category in data[level]:
            data[level][category] = shuffle_list(data[level][category])

# Save back
with open('public/assets/questions.json', 'w') as f:
    json.dump(data, f, indent=2)
