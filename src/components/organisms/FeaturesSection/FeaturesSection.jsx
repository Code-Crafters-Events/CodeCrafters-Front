import SectionLabel from '../../atoms/SectionLabel/SectionLabel';
import FeatureCard from '../../molecules/FeatureCard/FeatureCard';
import styles from './FeaturesSection.module.css';

const FEATURES = [
  {
    number: '01',
    iconLabel: 'EV',
    iconColor: 'var(--c)',
    iconBorder: 'rgba(0,245,255,0.3)',
    title: 'Gestión de eventos',
    description: 'Crea, edita y elimina tus eventos. Filtra por categoría, precio, modalidad y fecha. Paginación de 15 por página.',
  },
  {
    number: '02',
    iconLabel: 'TK',
    iconColor: 'var(--c2)',
    iconBorder: 'rgba(255,45,120,0.3)',
    title: 'Ticketing & pagos',
    description: 'Genera tickets al inscribirte. Pasarela Stripe para eventos de pago. Historial de asistencias en tu perfil.',
  },
  {
    number: '03',
    iconLabel: 'ID',
    iconColor: 'var(--c3)',
    iconBorder: 'rgba(0,255,157,0.3)',
    title: 'Perfil de usuario',
    description: 'Gestiona nombre, avatar y credenciales. Spring Security + JWT. Visualiza tus eventos creados.',
  },
  {
    number: '04',
    iconLabel: 'NET',
    iconColor: 'var(--c4)',
    iconBorder: 'rgba(155,93,229,0.3)',
    title: 'Red social tech',
    description: 'Consulta quién asiste a cada evento. Conecta con la comunidad tecnológica global. Colabora e innova.',
  },
];

export default function FeaturesSection() {
  return (
    <section aria-label="Funcionalidades">
      <SectionLabel tag="// módulos del sistema" title="Funcionalidades" />
      <div className={styles.grid}>
        {FEATURES.map((feat) => (
          <FeatureCard key={feat.number} {...feat} />
        ))}
      </div>
    </section>
  );
}
