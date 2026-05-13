import { FaPlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface ListItemProps {
  name: string;
  href: string;
  image: string;
}

const ListItem: React.FC<ListItemProps> = ({ name, href, image }) => {
  const navigate = useNavigate();
  return (
    <button
      className="relative group flex items-center rounded-md overflow-hidden gap-x-2 bg-neutral-100/10 hover:bg-neutral-100/20 transition pr-4"
      onClick={() => navigate(href)}
    >
      <div className="relative min-h-16 min-w-16">
        <img
          src={image}
          alt={name}
          className="object-cover w-16 h-16"
          loading="lazy"
        />
      </div>
      <p className="font-medium truncate py-5">{name}</p>
      <div className="absolute transition opacity-0 rounded-full flex items-center justify-center bg-green-500 p-4 drop-shadow-md right-5 group-hover:opacity-100 hover:scale-100 translate-y-2 group-hover:translate-y-0">
        <FaPlay className="text-black" />
      </div>
    </button>
  );
};

export default ListItem;
