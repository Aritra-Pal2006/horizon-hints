import { db } from "@/utils/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";
import { auth } from "@/utils/firebase";

// User profile type
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// Itinerary type
export interface Itinerary {
  id: string;
  userId: string;
  destination: string;
  duration: string;
  budget: string;
  interests: string[];
  days: ItineraryDay[];
  tips: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: {
    time: string;
    activity: string;
    duration: string;
    location: string;
  }[];
  notes: string;
}

// Favorite destination type
export interface FavoriteDestination {
  id: string;
  userId: string;
  destinationId: string;
  name: string;
  country: string;
  imageUrl?: string;
  addedAt: Timestamp;
}

// Chat message type
export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Timestamp;
}

// User Profile Functions
export const createUserProfile = async (userData: Partial<UserProfile>): Promise<void> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const userRef = doc(db, "users", auth.currentUser.uid);
  await setDoc(userRef, {
    uid: auth.currentUser.uid,
    name: userData.name || "",
    email: auth.currentUser.email,
    photoURL: userData.photoURL || "",
    createdAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
    ...userData
  }, { merge: true });
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  if (!auth.currentUser) return null;
  
  const userRef = doc(db, "users", auth.currentUser.uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (userData: Partial<UserProfile>): Promise<void> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const userRef = doc(db, "users", auth.currentUser.uid);
  await updateDoc(userRef, {
    ...userData,
    lastLoginAt: Timestamp.now()
  });
};

// Itinerary Functions
export const createItinerary = async (itineraryData: Omit<Itinerary, "id" | "userId" | "createdAt" | "updatedAt">): Promise<string> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const itineraryRef = doc(collection(db, "itineraries"));
  const itineraryId = itineraryRef.id;
  
  await setDoc(itineraryRef, {
    id: itineraryId,
    userId: auth.currentUser.uid,
    ...itineraryData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  return itineraryId;
};

export const getUserItineraries = async (): Promise<Itinerary[]> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const q = query(
    collection(db, "itineraries"),
    where("userId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Itinerary);
};

export const getItinerary = async (itineraryId: string): Promise<Itinerary | null> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const itineraryRef = doc(db, "itineraries", itineraryId);
  const itinerarySnap = await getDoc(itineraryRef);
  
  if (itinerarySnap.exists()) {
    const itinerary = itinerarySnap.data() as Itinerary;
    // Check if user owns this itinerary
    if (itinerary.userId === auth.currentUser.uid) {
      return itinerary;
    }
  }
  return null;
};

export const updateItinerary = async (itineraryId: string, itineraryData: Partial<Itinerary>): Promise<void> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const itineraryRef = doc(db, "itineraries", itineraryId);
  const itinerarySnap = await getDoc(itineraryRef);
  
  if (itinerarySnap.exists()) {
    const itinerary = itinerarySnap.data() as Itinerary;
    if (itinerary.userId === auth.currentUser.uid) {
      await updateDoc(itineraryRef, {
        ...itineraryData,
        updatedAt: Timestamp.now()
      });
      return;
    }
  }
  throw new Error("Itinerary not found or unauthorized");
};

export const deleteItinerary = async (itineraryId: string): Promise<void> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const itineraryRef = doc(db, "itineraries", itineraryId);
  const itinerarySnap = await getDoc(itineraryRef);
  
  if (itinerarySnap.exists()) {
    const itinerary = itinerarySnap.data() as Itinerary;
    if (itinerary.userId === auth.currentUser.uid) {
      await deleteDoc(itineraryRef);
      return;
    }
  }
  throw new Error("Itinerary not found or unauthorized");
};

// Favorite Functions
export const addFavoriteDestination = async (destinationData: Omit<FavoriteDestination, "id" | "userId" | "addedAt">): Promise<string> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const favoriteRef = doc(collection(db, "favorites"));
  const favoriteId = favoriteRef.id;
  
  await setDoc(favoriteRef, {
    id: favoriteId,
    userId: auth.currentUser.uid,
    ...destinationData,
    addedAt: Timestamp.now()
  });
  
  return favoriteId;
};

export const getUserFavorites = async (): Promise<FavoriteDestination[]> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const q = query(
    collection(db, "favorites"),
    where("userId", "==", auth.currentUser.uid),
    orderBy("addedAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as FavoriteDestination);
};

export const removeFavoriteDestination = async (favoriteId: string): Promise<void> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const favoriteRef = doc(db, "favorites", favoriteId);
  const favoriteSnap = await getDoc(favoriteRef);
  
  if (favoriteSnap.exists()) {
    const favorite = favoriteSnap.data() as FavoriteDestination;
    if (favorite.userId === auth.currentUser.uid) {
      await deleteDoc(favoriteRef);
      return;
    }
  }
  throw new Error("Favorite not found or unauthorized");
};

export const isDestinationFavorite = async (destinationId: string): Promise<boolean> => {
  if (!auth.currentUser) return false;
  
  const q = query(
    collection(db, "favorites"),
    where("userId", "==", auth.currentUser.uid),
    where("destinationId", "==", destinationId),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Chat Functions
export const saveChatMessage = async (messageData: Omit<ChatMessage, "id" | "userId" | "timestamp">): Promise<string> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const messageRef = doc(collection(db, "chatMessages"));
  const messageId = messageRef.id;
  
  await setDoc(messageRef, {
    id: messageId,
    userId: auth.currentUser.uid,
    ...messageData,
    timestamp: Timestamp.now()
  });
  
  return messageId;
};

export const getUserChatHistory = async (): Promise<ChatMessage[]> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const q = query(
    collection(db, "chatMessages"),
    where("userId", "==", auth.currentUser.uid),
    orderBy("timestamp", "asc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as ChatMessage);
};