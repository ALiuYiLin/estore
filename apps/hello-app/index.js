const btn = document.getElementById('action')
const desc = document.getElementById('desc')

if (btn && desc) {
  btn.addEventListener('click', () => {
    desc.textContent = '按钮已点击'
  })
}
