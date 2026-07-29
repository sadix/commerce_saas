import logoImage from '../../public/images/logos/logo-baobuy-colored.png';
import whiteLogo from '../../public/images/logos/logo-baobuy-white.png'

export function Logo() {
  return (
    <div className="flex items-center justify-center">
      <img src={logoImage.src} alt="Logo" className="h-12 w-auto" />
    </div>
  );
}