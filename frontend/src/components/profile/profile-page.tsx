"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, User, Wallet } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-provider"
import { toast } from "@/components/ui/use-toast"
import { icApi } from "@/lib/ic-api"
import { ProfileDashboard } from "@/components/profile/profile-dashboard"
import { safeString } from "@/lib/utils/string-utils"

export function ProfilePage() {
  const { isAuthenticated, principal } = useAuth()
  const [profile, setProfile] = useState<{ username: string; bio: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && principal) {
      fetchProfile()
    }
  }, [isAuthenticated, principal])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Call the canister to get the profile
      const response = await icApi.getProfile()

      if (response && "ok" in response) {
        setProfile({
          username: safeString(response.ok.username),
          bio: safeString(response.ok.bio),
        })
      } else {
        // Profile not found, but user is authenticated
        setProfile(null)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setError("Failed to load profile data. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username is required.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)
      setError(null)

      // Call the canister to create the profile
      const response = await icApi.createProfile(username, bio)

      if (response && "ok" in response && response.ok) {
        setProfile({ username, bio })
        toast({
          title: "Success",
          description: "Profile created successfully.",
        })
      } else {
        // Handle specific error cases
        if (response && "err" in response) {
          if ("profileAlreadyExists" in response.err) {
            toast({
              title: "Error",
              description: "A profile already exists for this account.",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Error",
              description: "Failed to create profile. Please try again.",
              variant: "destructive",
            })
          }
        } else {
          throw new Error("Failed to create profile")
        }
      }
    } catch (error) {
      console.error("Error creating profile:", error)
      setError("Failed to create profile. Please try again.")
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground max-w-md mb-6">Connect your wallet to view your profile.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-medium mb-2">Loading Profile</h3>
          <p className="text-muted-foreground">Please wait while we load your profile data.</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <h3 className="text-xl font-medium mb-2">Error</h3>
          <p className="text-muted-foreground max-w-md mb-6">{error}</p>
          <Button onClick={fetchProfile}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  if (profile) {
    return <ProfileDashboard />
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Create Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={createProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                Create Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

