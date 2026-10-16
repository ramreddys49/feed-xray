import type { ReactNode } from "react";
import { CreatorAvatar } from "@/components/creator-avatar";
import { PostIllustration } from "@/components/post-illustration";
import type { GuideHighlight } from "@/lib/guided-demo";
import type { Post } from "@/types/post";

export interface RankHint {
  label: "Recommended for you" | "Ranked higher";
  explanation: string;
}

interface PostCardProps {
  post: Post;
  liked: boolean;
  saved: boolean;
  commentsOpen: boolean;
  notInterested: boolean;
  justShared: boolean;
  rankHint?: RankHint | null;
  engineerOverlay?: { rank: number; movedLabel: string } | null;
  selected?: boolean;
  onSelectPost?: (postId: string) => void;
  onLike: (post: Post) => void;
  onSave: (post: Post) => void;
  onShare: (post: Post) => void;
  onComment: (post: Post) => void;
  onNotInterested: (post: Post) => void;
  registerVisibility: (postId: string, node: HTMLElement | null) => void;
  guideHighlight?: GuideHighlight | null;
  isGuidePost?: boolean;
}

function ActionButton({
  label,
  active = false,
  children,
  onClick,
  guideTarget = null,
  guideHighlight = null,
}: {
  label: string;
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
  guideTarget?: GuideHighlight | null;
  guideHighlight?: GuideHighlight | null;
}) {
  const guided = Boolean(guideTarget) && guideTarget === guideHighlight;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      data-guide-target={guided ? guideTarget : undefined}
      data-guide-active={guided ? "true" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] transition hover:bg-white/[0.05] ${
        active ? "text-cyan-100" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

const COMMENT_PREVIEW = [
  {
    name: "Ava Lin",
    text: "I keep coming back to the pacing of this.",
  },
  {
    name: "Marcus Cole",
    text: "This is the kind of post that quietly trains a feed.",
  },
] as const;

export function PostCard({
  post,
  liked,
  saved,
  commentsOpen,
  notInterested,
  justShared,
  rankHint = null,
  engineerOverlay = null,
  selected = false,
  onSelectPost,
  onLike,
  onSave,
  onShare,
  onComment,
  onNotInterested,
  registerVisibility,
  guideHighlight = null,
  isGuidePost = false,
}: PostCardProps) {
  return (
    <article
      ref={(node) => registerVisibility(post.id, node)}
      className={`scroll-mt-28 rounded-[1.4rem] border p-4 transition sm:p-5 ${
        selected
          ? "border-cyan-300/35 bg-white/[0.055]"
          : "border-white/8 bg-white/[0.03] hover:border-cyan-300/16 hover:bg-white/[0.045]"
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CreatorAvatar
            name={post.creatorName}
            from={post.avatar.from}
            to={post.avatar.to}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <p className="truncate text-sm font-medium text-slate-50">
                {post.creatorName}
              </p>
              <p className="truncate text-sm text-slate-500">
                @{post.creatorHandle}
              </p>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {post.timeAgo}
              <span className="mx-1.5 text-slate-600">·</span>
              {post.category}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {engineerOverlay ? (
            <p
              className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 font-mono text-[10px] text-emerald-100"
              aria-label={`Feed position ${engineerOverlay.rank}, movement ${engineerOverlay.movedLabel}`}
            >
              #{engineerOverlay.rank}
              <span className="ml-1.5 text-slate-400">{engineerOverlay.movedLabel}</span>
            </p>
          ) : rankHint && onSelectPost ? (
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectPost(post.id)}
              className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-400/16"
            >
              {rankHint.label}
            </button>
          ) : null}
        </div>
      </header>

      <div className="mt-4">
        <PostIllustration kind={post.illustration} title={post.title} />
      </div>

      <div className="mt-4">
        <h3 className="text-[1.05rem] font-semibold tracking-tight text-slate-50">
          {post.title}
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-slate-400">
          {post.description}
        </p>
        {onSelectPost ? (
          <button
            type="button"
            aria-pressed={selected}
            onClick={() => onSelectPost(post.id)}
            data-guide-target={
              isGuidePost && guideHighlight === "why-this-post" ? "why-this-post" : undefined
            }
            data-guide-active={
              isGuidePost && guideHighlight === "why-this-post" ? "true" : undefined
            }
            className="mt-2 text-xs text-cyan-100/90 underline-offset-2 transition hover:text-cyan-50 hover:underline"
          >
            Why am I seeing this?
          </button>
        ) : null}
      </div>

      {notInterested ? (
        <p className="mt-3 rounded-xl border border-rose-300/20 bg-rose-400/8 px-3 py-2 text-sm leading-6 text-rose-100/90">
          Got it — this would be a strong negative recommendation signal.
        </p>
      ) : null}

      {commentsOpen ? (
        <div className="mt-3 space-y-2 rounded-xl border border-white/8 bg-black/20 px-3 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Fictional preview
          </p>
          {COMMENT_PREVIEW.map((comment) => (
            <p key={comment.name} className="text-sm leading-6 text-slate-400">
              <span className="font-medium text-slate-200">{comment.name}</span>
              <span className="mx-1.5 text-slate-600">·</span>
              {comment.text}
            </p>
          ))}
        </div>
      ) : null}

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/6 pt-3">
        <div className="flex flex-wrap items-center gap-0.5">
          <ActionButton
            label="Like"
            active={liked}
            onClick={() => onLike(post)}
            guideTarget={isGuidePost ? "like-tech" : null}
            guideHighlight={guideHighlight}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill={liked ? "currentColor" : "none"} aria-hidden>
              <path
                d="M10 16.2c-4.4-2.5-6.7-5.4-6.7-8.1A3.4 3.4 0 0 1 10 5.4a3.4 3.4 0 0 1 6.7 2.7c0 2.7-2.3 5.6-6.7 8.1Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </ActionButton>
          <ActionButton
            label="Save"
            active={saved}
            onClick={() => onSave(post)}
            guideTarget={isGuidePost ? "save-tech" : null}
            guideHighlight={guideHighlight}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden>
              <path
                d="M6 4.5h8A1.5 1.5 0 0 1 15.5 6v10L10 13.2 4.5 16V6A1.5 1.5 0 0 1 6 4.5Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </ActionButton>
          <ActionButton
            label={justShared ? "Shared" : "Share"}
            active={justShared}
            onClick={() => onShare(post)}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
              <path
                d="M7.2 10.4 12.8 7.6M7.2 9.6l5.6 2.8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle cx="6" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="14" cy="6.6" r="2.2" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="14" cy="13.4" r="2.2" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </ActionButton>
          <ActionButton
            label="Comment"
            active={commentsOpen}
            onClick={() => onComment(post)}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
              <path
                d="M5 5.5h10A1.5 1.5 0 0 1 16.5 7v5A1.5 1.5 0 0 1 15 13.5H9.5L5 16.2V5.5Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </ActionButton>
        </div>
        <button
          type="button"
          onClick={() => onNotInterested(post)}
          aria-label={
            isGuidePost && guideHighlight === "not-interested-tech"
              ? `Mark ${post.title} as not interested`
              : undefined
          }
          data-guide-target={
            isGuidePost && guideHighlight === "not-interested-tech"
              ? "not-interested-tech"
              : undefined
          }
          data-guide-active={
            isGuidePost && guideHighlight === "not-interested-tech" ? "true" : undefined
          }
          className="rounded-full px-2.5 py-1.5 text-[13px] text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-300"
        >
          Not Interested
        </button>
      </footer>
    </article>
  );
}
