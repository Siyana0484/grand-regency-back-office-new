import { useEffect, useState } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import { useAuth } from "../hooks/useAuth";
import { Outlet } from "react-router-dom";
import FadeLoader from "react-spinners/FadeLoader";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (error) {
        console.log("err persist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!auth?.accessToken) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <FadeLoader />
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default PersistLogin;
