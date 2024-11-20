import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Home, ArrowLeft } from "lucide-react";

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

  const handleHomeNavigation = async () => {
    try {
      const response = await axios.get(
          `${import.meta.env.VITE_BE_URL}/verified/getRole`,
          {
            headers: {
              Authorization: `Bearer ${cookie.accessToken}`,
            },
            withCredentials: true,
          }
      );
      console.log(response);
      const { role } = response.data;
      console.log(role);
      // Redirect based on user role
      switch(role) {
        case "student":
          navigate('/studentDashboard');
          break;
        case "author":
          navigate('/profDashboard');
          break;
        default:
          // Fallback to home or login if role is unrecognized
          navigate('/');
      }
    } catch (err) {
      console.error("Error identifying user:", err);
      // Fallback navigation in case of error
      navigate('/');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
      <header className="bg-white shadow-sm py-4">
        <div className="flex justify-between items-center  mx-4 mx-max-8xl ">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-purple-600">Code</span>
            <span className="text-2xl font-bold text-purple-600">Lab</span>
          </Link>
          <div className="flex items-center space-x-10">
            {/* Back button */}
            <button
                onClick={handleGoBack}
                className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
                aria-label="Go Back"
            >
              <ArrowLeft size={24} />
            </button>

            {/* Home button */}
            <button
                onClick={handleHomeNavigation}
                className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
                aria-label="Home Dashboard"
            >
              <Home size={24} />
            </button>

            {/* Logout button */}
            <button
                className="bg-purple-600 text-white py-2 px-4 rounded-md font-medium hover:bg-purple-700 transition-colors duration-200"
                onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
  );
}