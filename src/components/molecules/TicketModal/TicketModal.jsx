import styles from "./TicketModal.module.css";
import Button from "../../atoms/Button/Button";
import jsPDF from "jspdf";

const TicketModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Tu Entrada para " + ticket.eventTitle, 20, 20);
    doc.setFontSize(12);
    doc.text(`Código de verificación: ${ticket.verificationCode}`, 20, 30);
    if (ticket.date) doc.text(`Fecha: ${ticket.date}`, 20, 40);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = ticket.qrUrl;
    img.onload = () => {
      doc.addImage(img, "PNG", 55, 50, 100, 100);
      doc.save(`Ticket-${ticket.eventTitle.replace(/\s+/g, "_")}.pdf`);
    };
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
        </div>

        <div className={styles.actions}>
          <Button text="Descargar PDF" BtnClass="neon" onClick={downloadPDF} />
          <Button text="Cerrar" BtnClass="cancelModal" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
