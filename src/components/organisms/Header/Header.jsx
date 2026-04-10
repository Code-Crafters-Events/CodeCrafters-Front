import styles from "./Header.module.css";
import ButtonConnect from "../../atoms/ButtonConnect/ButtonConnect";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import LogoutIcon from "../../../assets/LOGOUT.png";
import DefaultAvatar from "../../../assets/avatar.jpg";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  return (
    <header className={styles.header}>
      <div className={styles.wrapperTitles}>
        <Link to="/home" className={styles.homeLink}>
          <h1>
            CODE<span className={styles.hyphon}>_</span>CRAFTERS
          </h1>
        </Link>
        <h2>Powered by Jennifer Cros</h2>
      </div>

      <nav className={styles.navHeader}>
        <NavLink
          to="/home/panel"
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          EVENTOS
        </NavLink>
        <NavLink
          to="/home/community"
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          COMUNIDAD
        </NavLink>
        <NavLink
          to="/home/tickets"
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          TICKETS
        </NavLink>
        <NavLink
          to="/home/profile"
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          PERFIL
        </NavLink>
      </nav>

      <div className={styles.buttonConnect}>
        {!user ? (
          <ButtonConnect
            BtnClass="connect"
            text="CONECTAR"
            path="/home/login"
          />
        ) : (
          <div className={styles.field_logged}>
            <div className={styles.fieldAvatar}>
              <img
                src={user.avatarUrl || DefaultAvatar}
                alt="avatar"
                className={styles.avatar}
                onClick={() => navigate("/home/panel")}
              />
            </div>
            <div className={styles.fieldLogout}>
              <img
                src={LogoutIcon}
                alt="LogOut"
                onClick={handleLogout}
                className={styles.logout_icon}
                title="Close session"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
