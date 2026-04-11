import { useNavigate } from "react-router-dom";

import HeroSection from "../../components/organisms/HeroSection/HeroSection";
import Ticker from "../../components/molecules/Ticker/Ticker";
import StatsStrip from "../../components/molecules/StatsStrip/StatsStrip";
import EventsSection from "../../components/organisms/EventsSection/EventsSection";
import FeaturesSection from "../../components/organisms/FeaturesSection/FeaturesSection";

import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <HeroSection
        onRegister={() => navigate("/home/register")}
        onCommunity={() => navigate("/home/community")}
      />
      <Ticker />
      <StatsStrip />
      <EventsSection onEventClick={(id) => navigate(`/home/info/${id}`)} />
      <FeaturesSection />
    </main>
  );
}
