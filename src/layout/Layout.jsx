import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/organisms/Header/Header";
import Footer from "../components/organisms/Footer/Footer";
import styles from "./Layout.module.css";
import Toast from "../components/atoms/Toast/Toast";

const Layout = () => {
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    const handleApiError = (event) => {
      setGlobalError(event.detail);
    };
    window.addEventListener("api-connection-error", handleApiError);
    window.addEventListener("api-server-error", handleApiError);

    return () => {
      window.removeEventListener("api-connection-error", handleApiError);
      window.removeEventListener("api-server-error", handleApiError);
    };
  }, []);

  return (
    <>
      <div className={styles.wrapper}>
        <Header />
        <main className={styles.main}>
          <Outlet />
        </main>
        <Footer />
      </div>

      {globalError && (
        <Toast
          message={globalError}
          type="error"
          duration={0}
          onClose={() => setGlobalError(null)}
        />
      )}
    </>
  );
};

export default Layout;
