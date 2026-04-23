import styles from "./PrivacyPolicy.module.css";

const PrivacyPolicy = () => {
  return (
    <div className={styles.wrapper}>
      <section className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Protocolo de Privacidad</h1>
          <p className={styles.update}>Última actualización: [14 de Abril del 2026]</p>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.subtitle}>1. Recopilación de Datos</h2>
            <p className={styles.text}>
              En el ecosistema de nuestra plataforma, recolectamos información
              esencial para el funcionamiento de los eventos, tales como nombre
              de usuario, correo electrónico y preferencias de categoría
              (Presencial u Online).
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.subtitle}>2. Uso de la Información</h2>
            <p className={styles.text}>
              Tus datos se utilizan exclusivamente para:
            </p>
            <ul className={styles.list}>
              <li>Gestionar tu participación en eventos.</li>
              <li>Sincronizar filtros de búsqueda personalizados.</li>
              <li>Enviar notificaciones críticas del sistema.</li>
              <li>Compras</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.subtitle}>3. Seguridad de Encriptación</h2>
            <p className={styles.text}>
              Implementamos capas de seguridad basadas en estándares modernos
              para proteger tu identidad. No compartimos tus credenciales con
              megacorporaciones externas ni terceros sin tu consentimiento
              explícito.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.subtitle}>4. Tus Derechos</h2>
            <p className={styles.text}>
              Como usuario, tienes derecho a acceder, rectificar o purgar tus
              datos de nuestra base de datos en cualquier momento a través de la
              configuración de tu perfil o contactando con el soporte técnico.
            </p>
          </section>
        </div>

        <footer className={styles.footer}>
          <p className={styles.contactText}>¿Dudas sobre el protocolo?</p>
          <a href="mailto:codecraftersevents@gmail.com" className={styles.contactBtn}>
            Contactar Soporte
          </a>
        </footer>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
