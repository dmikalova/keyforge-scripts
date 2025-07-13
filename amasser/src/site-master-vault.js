const handleMasterVaultSync = () => {
  loading(true);

  chrome.cookies.get(
    {
      name: 'auth',
      url: 'https://www.keyforgegame.com',
    },
    cookie => startRequest(cookie)
  );
};

const startRequest = cookie => {
  if (!cookie) {
    alert('You must login to Master Vault first');
    loading(false);
    return;
  }

  const requestInit = {
    credentials: 'include',
    headers: {
      accept: 'application/json',
      'accept-language': 'en-us',
      authorization: `Token ${cookie.value}`,
      'x-authorization': `Token ${cookie.value}`,
    },
  };

  getMasterVaultUser(requestInit)
    .then(userId => getMasterVaultLibrary(requestInit, userId, 1, []))
    .then(library => saveLibrary(library))
    .catch(error => {
      console.error('Error fetching Master Vault library:', error);
      loading(false);
    });
};

const loading = isLoading => {
  console.log('loading:', isLoading);
  // if (isLoading) {
  //   libraryText.innerHTML = 'Loading'
  //   libraryText.classList.add('loading')
  // } else {
  //   libraryText.innerHTML = 'Done'
  //   libraryText.classList.remove('loading')
  // }
};

const getMasterVaultUser = requestInit =>
  fetch('https://www.keyforgegame.com/api/users/self/', requestInit)
    .then(response => response.json())
    .then(user => user.data.id);




const saveLibrary = library => {
  let libraryMin = [];
  library.forEach(deck => {
    libraryMin.push(deck.id);
  });

  chrome.runtime.sendMessage(
    {
      popupQuery: 'saveLibrary',
      library: libraryMin,
    },
    () => {
      loading(false);
    }
  );
};

const getMasterVaultLibrary = (requestInit, userId, page, library) =>
  new Promise((resolve, reject) => {
    fetch(
      `https://www.keyforgegame.com/api/users/v2/${userId}/decks/?page=${page}&page_size=10&search=&ordering=-date`,
      requestInit
    )
      .then(response => response.json())
      .then(response => {
        library = library.concat(response.data);

        if (library.length != response.count) {
          page = page + 1;
          getMasterVaultLibrary(requestInit, userId, page, library)
            .then(resolve)
            .catch(reject);
        } else {
          resolve(library);
        }
      });
  });
