import React, { useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    phone: string;
    roles: string[];
    avatarUrl?: string;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center mr-4">
            <img
              src={"/images/sampleImage.png"}
              alt="profile img"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold">{user.name}</h3>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <p className="mt-1">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Phone Number
              </label>
              <p className="mt-1">{user.phone}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Roles
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {user?.roles?.map((role, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-200 rounded-full text-sm capitalize"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="border border-gray-300 py-2 px-6 rounded-full cursor-pointer hover:bg-gray-400"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default UserProfile;
