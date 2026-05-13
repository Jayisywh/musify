import { Link, Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="flex h-full text-white">
      {/* Sidebar */}
      <div className="w-60 bg-black p-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Artist Panel</h2>

        <Link to="/dashboard/songs" className="hover:text-green-400">
          My Songs
        </Link>

        <Link to="/dashboard/albums" className="hover:text-green-400">
          My Albums
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
