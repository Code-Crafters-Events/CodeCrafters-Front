import { Outlet } from "react-router-dom";
import Header from "../components/organisms/Header/Header";
import Footer from "../components/organisms/Footer/Footer";
import styles from "./Layout.module.css";

const Layout = () => {
  return (
    <>
      <div className={styles.wrapper}>
        <Header />
        <main className={styles.main}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
