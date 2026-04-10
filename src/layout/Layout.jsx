import { Outlet } from "react-router-dom";
import Header from "../components/organisms/Header/Header";
import { AuthProvider } from "../context/auth/AuthProvider";
import Footer from "../components/organisms/Footer/Footer";

const Layout = () => {
  return (
    <>
      <AuthProvider>
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </AuthProvider>
    </>
  );
};

export default Layout;
