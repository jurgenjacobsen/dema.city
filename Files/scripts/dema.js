function Markdown(input, preview) {
  this.update = function () {
    preview.innerHTML = markdown.toHTML(input.value);
  };
  input.editor = this;
  this.update();
}

window.onload = () => {
  twemoji.parse(document.body);
};

function hightlight(id) {
  const element = document.getElementById(id);
  if(!element) return;
  element?.classList.add('hightlight');
  setTimeout(() => {
    element?.classList.remove('hightlight');
  }, 2 * 1000);
}