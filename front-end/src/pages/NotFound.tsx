import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-2">Oops! Page not found.</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;
