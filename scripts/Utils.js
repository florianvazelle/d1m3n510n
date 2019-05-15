function spawnEnemy() {
  return (Math.random() > 0.99);
}

function updateText(score, life) {
  return (score == 0) ? 'Arrow keys to move.\nLeft click to shoot.\nWe must kill the enemies in their dimensions.' : 'Score : ' + score + '\nLife : ' + life;
}
