function SidebarColor(id) {
  var referrer = document.getElementById("referrer")
  document.getElementById(referrer.value).style.color = "black"
  document.getElementById(referrer.value).style.background = 'rgb(' + [211,211,211].join(',') + ')'
  referrer.value = id

  document.getElementById(id).style.color="white"
  document.getElementById(id).style.background="black"
}

export default SidebarColor
