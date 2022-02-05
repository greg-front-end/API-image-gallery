window.addEventListener('DOMContentLoaded', () => {
  
  // After request from UNSPLASH API in the variable will be data of images
  let dataImages = null;

  // Here will be index of image which we want open in popup for full size
  let currentImage = 0;

  // API KEY and URL 
  const api_key = process.env.API_KEY,
        RANDOM_PHOTO_URL = `https://api.unsplash.com/photos/random?client_id=${api_key}&count=20`
     
  const galleryInner = document.querySelector('.gallery__inner'),
        notFoundPopup = document.querySelector('.gallery__not-found'),
        form = document.querySelector('.form'),
        formSearch = document.querySelector('.form__search'),
        formResetBtn = document.querySelector('.form__btn-reset');


  // Render card from data which get from api
  const creatCardImages = (dataImgs) => {
    dataImgs.forEach((item, index) => {
      const card = document.createElement('div');
      card.classList.add('gallery__card')
      card.innerHTML = `
      <img class="gallery__card-img" src="${item.urls.regular}" alt="Image">
      <div class="gallery__img-info">
      <a class="gallery__author-link" href="${item.user.links.html}" title="author page">
      <img class="gallery__author-img" src="${item.user.profile_image.medium}" alt="Avatar">
      </a>
      <h6 class="gallery__author-name" title="Author name">${item.user.name}</h6>
      </div>      
      `
      galleryInner.appendChild(card)

      // Create image for popup full image
      card.addEventListener('click', () => {
         currentImage = index
         showImagePopup(item)
      })
    })
  }

  // Show popup with full size image when click on image
  const showImagePopup = (item) => {
    let popup = document.querySelector('.image-popup')

    const downloadBtn = document.querySelector('.image-popup__download-btn'),
          closeBtn = document.querySelector('.image-popup__close-btn'),
          image = document.querySelector('.image-popup__img'),
          authorPage = document.querySelector('.image-popup__author-link'),
          authorLogo = document.querySelector('.image-popup__author-img'),
          authorName = document.querySelector('.image-popup__author-name');


    popup.classList.add('image-popup--active')
    downloadBtn.href = item.links.html
    image.src = item.urls.regular
    authorPage.href = item.user.links.html
    authorLogo.src = item.user.profile_image.medium
    authorName.textContent = item.user.name

    closeBtn.addEventListener('click', () => {
      popup.classList.remove('image-popup--active')
    })
          
  }

  // Next and Prev btns
  const prevBtn = document.querySelector('.image-popup__pre-btn'),
        nextBtn = document.querySelector('.image-popup__next-btn');

  // Change to previous image
  prevBtn.addEventListener('click', () => {
    if (currentImage > 0) {
      currentImage--
      showImagePopup(dataImages[currentImage])
    }
  })
  
  //Change to previous image
  nextBtn.addEventListener('click', () => {
    if (currentImage < dataImages.length) {
      currentImage++ 
      showImagePopup(dataImages[currentImage])
    }
  })
  // Fetch requset for get data
  const getResource = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Could not fetch ${url}, status: ${res.status}`);
    } else {
      galleryInner.innerHTML = ''
    }

    return await res.json();
  };

  // Get random images from URL
  const getImages = (url) => {
    getResource(url)
    .then(data => {
      if (url === RANDOM_PHOTO_URL) {
        dataImages = data
      } else {
        dataImages = data;
      }
      creatCardImages(dataImages)
    }) 
  }

  // If user doesn't search anything get random iamges
  getImages(RANDOM_PHOTO_URL)

  // When page loaded set focus search input
  formSearch.focus()
  
  formSearch.addEventListener('input', () => {
    // If user writes something on input search show reset button
    if (formSearch.value) {
      formResetBtn.classList.add('form__btn-reset--active')
    } else {
      // Else hide the reset button and get random images
      formResetBtn.classList.remove('form__btn-reset--active')
    }
  })

  // When user click on reset button 
  formResetBtn.addEventListener('click', () => {
    // Remove resset button for input
    formResetBtn.classList.remove('form__btn-reset--active')
    // Remove popup of not-found if it open
    if (notFoundPopup.classList.contains('gallery__not-found--active')) {
      notFoundPopup.classList.remove('gallery__not-found--active')
      // Then get random images
      getImages(RANDOM_PHOTO_URL)
    }
    // Stay focus on search input
    formSearch.focus()
  })

  // Save previous value of search for check if user white then value again don't get images
  let prevSearchValue = null
  form.addEventListener('submit', (e) => {
    e.preventDefault()

    // Get all values of form (in our case it will be only input)
    const formData = new FormData(form);
    // Convert the data of values to object
    const inputValues = Object.fromEntries(formData.entries());
    // Make URL for search request on fetch
    const SEARH_URL = `https://api.unsplash.com/search/photos?client_id=${api_key}&query=${inputValues.search}&per_page=20`

    // Get data of images when user set request in search input
    if (inputValues.search && prevSearchValue !== inputValues.search) {
      getResource(SEARH_URL)
        .then(data => {
          if (SEARH_URL === RANDOM_PHOTO_URL) {
            dataImages = data
          } else {
            dataImages = data.results
            if (data.results.length) {
              // If data of images is not empty render cards with images
              creatCardImages(data.results)
            } else {
              // If the search request return undefined show popup - sorry we don't find anything
              notFoundPopup.classList.add('gallery__not-found--active')
              notFoundPopup.innerHTML = `<p>Sorry, we don't found anything with the <span style='color: #ff552a;font-weight: bold;text-decoration: underline;'> ${formSearch.value}</span> request..</p>`
            }
          }
          // Save search input value 
          prevSearchValue = inputValues.search
        }) 
    }    
  })

})