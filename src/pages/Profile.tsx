import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { getUserItineraries, getUserFavorites } from "@/utils/firestoreService";
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Heart, 
  Navigation, 
  Settings, 
  LogOut,
  Edit3,
  Camera
} from "lucide-react";

const Profile = () => {
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [itineraryCount, setItineraryCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [itineraries, favorites] = await Promise.all([
          getUserItineraries(),
          getUserFavorites()
        ]);
        setItineraryCount(itineraries.length);
        setFavoriteCount(favorites.length);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <Card className="p-8 backdrop-blur-xl bg-card/80 border-border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="relative">
                  <div className="bg-secondary rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute bottom-6 right-1/4 translate-x-1/2 bg-background border-border"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold text-center">
                  {user?.displayName || "User"}
                </h2>
                <p className="text-muted-foreground text-center mb-6">
                  Member since {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).getFullYear() : "Unknown"}
                </p>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/favorites")}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    My Favorites
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/planner")}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    My Itineraries
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Button>
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-medium flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Name
                          </p>
                          <p className="text-sm text-muted-foreground">{user?.displayName || "Not set"}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-medium flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-medium flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Member Since
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Travel Statistics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Navigation className="w-4 h-4 mr-2" />
                          Saved Itineraries
                        </h4>
                        <p className="text-2xl font-bold text-primary">{itineraryCount}</p>
                        <p className="text-sm text-muted-foreground">Plans saved</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 w-full"
                          onClick={() => navigate("/planner")}
                        >
                          View All
                        </Button>
                      </Card>
                      
                      <Card className="p-4">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Heart className="w-4 h-4 mr-2 fill-current text-red-500" />
                          Favorites
                        </h4>
                        <p className="text-2xl font-bold text-primary">{favoriteCount}</p>
                        <p className="text-sm text-muted-foreground">Destinations saved</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 w-full"
                          onClick={() => navigate("/favorites")}
                        >
                          View All
                        </Button>
                      </Card>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button 
                      variant="destructive" 
                      onClick={handleSignOut}
                      disabled={loading}
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {loading ? "Signing out..." : "Sign Out"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;