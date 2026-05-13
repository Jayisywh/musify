import Sidebar from "../../components/Sidebar";
import Player from "../../components/Player";
import { Outlet } from "react-router-dom";
import { ModalProvider } from "../../providers/ModalProvider";

const Layout = () => {
  return (
    <ModalProvider>
      <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 w-full p-2">
          <Sidebar>
            <Outlet />
          </Sidebar>
        </div>

        <Player />
      </div>
    </ModalProvider>
  );
};

export default Layout;
