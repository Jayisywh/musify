import { useMemo } from "react";
import { BiSearch } from "react-icons/bi";
import { HiHome } from "react-icons/hi";
import { useLocation } from "react-router-dom";
import Box from "./Box";
import SidebarItem from "./SidebarItem";
import Library from "./Library";
import MobileLibraryBtn from "./MobileLibrary";
import MobileTopNav from "./MobileTopNav";

type SidebarProps = {
  children: React.ReactNode;
};

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const location = useLocation();

  const routes = useMemo(
    () => [
      {
        icon: HiHome,
        label: "Home",
        active: !["/search", "/dashboard"].includes(location.pathname),
        href: "/",
      },
      {
        icon: BiSearch,
        label: "Search",
        active: location.pathname === "/search",
        href: "/search",
      },
    ],
    [location.pathname],
  );

  return (
    <div className="flex h-full w-full min-w-0 gap-2">
      <aside className="hidden h-full w-70 shrink-0 flex-col gap-y-2 bg-black md:flex lg:w-75">
        <Box>
          <div className="flex flex-col gap-y-4 px-5 py-4">
            {routes.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </div>
        </Box>

        <Box className="overflow-y-auto flex-1 min-h-0">
          <Library />
        </Box>
      </aside>

      <main className="h-full min-w-0 flex-1 overflow-hidden">
        <div className="h-full w-full overflow-y-auto">{children}</div>
      </main>

      <MobileTopNav />
      <MobileLibraryBtn />
    </div>
  );
};

export default Sidebar;
