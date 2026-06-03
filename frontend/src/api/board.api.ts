import api from './axios';
import { ApiResponse } from '../types/auth.types';
import { PageResponse } from '../types/group.types';
import {
  BoardDetail,
  BoardFormData,
  BoardSummary,
  Comment,
  LikeResult,
} from '../types/board.types';

interface BoardListParams {
  page?: number;
  size?: number;
}

export const fetchBoards = async (
  groupId: number,
  params: BoardListParams = {}
): Promise<ApiResponse<PageResponse<BoardSummary>>> => {
  const response = await api.get(`/api/groups/${groupId}/boards`, { params });
  return response.data;
};

export const fetchBoardDetail = async (
  groupId: number,
  boardId: number
): Promise<ApiResponse<BoardDetail>> => {
  const response = await api.get(`/api/groups/${groupId}/boards/${boardId}`);
  return response.data;
};

export const createBoard = async (
  groupId: number,
  data: BoardFormData
): Promise<ApiResponse<BoardDetail>> => {
  const response = await api.post(`/api/groups/${groupId}/boards`, data);
  return response.data;
};

export const updateBoard = async (
  groupId: number,
  boardId: number,
  data: BoardFormData
): Promise<ApiResponse<BoardDetail>> => {
  const response = await api.put(`/api/groups/${groupId}/boards/${boardId}`, data);
  return response.data;
};

export const deleteBoard = async (
  groupId: number,
  boardId: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/api/groups/${groupId}/boards/${boardId}`);
  return response.data;
};

export const toggleBoardLike = async (
  groupId: number,
  boardId: number
): Promise<ApiResponse<LikeResult>> => {
  const response = await api.post(`/api/groups/${groupId}/boards/${boardId}/like`);
  return response.data;
};

export const fetchComments = async (
  groupId: number,
  boardId: number
): Promise<ApiResponse<Comment[]>> => {
  const response = await api.get(`/api/groups/${groupId}/boards/${boardId}/comments`);
  return response.data;
};

export const createComment = async (
  groupId: number,
  boardId: number,
  content: string
): Promise<ApiResponse<Comment>> => {
  const response = await api.post(`/api/groups/${groupId}/boards/${boardId}/comments`, { content });
  return response.data;
};

export const deleteComment = async (
  groupId: number,
  boardId: number,
  commentId: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/api/groups/${groupId}/boards/${boardId}/comments/${commentId}`);
  return response.data;
};
