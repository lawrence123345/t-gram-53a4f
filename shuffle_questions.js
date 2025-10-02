const fs = require('fs');

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const filePath = 'public/assets/questions.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

['beginner', 'intermediate', 'advanced'].forEach(level => {
  ['multiple_choice', 'fill_blank', 'error_identification', 'sentence_completion'].forEach(category => {
    if (data[level] && data[level][category]) {
      shuffleArray(data[level][category]);
    }
  });
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Questions shuffled successfully.');
