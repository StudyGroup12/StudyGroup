import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchGroupMembers, fetchPendingMembers, approveMembership, rejectMembership, kickMember, delegateOwnership } from '../../api/membership.api';
import { MemberSummary } from '../../types/membership.types';
import { useAuth } from '../../hooks/useAuth';
import './Membership.css';

const MembershipPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [pendingMembers, setPendingMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!groupId) return;
    try {
      const [membersData, pendingData] = await Promise.all([
        fetchGroupMembers(Number(groupId)),
        fetchPendingMembers(Number(groupId)).catch(() => []), // 방장이 아니면 에러날 수 있으므로 빈 배열 처리
      ]);
      setMembers(membersData);
      setPendingMembers(pendingData);
    } catch (error) {
      console.error('데이터를 불러오는데 실패했습니다.', error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (memberId: number) => {
    if (!groupId) return;
    try {
      await approveMembership(Number(groupId), memberId);
      alert('승인되었습니다.');
      loadData();
    } catch (error) {
      alert('승인에 실패했습니다.');
    }
  };

  const handleReject = async (memberId: number) => {
    if (!groupId) return;
    try {
      await rejectMembership(Number(groupId), memberId);
      alert('거절되었습니다.');
      loadData();
    } catch (error) {
      alert('거절에 실패했습니다.');
    }
  };

  const handleKick = async (memberId: number) => {
    if (!groupId || !window.confirm('정말 이 멤버를 강퇴하시겠습니까?')) return;
    try {
      await kickMember(Number(groupId), memberId);
      alert('강퇴 처리되었습니다.');
      loadData();
    } catch (error) {
      alert('강퇴에 실패했습니다.');
    }
  };

  const handleDelegate = async (memberId: number) => {
    if (!groupId || !window.confirm('정말 그룹장 권한을 위임하시겠습니까?\n위임 후에는 일반 멤버가 됩니다.')) return;
    try {
      await delegateOwnership(Number(groupId), memberId);
      alert('그룹장 권한이 위임되었습니다.');
      loadData();
    } catch (error) {
      alert('위임에 실패했습니다.');
    }
  };

  const isOwner = members.find(m => m.memberId === user?.id)?.role === 'OWNER';

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="membership-page">
      <div className="membership-header">
        <h1>스터디 멤버 관리</h1>
        <Link to={`/groups/${groupId}`} className="button">
          돌아가기
        </Link>
      </div>
      
      {isOwner && (
        <section className="member-list-section">
          <h2>가입 신청 대기</h2>
          {pendingMembers.length > 0 ? (
            <ul className="member-list">
              {pendingMembers.map((member) => (
                <li key={member.memberId} className="member-item">
                  <span className="member-info">
                    <strong>{member.nickname}</strong> ({member.email})
                  </span>
                  <div className="action-buttons">
                    <button className="approve-btn" onClick={() => handleApprove(member.memberId)}>승인</button>
                    <button className="reject-btn" onClick={() => handleReject(member.memberId)}>거절</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-msg">새로운 가입 신청이 없습니다.</p>
          )}
        </section>
      )}

      <section className="member-list-section">
        <h2>현재 멤버</h2>
        <ul className="member-list">
          {members.map((member) => (
            <li key={member.memberId} className="member-item">
              <span className="member-info">
                <strong>{member.nickname}</strong> ({member.email}) - {member.role}
              </span>
              {isOwner && member.memberId !== user?.id && (
                <div className="action-buttons">
                  <button className="delegate-btn" onClick={() => handleDelegate(member.memberId)}>방장위임</button>
                  <button className="kick-btn" onClick={() => handleKick(member.memberId)}>강퇴</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default MembershipPage;
