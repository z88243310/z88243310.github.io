const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

// 控制電影顯示格式
let panelFlag = 'card'
const dataPanel = document.querySelector('#data-panel')
// const paginator = document.querySelector('#paginator')
// 紀錄彈出警告式窗 setInterval id
let IntervalID = 0
let timeoutID = 0

function renderMovieList(movies) {
  let rawHTML = ''
  const favoriteIcon = 'fas fa-star'
  movies.forEach(function (movie) {
    if (panelFlag === 'card') {
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-3">
          <div class="card">
            <img src="${POSTER_URL + movie.image}" class="card-img-top btn-show-movie border" alt="Movie Poster" data-toggle="modal"
                data-target="#movie-modal" data-id="${movie.id}">
            <div class="card-body row mb-n3">
              <div class="col-9 card-title d-inline-block text-nowrap     
                text-truncate">${movie.title}
              </div>
              <div class="col-3">
                <i class="${favoriteIcon} d-inline-block btn-add-favorite" data-id="${movie.id}"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      `
    } else if (panelFlag === 'list') {
      rawHTML += `
      <div class="col-10 pl-5 py-2 mx-auto border-top">
        <h5 class="card-title btn-show-movie py-1 my-2" data-toggle="modal"
        data-target="#movie-modal" data-id="${movie.id}">${movie.title}</h5>
      </div>  
      <div class="col-2 py-3 border-top">
        <i class="${favoriteIcon} d-inline-block btn-add-favorite" data-id="${movie.id}"></i>
      </div>
      `
    }
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modal = document.querySelector('#movie-modal')
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image img')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  // 區塊隱藏
  modal.classList.add('d-none')
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const { title, image, release_date, description } = response.data.results
      modalTitle.innerText = title
      modalImage.src = POSTER_URL + image
      modalDate.innerText = 'release date : ' + release_date
      modalDescription.innerText = description
      // 區塊顯示
      modal.classList.remove('d-none')
    })
    .catch((err) => console.log(err))
}

// 跳出動態收藏訊息
function showFavoriteAlert(message) {
  const alertNode = document.querySelector('.alert')
  // 將訊息 div 顯示出來
  alertNode.classList.remove('d-none')
  // 不透明度設為 1 , 大小為1.1倍
  let opacityValue = 0.1
  let scaleValue = 0
  alertNode.style.opacity = opacityValue
  alertNode.style.scale = scaleValue
  // 新增與移除的狀態處理
  if (message === 'add') {
    alertNode.classList.remove('alert-secondary')
    alertNode.classList.add('alert-success')
    alertNode.innerHTML = '<h5>Add to favorite</h5>'
  } else if (message === 'remove') {
    alertNode.classList.remove('alert-success')
    alertNode.classList.add('alert-secondary')
    alertNode.innerHTML = '<h5>Remove from favorite</h5>'
  }
  // 當再次呼叫 showFavoriteAlert 時，將正在執行的動作終止
  clearTimeout(timeoutID)
  clearInterval(IntervalID)
  // 啟動定時調用，製造視窗彈出的效果
  IntervalID = setInterval(() => {
    opacityValue += 0.1
    scaleValue += 0.1
    alertNode.style.opacity = opacityValue
    alertNode.style.scale = scaleValue
    if (scaleValue >= 1) {
      // 終止Interval調用
      clearInterval(IntervalID)
      // 啟動延遲調用
      timeoutID = setTimeout(() => {
        // 啟動定時調用，每0.02秒不透明度減少0.1
        IntervalID = setInterval(() => {
          opacityValue -= 0.1
          scaleValue -= 0.01
          alertNode.style.opacity = opacityValue
          alertNode.style.scale = scaleValue
          // 重複直到，透明度小於0.1，終止Interval調用
          if (opacityValue <= 0.1) {
            // display:none 將訊息隱藏
            alertNode.classList.add('d-none')
            clearInterval(IntervalID)
          }
        }, 20)
      }, 500)
    }
  }, 5)
}

function removeFromFavorite(id) {
  if (Boolean(movies) === false || movies.length === 0) {
    console.log(Boolean(movies))
    return
  }
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return
  movies.splice(movieIndex, 1)
  renderMovieList(movies)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  const target = event.target
  const id = Number(target.dataset.id)
  if (target.matches('.btn-show-movie')) showMovieModal(id)
  if (target.matches('.fas.fa-star')) {
    showFavoriteAlert('remove')
    removeFromFavorite(id)
  }
})

renderMovieList(movies)
