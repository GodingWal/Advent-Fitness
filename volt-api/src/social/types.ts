export interface Activity {
  id: string;
  userId: string;
  type: string;
  title: string;
  startedAt: string;
  durationMin: number;
  distanceKm: number | null;
  calories: number | null;
  elevationM: number | null;
  avgPaceSecPerKm: number | null;
  notes: string | null;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  body: string;
  activityId: string | null;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface Meetup {
  id: string;
  organizerId: string;
  title: string;
  activityType: string;
  location: string;
  startsAt: string;
  capacity: number;
  description: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  memberIds: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}
