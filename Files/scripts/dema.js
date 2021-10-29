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