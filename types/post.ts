export const POST_CATEGORIES = [
  "Technology",
  "Travel",
  "Fitness",
  "Food",
  "Fashion",
  "Sports",
  "Photography",
  "Music",
  "Nature",
  "Education",
  "Pets",
  "DIY",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export type IllustrationKind =
  | "technology-laptop"
  | "technology-code"
  | "technology-circuits"
  | "travel-mountains"
  | "travel-beach"
  | "travel-plane"
  | "fitness-gym"
  | "fitness-weights"
  | "fitness-heartrate"
  | "food-restaurant"
  | "food-coffee"
  | "food-meal"
  | "fashion-minimal"
  | "fashion-atelier"
  | "sports-stadium"
  | "sports-court"
  | "photography-camera"
  | "photography-lens"
  | "music-headphones"
  | "music-vinyl"
  | "nature-forest"
  | "nature-lake"
  | "education-books"
  | "education-classroom"
  | "pets-cat"
  | "pets-dog"
  | "diy-workshop"
  | "diy-tools";

export interface Post {
  id: string;
  creatorName: string;
  creatorHandle: string;
  timeAgo: string;
  category: PostCategory;
  title: string;
  description: string;
  illustration: IllustrationKind;
  avatar: {
    from: string;
    to: string;
  };
  /** Demo-only static signals. Not from a real platform. */
  freshness: number;
  quality: number;
  popularity: number;
}
