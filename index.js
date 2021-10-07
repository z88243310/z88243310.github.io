const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12
const movies = []
let filteredMovies = []

// 控制電影顯示模式
let panelFlag = "card"
// 紀錄頁碼
let pageCurrent = 1
// 紀錄彈出警告式窗 setInterval id
let IntervalID = 0
let timeoutID = 0

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
const panelSwitch = document.querySelector("#panel-switch")

// 將指定頁碼標記 active ，並取得對應的電影資料
function getMoviesByPage(page) {
  const data = filteredMovies.length > 0 ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 渲染頁碼條
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ""
  for (let page = 1; page <= numberOfPages; page++) {
    let pageActive = pageCurrent === page ? "active" : ""
    rawHTML += `
    <li class="page-item ${pageActive}"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// 根據不同 panelFlag 渲染電影清單
function renderMovieList(movies) {
  let rawHTML = ""
  const favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const favoriteMovieIds = favoriteMovies.map((movie) => movie.id)
  movies.forEach(function (movie) {
    const favoriteIcon = favoriteMovieIds.includes(movie.id) ? "fas fa-star" : "far fa-star"
    // 卡片模式渲染
    if (panelFlag === "card") {
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-3">
          <div class="card">
            <a href="##"><img src="${POSTER_URL + movie.image}" class="card-img-top btn-show-movie border" alt="Movie Poster" data-toggle="modal"
                data-target="#movie-modal" data-id="${movie.id}"></a>
            <div class="card-body row mb-n3">
              <div class="col-9 card-title d-inline-block text-nowrap     
                text-truncate">${movie.title}
              </div>
              <div class="col-3">
                <a href="##"><i class="${favoriteIcon} d-inline-block btn-add-favorite" data-id="${movie.id}"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      `
      // 清單模式渲染
    } else if (panelFlag === "list") {
      rawHTML += `
      <div class="col-10 pl-5 py-2 mx-auto border-top">
        <a href="##"><h5 class="card-title btn-show-movie py-1 my-2" data-toggle="modal"
        data-target="#movie-modal" data-id="${movie.id}">${movie.title}</h5></a>
      </div>  
      <div class="col-2 py-3 border-top">
        <a href="##"><i class="${favoriteIcon} d-inline-block btn-add-favorite" data-id="${movie.id}"></i></a>
      </div>
      `
    }
  })
  dataPanel.innerHTML = rawHTML
}

// 顯示電影詳細資料
function showMovieModal(id) {
  const modal = document.querySelector("#movie-modal")
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image img")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")
  // 區塊隱藏
  modal.classList.add("d-none")
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const { title, image, release_date, description } = response.data.results
      modalTitle.innerText = title
      modalImage.src = POSTER_URL + image
      modalDate.innerText = "release date : " + release_date
      modalDescription.innerText = description
      // 區塊顯示
      modal.classList.remove("d-none")
    })
    .catch((err) => console.log(err))
}

// 跳出動態收藏訊息
function showFavoriteAlert(message) {
  const alertNode = document.querySelector(".alert")
  // 將訊息 div 顯示出來
  alertNode.classList.remove("d-none")
  // 不透明度設為 1 , 大小為1.1倍
  let opacityValue = 0.1
  let scaleValue = 0
  alertNode.style.opacity = opacityValue
  alertNode.style.scale = scaleValue
  // 新增與移除的狀態處理
  if (message === "add") {
    alertNode.classList.remove("alert-secondary")
    alertNode.classList.add("alert-success")
    alertNode.innerHTML = "<h5>Add to favorite</h5>"
  } else if (message === "remove") {
    alertNode.classList.remove("alert-success")
    alertNode.classList.add("alert-secondary")
    alertNode.innerHTML = "<h5>Remove from favorite</h5>"
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
            alertNode.classList.add("d-none")
            clearInterval(IntervalID)
          }
        }, 20)
      }, 500)
    }
  }, 5)
}

// 加入最愛
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  if (list.some((movie) => movie.id === id)) {
    return
  }
  const movie = movies.find((movie) => movie.id === id)
  list.push(movie)
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}

// 移除最愛
function removeFromFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const movieIndex = list.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return
  list.splice(movieIndex, 1)
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}

// 監聽資料區
dataPanel.addEventListener("click", function onPanelClicked(event) {
  const target = event.target
  const id = Number(target.dataset.id)
  if (target.matches(".btn-show-movie")) {
    showMovieModal(id)
  }
  // 空心，加入收藏
  if (target.matches(".far.fa-star")) {
    showFavoriteAlert("add")
    target.className = target.className.replace("far", "fas")
    addToFavorite(id)
    // 實心，移除收藏
  } else if (target.matches(".fas.fa-star")) {
    showFavoriteAlert("remove")
    target.className = target.className.replace("fas", "far")
    removeFromFavorite(id)
  }
})

// 監聽搜尋按鈕
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  //條件篩選
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  // 錯誤處理： 無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert("請輸入有效字串！")
  }

  // 重新渲染畫面
  pageCurrent = 1
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(pageCurrent))
})

// 監聽 頁碼按鈕
paginator.addEventListener("click", function onPaginatorClicked(event) {
  const target = event.target
  // 如果被點擊的不是頁碼 a 標籤，直接跳出
  if (target.tagName !== "A") return

  // 重新渲染畫面
  pageCurrent = Number(target.dataset.page)
  renderPaginator(filteredMovies.length !== 0 ? filteredMovies.length : movies.length)
  renderMovieList(getMoviesByPage(pageCurrent))
})

// 監聽 switch按鈕
panelSwitch.addEventListener("click", function onPanelSwitchClicked(event) {
  const target = event.target
  if (!target.matches(".fa-th") && !target.matches(".fa-bars")) return
  // 卡片模式 panelFlag : card ; 清單模式 panelFlag : list
  const panelSwitchChildren = this.children
  panelFlag = target.dataset.mode
  for (let i = 0; i < panelSwitchChildren.length; i++) panelSwitchChildren[i].style.color = "black"
  target.style.color = "rgb(19, 102, 102)"
  renderMovieList(getMoviesByPage(pageCurrent))
})

// 頁面啟動時執行
axios
  .get(INDEX_URL)
  .then((response) => {
    // ... 展開運算
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))
