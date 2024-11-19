import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";

export default function Header() {
  const [cookie, , removeCookie] = useCookies(["accessToken"]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BE_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${cookie.accessToken}`,
          },
          withCredentials: true,
        }
      );
      removeCookie("accessToken", { path: "/" });
      navigate("/");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-purple-600">Code</span>
          <span className="text-2xl font-bold text-purple-600">Lab</span>
        </Link>
        <button
          className="bg-purple-600 text-white py-2 px-4 rounded-md font-medium hover:bg-purple-700 transition-colors duration-200"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
