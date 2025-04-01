'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export default function OrganizerSettingsPage() {
  const { isAuthenticated } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    socialLinks: profile?.socialLinks || {
      twitter: '',
      instagram: '',
      linkedin: '',
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please connect your wallet to manage your profile settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile(formData);
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const platform = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your organizer profile information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-2">
                Bio
              </label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium mb-2">
                Website
              </label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Social Links</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="social.twitter" className="block text-sm font-medium mb-2">
                    Twitter
                  </label>
                  <Input
                    id="social.twitter"
                    name="social.twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleChange}
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label htmlFor="social.instagram" className="block text-sm font-medium mb-2">
                    Instagram
                  </label>
                  <Input
                    id="social.instagram"
                    name="social.instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleChange}
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label htmlFor="social.linkedin" className="block text-sm font-medium mb-2">
                    LinkedIn
                  </label>
                  <Input
                    id="social.linkedin"
                    name="social.linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleChange}
                    placeholder="profile-url"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 