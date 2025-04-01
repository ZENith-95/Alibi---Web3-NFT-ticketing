import { useState, useEffect } from 'react';
import { icApi } from '@/lib/ic-api';
import type { Profile, GetProfileResponse, CreateProfileResponse } from '@/lib/ic-api';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await icApi.getProfile();
      
      if ('ok' in result) {
        setProfile(result.ok);
      } else {
        setError('Failed to fetch profile');
        setProfile(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (username: string, bio: string): Promise<CreateProfileResponse> => {
    try {
      setError(null);
      const result = await icApi.createProfile(username, bio);
      
      if ('ok' in result) {
        // Refresh profile after creation
        await fetchProfile();
      } else {
        setError('Failed to create profile');
      }
      
      return result;
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      return { err: { userNotAuthenticated: null } };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (profileData: Partial<Profile>) => {
    try {
      const response = await icApi.updateProfile(profileData);
      if (response && 'ok' in response) {
        await fetchProfile();
        return response.ok;
      }
      throw new Error('Failed to update profile');
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update profile');
    }
  };

  const deleteProfile = async () => {
    try {
      const response = await icApi.deleteProfile();
      if (response && 'ok' in response) {
        setProfile(null);
        return response.ok;
      }
      throw new Error('Failed to delete profile');
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete profile');
    }
  };

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
  };
} 