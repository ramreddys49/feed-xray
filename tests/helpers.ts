import { posts } from "@/data/posts";
import type { BehaviorEvent, BehaviorEventType, EventMetadataMap } from "@/types/events";
import type { Post } from "@/types/post";

const postsById = new Map(posts.map((post) => [post.id, post]));

export function postById(id: string): Post {
  const post = postsById.get(id);
  if (!post) throw new Error(`Unknown post ${id}`);
  return post;
}

let seq = 0;

export function makeEvent<T extends BehaviorEventType>(
  type: T,
  post: Post,
  metadata: EventMetadataMap[T],
): Extract<BehaviorEvent, { type: T }> {
  seq += 1;
  return {
    id: `test-${seq}`,
    timestamp: seq * 1000,
    type,
    postId: post.id,
    category: post.category,
    creatorId: post.creatorHandle,
    metadata,
  } as Extract<BehaviorEvent, { type: T }>;
}

export function techPost() {
  return postById("px-01");
}

export function travelPost() {
  return postById("px-02");
}
