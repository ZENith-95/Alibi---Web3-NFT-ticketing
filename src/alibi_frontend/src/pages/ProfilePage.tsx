import React, { useEffect, useState } from 'react';
import { icApi } from '../lib/ic-api';
import { useWallet } from '../components/WalletProvider'; // Import useWallet

export default function ProfilePage() {
  const { isAuthenticated, principal } = useWallet(); // Use useWallet hook

  const [profile, setProfile] = useState<{ username: string; bio: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setProfile(null); // Ensure profile is null if not authenticated
      return;
    }

    try {
      setLoading(true);
      const result = await icApi.getProfile();
      if (result.ok) {
        setProfile(result.ok);
      } else {
        // Handle profile not found or other errors
        setProfile(null);
        if (result.err && result.err !== 'profileNotFound') {
           setError(`Error fetching profile: ${result.err}`);
        }
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
      setError("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated]); // Add isAuthenticated to dependency array

  if (!isAuthenticated) {
    return <div>Please log in to view your profile.</div>;
  }

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <CreateProfileForm onProfileCreated={fetchProfile} />;
  }

  return (
    <EditProfileForm profile={profile} onProfileUpdated={fetchProfile} />
  );
}

interface CreateProfileFormProps {
  onProfileCreated: () => void;
}

function CreateProfileForm({ onProfileCreated }: CreateProfileFormProps) {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const result = await icApi.createProfile(username, bio);
      if (result.ok) {
        onProfileCreated(); // Refresh profile after creation
      } else {
        setError(`Error creating profile: ${result.err}`);
      }
    } catch (e) {
      console.error("Error creating profile:", e);
      setError("Failed to create profile.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h2>Create Profile</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={creating}
          />
        </div>
        <div>
          <label htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={creating}
          />
        </div>
        <button type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}

interface EditProfileFormProps {
  profile: { username: string; bio: string };
  onProfileUpdated: () => void;
}

function EditProfileForm({ profile, onProfileUpdated }: EditProfileFormProps) {
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      const result = await icApi.updateProfile(username, bio);
      if (result.ok) {
        onProfileUpdated(); // Refresh profile after update
      } else {
        setError(`Error updating profile: ${result.err}`);
      }
    } catch (e) {
      console.error("Error updating profile:", e);
      setError("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <h2>Edit Profile</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={updating}
          />
        </div>
        <div>
          <label htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={updating}
          />
        </div>
        <button type="submit" disabled={updating}>
          {updating ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
