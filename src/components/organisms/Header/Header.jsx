import styles from "./Header.module.css";
import ButtonConnect from "../../atoms/ButtonConnect/ButtonConnect";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import LogoutIcon from "../../../assets/LOGOUT.png";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getAvatarUrl = () => {
    if (!user || !user.profileImage) return null;
    return user.profileImage.replace(
      "http://localhost:5173",
      "http://localhost:8080",
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  const avatarUrl = getAvatarUrl();
  const initial = user?.name?.[0]?.toUpperCase() || "?";

  return (
    <header className={styles.header}>
      <div className={styles.wrapperTitles}>
        <Link to="/home" className={styles.homeLink}>
          <h1 className={styles.headerMain}>
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
          to="/home/my-tickets"
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
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className={styles.avatar}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>{initial}</div>
              )}
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
