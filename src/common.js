function SidebarColor(id) {
  var sidebarList = document.querySelectorAll(".sidebar > ul > li")
  for (var i = 0; i < sidebarList.length; i++) {
    document.querySelectorAll(".sidebar > ul > li")[i].style.color = "black"
    document.querySelectorAll(".sidebar > ul > li")[i].style.background = 'rgb(' + [211,211,211].join(',') + ')'
  }

  document.getElementById(id).style.color="white"
  document.getElementById(id).style.background="black"
}

export default SidebarColor
