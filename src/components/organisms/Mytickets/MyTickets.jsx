import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyTickets.module.css";
import { AuthContext } from "../../../context/auth/AuthContext";
import { ticketsApi } from "../../../services/ticketsApi";
import { eventsApi } from "../../../services/eventsApi";
import { formatDate } from "../../../utils/dateFormatter";
import Button from "../../atoms/Button/Button";
import TicketModal from "../../molecules/TicketModal/TicketModal";
import ScrollToTop from "../../atoms/ScrollToTop/ScrollToTop";

const ITEMS_PER_PAGE = 15;

const MyTickets = () => {
  const [myTickets, setMyTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [ticketToSee, setTicketToSee] = useState(null);

  const loadUserTickets = useCallback(
    async (page) => {
      if (!user?.id) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await ticketsApi.getByUser(user.id, page, ITEMS_PER_PAGE);
        const data = res.data.content ?? res.data;

        const validTickets = data.filter(
          (t) => t.paymentStatus === "COMPLETED" || t.paymentStatus === "FREE",
        );

        setMyTickets(validTickets);
        const totalElements = res.data.totalElements ?? data.length;
        setTotalPages(Math.ceil(totalElements / ITEMS_PER_PAGE));
        setCurrentPage(page);

        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Error al cargar tickets:", error);
        setError("No se pudieron cargar tus entradas.");
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    loadUserTickets(0);
  }, [loadUserTickets]);

  const handleOpenTicket = async (t) => {
    try {
      const eventRes = await eventsApi.getById(t.eventId);
      const event = eventRes.data;

      const formattedDate = formatDate(event.date, event.time);

      setTicketToSee({
        id: t.id,
        eventId: t.eventId,
        eventTitle: t.eventTitle,
        verificationCode: t.verificationCode,
        qrUrl: t.qrUrl,
        date: formattedDate,
      });
      setModalOpen(true);
    } catch (error) {
      console.error("Error al obtener detalles del evento:", error);
      setTicketToSee({
        id: t.id,
        eventId: t.eventId,
        eventTitle: t.eventTitle,
        verificationCode: t.verificationCode,
        qrUrl: t.qrUrl,
        date: "Consultar en el evento",
      });
      setModalOpen(true);
    }
  };

  if (isLoading && myTickets.length === 0) {
    return <div className={styles.loading}>Cargando tus entradas...</div>;
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mis Entradas</h1>
        <p className={styles.subtitle}>Gestiona tus accesos de forma rápida</p>
      </header>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && myTickets.length === 0 && (
        <div className={styles.emptyState}>
          <p>Aún no tienes entradas.</p>
          <Button
            text="Explorar Eventos"
            BtnClass="neon"
            onClick={() => navigate("/home/community")}
          />
        </div>
      )}

      {!isLoading && !error && myTickets.length > 0 && (
        <>
          <div className={styles.grid}>
            {myTickets.map((t) => (
              <div key={t.id} className={styles.ticketCard}>
                <div
                  className={styles.qrPreview}
                  onClick={() => handleOpenTicket(t)}
                >
                  <img src={t.qrUrl} alt="QR" />
                  <div className={styles.overlay}>
                    <span>Ampliar QR</span>
                  </div>
                </div>

                <div className={styles.ticketInfo}>
                  <span className={styles.statusBadge}>
                    {t.paymentStatus === "FREE" ? "Invitación" : "Entrada"}
                  </span>
                  <h3>{t.eventTitle}</h3>
                  <p className={styles.code}>
                    Ref: {t.verificationCode || "Cargando..."}
                  </p>
                </div>

                <div className={styles.cardActions}>
                  <Button
                    text="Ver Ticket"
                    BtnClass="neon"
                    onClick={() => handleOpenTicket(t)}
                  />
                  <Button
                    text="Info Evento"
                    BtnClass="secondary"
                    onClick={() => navigate(`/home/info/${t.eventId}`)}
                  />
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${
                    i === currentPage ? styles.dotActive : ""
                  }`}
                  onClick={() => loadUserTickets(i)}
                  aria-label={`Página ${i + 1}`}
                  aria-current={i === currentPage ? "page" : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && ticketToSee && (
        <TicketModal ticket={ticketToSee} onClose={() => setModalOpen(false)} />
      )}

      <ScrollToTop />
    </section>
  );
};

export default MyTickets;
