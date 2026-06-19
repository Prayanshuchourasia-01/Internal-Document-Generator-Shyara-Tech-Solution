import {
  FaHome,
  FaBuilding,
  FaHistory,
  FaFileAlt,
  FaCog
} from "react-icons/fa";

import { MdOutlinePostAdd } from "react-icons/md";
import logo from "../assets/logo.png";

import { NavLink } from "react-router-dom";

function Sidebar() {

  const menu = [
    {
      name: "Home",
      path: "/",
      icon: <FaHome />
    },
    {
      name: "Departments",
      path: "/departments",
      icon: <FaBuilding />
    },
    {
      name: "History",
      path: "/history",
      icon: <FaHistory />
    },
    {
      name: "Templates",
      path: "/templates",
      icon: <FaFileAlt />
    },
    {
      name: "Generate Document",
      path: "/generate-document",
      icon: <MdOutlinePostAdd />
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <FaCog />
    }
  ];

  return (
    <aside className="sidebar">

        <div className="logo">
      <img src={logo} alt="logo" />
    </div>


      <div className="menu">

        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}

      </div>

      <div className="version">
        Shyara DocuFlow Version 1.0
      </div>
      
      

    </aside>
  );
}

export default Sidebar;