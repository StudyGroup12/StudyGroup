import axiosInstance from './axios';
import { ApiResponse } from '../types/auth.types';
import { MemberSummary, MembershipResponse } from '../types/membership.types';

export const applyMembership = async (groupId: number): Promise<MembershipResponse> => {
  const response = await axiosInstance.post<ApiResponse<MembershipResponse>>(`/api/groups/${groupId}/membership/apply`);
  return response.data.data;
};

export const approveMembership = async (groupId: number, targetMemberId: number): Promise<void> => {
  await axiosInstance.post<ApiResponse<void>>(`/api/groups/${groupId}/membership/approve/${targetMemberId}`);
};

export const rejectMembership = async (groupId: number, targetMemberId: number): Promise<void> => {
  await axiosInstance.post<ApiResponse<void>>(`/api/groups/${groupId}/membership/reject/${targetMemberId}`);
};

export const fetchGroupMembers = async (groupId: number): Promise<MemberSummary[]> => {
  const response = await axiosInstance.get<ApiResponse<MemberSummary[]>>(`/api/groups/${groupId}/membership/members`);
  return response.data.data;
};

export const fetchMyMembership = async (groupId: number): Promise<MembershipResponse | null> => {
  const response = await axiosInstance.get<ApiResponse<MembershipResponse>>(`/api/groups/${groupId}/membership/me`);
  return response.data.data;
};

export const fetchPendingMembers = async (groupId: number): Promise<MemberSummary[]> => {
  const response = await axiosInstance.get<ApiResponse<MemberSummary[]>>(`/api/groups/${groupId}/membership/pending`);
  return response.data.data;
};

export const kickMember = async (groupId: number, targetMemberId: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<void>>(`/api/groups/${groupId}/membership/kick/${targetMemberId}`);
};

export const delegateOwnership = async (groupId: number, targetMemberId: number): Promise<void> => {
  await axiosInstance.patch<ApiResponse<void>>(`/api/groups/${groupId}/membership/delegate/${targetMemberId}`);
};

export const leaveGroup = async (groupId: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<void>>(`/api/groups/${groupId}/membership/leave`);
};
