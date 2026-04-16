import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyTickets.module.css";
import { AuthContext } from "../../../context/auth/AuthContext";
import { ticketsApi } from "../../../services/ticketsApi";
import Button from "../../atoms/Button/Button";
import TicketModal from "../../organisms/TicketModal/TicketModal";

const MyTickets = () => {
  const [myTickets, setMyTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [ticketToSee, setTicketToSee] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadUserTickets();
    }
  }, [user?.id]);

  const loadUserTickets = async () => {
    setIsLoading(true);
    try {
      const res = await ticketsApi.getUserTickets(user.id);
      const data = res.data.content ?? res.data;
      setMyTickets(data);
    } catch (error) {
      console.error("Error al cargar tus tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTicket = (ticket) => {
    setTicketToSee({
      eventTitle: ticket.eventTitle,
      qrUrl: ticket.qrUrl,
      verificationCode: ticket.verificationCode,
      date: ticket.createdAt,
    });
    setModalOpen(true);
  };

  if (isLoading)
    return <p className={styles.loading}>Cargando tus entradas...</p>;

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mis Entradas</h1>
        <p className={styles.subtitle}>Gestiona tus accesos y códigos QR</p>
      </header>

      {myTickets.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Aún no tienes entradas para ningún evento.</p>
          <Button
            text="Explorar Eventos"
            BtnClass="neon"
            onClick={() => navigate("/home/community")}
          />
        </div>
      ) : (
        <div className={styles.grid}>
          {myTickets.map((t) => (
            <div key={t.id} className={styles.ticketCard}>
              <div className={styles.cardHeader}>
                <span className={styles.statusBadge}>Activo</span>
                <h3>{t.eventTitle}</h3>
              </div>

              <div
                className={styles.qrPreview}
                onClick={() => handleOpenTicket(t)}
              >
                <img src={t.qrUrl} alt="QR Preview" />
                <div className={styles.overlay}>
                  <span>Ampliar QR</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <Button
                  text="Ver QR / PDF"
                  BtnClass="neon"
                  onClick={() => handleOpenTicket(t)}
                />
                <Button
                  text="Info Evento"
                  BtnClass="cancel"
                  onClick={() => navigate(`/home/events/${t.eventId}`)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TicketModal ticket={ticketToSee} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
};

export default MyTickets;
