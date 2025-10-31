import React from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'

const ProfileInfo = () => {
  const { user } = useAuth()

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary-600">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {user?.firstName} {user?.lastName}
          </h3>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        <div className="space-y-4">
          <Button className="w-full">Edit Profile</Button>
          <Button variant="outline" className="w-full">Change Password</Button>
          <Button variant="outline" className="w-full">Addresses</Button>
        </div>
      </div>
    </Card>
  )
}

export default ProfileInfo
