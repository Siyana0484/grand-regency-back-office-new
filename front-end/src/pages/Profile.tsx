import React, { useEffect, useState } from "react";
import { getUserProfile } from "../apis/userApi";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import FadeLoader from "react-spinners/FadeLoader";
import UserProfile from "../components/User/UserProfile";

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    phone: string;
    roles: string[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserProfile(axiosPrivate);
        setUserData(response.data);
      } catch (error) {
        console.log("error at fetch single user:", error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <FadeLoader />
      </div>
    );
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      {userData && <UserProfile user={userData} />}
    </div>
  );
};

export default Profile;
