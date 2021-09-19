window.onload = () => {
  twemoji.parse(document.body);

  ResizeNav();

  $('.bar').hide();

  if(location.pathname === '/login' || location.pathname === '/signup') {
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
};

window.addEventListener('resize', ResizeNav);

function ResizeNav() {
  let width = $(window).width();
  $('#navbar').width(width - 20);
};