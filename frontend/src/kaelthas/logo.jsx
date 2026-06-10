/**
 * Kaelthas Logo — verwendet das hochgeladene PNG-Logo (Lich King / Frostmourne Style).
 * Der schwarze Hintergrund wird via mix-blend-mode: screen ausgestanzt.
 */
const LOGO_URL =
  'https://customer-assets.emergentagent.com/job_ashikuya-bb/artifacts/kils9qlc_logo4.png';

export function KaelthasLogo({ size = 64, className, style, ...props }) {
  return (
    <img
      src={LOGO_URL}
      alt="Kaelthas"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'block',
        width: size,
        height: size,
        objectFit: 'contain',
        mixBlendMode: 'screen',
        ...style,
      }}
      {...props}
    />
  );
}
