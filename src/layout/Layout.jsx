import { Outlet } from "react-router-dom";
import Header from "../components/organisms/Header/Header";
import Footer from "../components/organisms/Footer/Footer";

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
