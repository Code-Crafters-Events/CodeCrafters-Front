import { useNavigate } from "react-router-dom";
import styles from "./TicketModal.module.css";
import Button from "../../atoms/Button/Button";
import jsPDF from "jspdf";

const TicketModal = ({ ticket, onClose }) => {
  const navigate = useNavigate();

  if (!ticket) return null;

  const downloadPDF = () => {
    const title = ticket.eventTitle || "Entrada Crafters";
    const code = ticket.verificationCode || "N/A";
    const date = ticket.date || "Consultar en la aplicación";
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(0, 255, 157);
    doc.text(`Tu Entrada`, 20, 20);

    doc.setFontSize(14);
    doc.setTextColor(160, 160, 184);
    doc.text(`${title}`, 20, 30);

    doc.setDrawColor(0, 255, 157);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 120);

    doc.text(`Código de Verificación:`, 20, 45);
    doc.setFontSize(12);
    doc.setTextColor(0, 255, 157);
    doc.text(`${code}`, 20, 52);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 120);
    doc.text(`Fecha del Evento:`, 20, 62);
    doc.setFontSize(12);
    doc.setTextColor(0, 255, 157);
    doc.text(`${date}`, 20, 69);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 120);
    doc.text(`Código QR:`, 20, 85);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = ticket.qrUrl;

    img.onload = () => {
      doc.addImage(img, "PNG", 55, 95, 100, 100);

      doc.setFontSize(9);
      doc.setTextColor(150, 150, 170);
      doc.text(`Presenta este código QR en la entrada del evento`, 105, 210, {
        align: "center",
      });
      doc.text(`Code Crafters - Plataforma de Eventos`, 105, 216, {
        align: "center",
      });

      doc.save(`Ticket-${title.replace(/\s+/g, "_")}.pdf`);
    };

    img.onerror = () => {
      console.error("No se pudo cargar la imagen del QR para el PDF");
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 170);
      doc.text(`[QR no disponible - Consulta tu código arriba]`, 105, 150, {
        align: "center",
      });
      doc.save(`Ticket_${title.replace(/\s+/g, "_")}_sin_qr.pdf`);
    };
  };

  const goToEvent = () => {
    onClose();
    navigate(`/home/info/${ticket.eventId}`);
  };

  const goToMyTickets = () => {
    onClose();
    navigate("/home/my-tickets");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>¡Entrada Confirmada!</h2>
        <p className={styles.subtitle}>
          Evento: <strong>{ticket.eventTitle}</strong>
        </p>

        <div className={styles.qrContainer}>
          <img src={ticket.qrUrl} alt="Código QR" className={styles.qrImage} />
          <p className={styles.codeLabel}>{ticket.verificationCode}</p>
          {ticket.date && <p className={styles.dateLabel}>{ticket.date}</p>}
        </div>

        <div className={styles.actions}>
          <Button text="Descargar PDF" BtnClass="neon" onClick={downloadPDF} />
        </div>

        <div className={styles.navigationActions}>
          <Button
            text="Ver Info del Evento"
            BtnClass="secondary"
            onClick={goToEvent}
          />
          <Button
            text="Mis Entradas"
            BtnClass="secondary"
            onClick={goToMyTickets}
          />
          <Button text="Cerrar" BtnClass="cancel" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
