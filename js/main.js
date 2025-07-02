
    const API_URL = 'https://itunes.apple.com/search?term=';
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    const resultCount = document.getElementById('result-count');

    function formatDuration(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    async function fetchSongs(query) {
      try {
        resultsContainer.innerHTML = `
          <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> جاري البحث عن "${query}"...
          </div>
        `;

        const response = await fetch(`${API_URL}${encodeURIComponent(query)}&entity=song&limit=20`);
        const data = await response.json();

        resultsContainer.innerHTML = '';
        resultCount.textContent = data.results.length;

        if (data.results.length === 0) {
          resultsContainer.innerHTML = `
            <div class="error">
              <i class="fas fa-exclamation-circle"></i>
              لم يتم العثور على نتائج. حاول استخدام كلمات بحث أخرى.
            </div>
          `;
          return;
        }

        data.results.forEach(song => {
          const songCard = document.createElement('div');
          songCard.className = 'song-card';

          songCard.innerHTML = `
            <img src="${song.artworkUrl100}" alt="${song.trackName}" class="album-cover">
            <button class="play-btn" data-preview="${song.previewUrl}">
              <i class="fas fa-play"></i>
            </button>
            <div>
              <div class="song-title">${song.trackName}</div>
              <div class="song-artist">${song.artistName}</div>
              <div class="song-album"><i class="fas fa-compact-disc"></i> ${song.collectionName}</div>
              <div class="song-duration">
                <span>${formatDuration(song.trackTimeMillis)}</span>
              </div>
            </div>
          `;

          resultsContainer.appendChild(songCard);
        });

        document.querySelectorAll('.play-btn').forEach(btn => {
          btn.addEventListener('click', function () {
            const previewUrl = this.getAttribute('data-preview');
            if (!previewUrl) return;

            if (this.audio && !this.audio.paused) {
              this.audio.pause();
              this.audio.currentTime = 0;
              this.innerHTML = '<i class="fas fa-play"></i>';
              return;
            }

            stopAllAudio();

            const audio = new Audio(previewUrl);
            audio.play();

            this.innerHTML = '<i class="fas fa-pause"></i>';

            audio.onended = () => {
              this.innerHTML = '<i class="fas fa-play"></i>';
            };

            this.audio = audio;
          });
        });

        resultsContainer.scrollIntoView({ behavior: 'smooth' });

      } catch (error) {
        console.error('Error fetching data:', error);
        resultsContainer.innerHTML = `
          <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            حدث خطأ أثناء جلب البيانات. الرجاء المحاولة مرة أخرى.
          </div>
        `;
      }
    }

    function stopAllAudio() {
      document.querySelectorAll('.play-btn').forEach(btn => {
        if (btn.audio) {
          btn.audio.pause();
          btn.audio.currentTime = 0;
          btn.innerHTML = '<i class="fas fa-play"></i>';
        }
      });
    }

    searchBtn.addEventListener('click', () => {
      if (searchInput.value.trim()) {
        fetchSongs(searchInput.value);
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        fetchSongs(searchInput.value);
      }
    });

    window.addEventListener('DOMContentLoaded', () => {
      fetchSongs('عمرو دياب');
    });
  
