import app from "ags/gtk4/app"
import style from "./style.scss"
import TopBar from "./widget/TopBar"
import SideBar from "./widget/SideBar"
import RightMenu from "./widget/RightMenu"

app.start({
  css: style,
  main() {
    app.get_monitors().forEach((monitor) => {
      TopBar(monitor)
      SideBar(monitor)
      RightMenu(monitor)
    })
  },
})
