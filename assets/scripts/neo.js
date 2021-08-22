window.onload = () => {
  twemoji.parse(document.body);
  Theme();
};


if(location.pathname === '/login') {
  const signUpButton = document.getElementById('signUp');
  const signInButton = document.getElementById('signIn');
  const container = document.getElementById('container');
  
  signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
  });

  signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
  });

  var snackbar = document.getElementById("snackbar");
  if(snackbar.innerHTML.length > 1) {
    snackbar.className = "show";
    setTimeout(function() { 
      snackbar.className = snackbar.className.replace("show", ""); 
    }, 2700);
  }
}

function Theme(tname) {
  let theme = tname ? tname : getCookie('THEME');
  setCookie('THEME', theme, 999);
  let root = document.documentElement.style;
  switch(theme) {
    case 'LIGHT': {
      root.setProperty('--body-color', '#fafafa');
      root.setProperty('--container--color', '#eeeeee');
      root.setProperty('--sec-color', '#212121');
      root.setProperty('--text-color', '#58555e');
      root.setProperty('--text-color-light', '#a5a1aa');
      root.setProperty('--text-color-extra-light', '#ffffff');
      root.setProperty('--first-color-light', '#292929');
    };
    break;
    default: {
      root.setProperty('--body-color', '#1c1c1c');
      root.setProperty('--container--color', '#202020');
      root.setProperty('--sec-color', '#212121');
      root.setProperty('--text-color', '#58555e');
      root.setProperty('--text-color-light', '#a5a1aa');
      root.setProperty('--text-color-extra-light', '#ffffff');
      root.setProperty('--first-color-light', '#292929');
    }
  }
  updateIcons();
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  return cname;
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function updateIcons() {
  document.querySelectorAll('box-icon').forEach((b) => {
    if(getCookie('THEME') && getCookie('THEME') === 'LIGHT') {
      b.setAttribute('color', '#58555e');
    } else {
      b.setAttribute('color', 'white');
    }
  });
}