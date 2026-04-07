import { ReactNode } from "react";
import { Link } from "react-router-dom";
import schoolLogo from "@/assets/school-logo.png";
import ProfileDropdown from "@/components/ProfileDropdown";

interface NavbarProps {
  children?: ReactNode;
  showProfile?: boolean;
}

const Navbar = ({ children, showProfile = true }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-40 bg-primary shadow-sm">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src={schoolLogo} alt="Logo" width={32} height={32} className="rounded-full bg-primary-foreground p-1" />
          <span className="font-semibold text-sm hidden sm:inline text-primary-foreground">Einstein School</span>
        </Link>
        <div className="flex items-center gap-3">
          {children}
          {showProfile && <ProfileDropdown />}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
