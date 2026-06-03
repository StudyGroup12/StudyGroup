export interface BoardSummary {
  id: number;
  title: string;
  authorId: number;
  authorNickname: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface BoardDetail {
  id: number;
  groupId: number;
  title: string;
  content: string;
  authorId: number;
  authorNickname: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoardFormData {
  title: string;
  content: string;
}

export interface LikeResult {
  likedByMe: boolean;
  likeCount: number;
}

export interface Comment {
  id: number;
  boardId: number;
  authorId: number;
  authorNickname: string;
  content: string;
  createdAt: string;
}
