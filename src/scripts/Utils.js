const spawnEnemy = function() {
  return (Math.random() > 0.99);
}

const updateText = function(score, life) {
  return (score == 0) ? 'Arrow keys to move.\nLeft click to shoot.\nWe must kill the enemies in their dimensions.' : 'Score : ' + score + '\nLife : ' + life;
}

export default {
  updateText: updateText,
  spawnEnemy: spawnEnemy
}