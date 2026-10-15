import Image from "next/image";
import Button from "../Button";
import "./PrimaryNav.css";
import logo from "../../Assets/Logo.svg";
import sealCheckIcon from "../../Assets/Icons/Seal check.svg";
import userIcon from "../../Assets/Icons/User.svg";
import resourcesIcon from "../../Assets/Icons/Resources.svg";
import chevronDownIcon from "../../Assets/Icons/Chevron down.svg";
import searchIcon from "../../Assets/Icons/Search.svg";

const PRACTICE_AREA_LINKS = [
  "Personal Injury",
  "Abuse Claims",
  "Class Action",
  "Our lawyers",
  "Locations",
];

export default function PrimaryNav() {
  return (
    <header className="pnavNav">
      <div className="pnavTopBar">
        <div className="pnavTopBarInner">
          <a href="#" className="pnavTopBarLink pnavTagline">
            <Image src={sealCheckIcon} alt="" width={20} height={20} />
            <span>No win, no fee. No fear</span>
          </a>
          <div className="pnavTopBarLinks">
            <a href="#" className="pnavTopBarLink">
              <Image src={userIcon} alt="" width={20} height={20} />
              <span>About</span>
            </a>
            <a href="#" className="pnavTopBarLink">
              <Image src={resourcesIcon} alt="" width={20} height={20} />
              <span>Resources</span>
            </a>
          </div>
        </div>
      </div>

      <div className="pnavMainBar">
        <div className="pnavMainBarInner">
          <div className="pnavLogoAndMenu">
            <a href="#" className="pnavLogo">
              <Image src={logo} alt="Arnold Thomas & Becker Lawyers" fill priority />
            </a>
            <nav className="pnavMenuItems" aria-label="Primary">
              {PRACTICE_AREA_LINKS.map((label) => (
                <a href="#" className="pnavNavLink" key={label}>
                  <span>{label}</span>
                  <Image src={chevronDownIcon} alt="" width={20} height={20} />
                </a>
              ))}
            </nav>
          </div>

          <div className="pnavUtilities">
            <button type="button" className="pnavSearchButton" aria-label="Search">
              <Image src={searchIcon} alt="" width={44} height={44} />
            </button>
            <Button href="#" variant="primary" size="sm" mode="light">
              Speak with a lawyer
            </Button>
            <Button href="tel:1300333300" variant="secondary" size="sm" mode="light" icon={false}>
              Call 1300 333 300
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
