const apiKey = 'adb600c3877025d011472c1077cdeff8';

const searchBtn = document.getElementById('searchBtn');
const backBtn = document.getElementById('backToSearch');
searchBtn.addEventListener('click', searchMovie);
backBtn.addEventListener('click', () => {
  localStorage.removeItem('movieTimer');
  localStorage.removeItem('movieTimer');
  document.getElementById('searchBar').style.display = 'flex';
});

let intervalId = null;

function restoreTimer() {
  const saved = JSON.parse(localStorage.getItem('movieTimer'));
  if (saved) {
    startTimer(saved.id, saved.title, saved.start, saved.runtime, saved.backdrop);
  }
}


async function searchMovie() {
  const query = document.getElementById('movieInput').value;
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?language=hu-HU&api_key=${apiKey}&query=${encodeURIComponent(query)}`);
  const data = await res.json();

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  data.results.slice(0, 12).forEach(movie => {
    const col = document.createElement('div');
    col.className = 'col';

    const card = document.createElement('div');
    card.className = "card text-dark";
    card.style.cursor = "pointer";
    card.onclick = () => startTimer(movie.id, movie.title);

    const img = document.createElement('img');
    img.src = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : '';
    img.className = "card-img-top";
    img.style.objectFit = "cover";
    img.style.height = "320px";
    img.alt = movie.title;

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex flex-column';

    const title = document.createElement('h5');
    title.className = "card-title";
    title.style.fontSize = "1.25rem";
    title.textContent = `${movie.title} (${movie.release_date?.slice(0, 4) || 'N/A'})`;

    cardBody.appendChild(title);
    card.appendChild(img);
    card.appendChild(cardBody);
    col.appendChild(card);
    resultsDiv.appendChild(col);
  });
}

async function startTimer(movieId, title, startTimestamp = null, runtimeOverride = null, backdropOverride = null) {
  clearInterval(intervalId);
      document.getElementById('progressWrapper').style.display = 'none';
      document.getElementById('timeLabels').style.display = 'none';
  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=hu-HU&api_key=${apiKey}`);
  const movie = await res.json();
  const runtime = runtimeOverride ?? movie.runtime;
  const backdrop = backdropOverride ?? movie.backdrop_path;
  if (!runtime) {
    alert('Runtime not available');
    return;
  }

  function formatTimePart(part) {
    return part.toString().padStart(2, '0');
  }
  function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${formatTimePart(minutes)}:${formatTimePart(seconds)}`;
  }

  const startTimeEl = document.getElementById('startTime');
  const elapsedEl = document.getElementById('elapsedTime');
  const remainingEl = document.getElementById('remainingTime');
  const endTimeEl = document.getElementById('endTime');
  const progressBar = document.getElementById('progressBar');

  document.getElementById('results').style.display = 'none';
  document.getElementById('progressWrapper').style.display = 'block';
  document.getElementById('searchBar').style.display = 'none';
  document.getElementById('timeLabels').style.display = 'block';
  backBtn.classList.remove('d-none');

  if (backdrop) {
    document.body.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${backdrop})`;
  }

  const start = startTimestamp ?? Date.now();
  const totalMs = runtime * 60 * 1000;
  const endTimestamp = start + totalMs;

  localStorage.setItem('movieTimer', JSON.stringify({
    id: movieId,
    title,
    start,
    runtime,
    backdrop
  }));

  startTimeEl.textContent = new Date(start).toLocaleTimeString();
  endTimeEl.textContent = new Date(endTimestamp).toLocaleTimeString();

  intervalId = setInterval(() => {
    const now = Date.now();
    const remaining = endTimestamp - now;
    const elapsed = now - start;

    if (remaining <= 0) {
      progressBar.style.width = '100%';
      clearInterval(intervalId);
      document.getElementById('progressWrapper').style.display = 'none';
      document.getElementById('timeLabels').style.display = 'none';
      elapsedEl.textContent = `${runtime}:00`;
      remainingEl.textContent = "00:00";
      localStorage.removeItem('movieTimer');
    } else {
      remainingEl.textContent = formatTime(remaining);
      elapsedEl.textContent = formatTime(elapsed);
      progressBar.style.width = (elapsed / totalMs * 100).toFixed(1) + '%';
      document.getElementById('progressWrapper').style.display = 'block';
    }
  }, 1000);
}
window.addEventListener('DOMContentLoaded', restoreTimer);

document.getElementById('backToSearch').addEventListener('click', () => {
  localStorage.removeItem('movieTimer');
  location.reload();
});
