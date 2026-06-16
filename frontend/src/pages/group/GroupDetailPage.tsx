import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteGroup, fetchGroupDetail } from '../../api/group.api';
import { applyMembership, fetchMyMembership, leaveGroup } from '../../api/membership.api';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/apiError';
import './Group.css';

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const numericGroupId = Number(groupId);
  const hasToken = !!sessionStorage.getItem('accessToken');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['group', numericGroupId],
    queryFn: () => fetchGroupDetail(numericGroupId),
    enabled: hasToken && Number.isFinite(numericGroupId),
  });

  const { data: myMembership } = useQuery({
    queryKey: ['my-membership', numericGroupId],
    queryFn: () => fetchMyMembership(numericGroupId),
    enabled: hasToken && Number.isFinite(numericGroupId),
  });

  const applyMutation = useMutation({
    mutationFn: () => applyMembership(numericGroupId),
    onSuccess: () => {
      alert('가입 신청이 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['my-membership', numericGroupId] });
    },
    onError: (error) => {
      alert(getApiErrorMessage(error, '가입 신청에 실패했습니다.'));
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveGroup(numericGroupId),
    onSuccess: () => {
      alert('탈퇴 처리되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['my-membership', numericGroupId] });
      queryClient.invalidateQueries({ queryKey: ['group', numericGroupId] });
    },
    onError: (error) => {
      alert(getApiErrorMessage(error, '탈퇴에 실패했습니다.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGroup(numericGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      navigate('/groups');
    },
    onError: (error) => {
      alert(getApiErrorMessage(error, '그룹 삭제에 실패했습니다.'));
    },
  });

  const group = data?.data;
  const isOwner = !!user && !!group && user.id === group.ownerId;
  const isPending = myMembership?.status === 'PENDING';
  const isAccepted = myMembership?.status === 'ACCEPTED';

  const handleDelete = () => {
    if (window.confirm('이 그룹을 삭제할까요?')) {
      deleteMutation.mutate();
    }
  };

  const handleApply = () => {
    if (window.confirm('이 스터디 그룹에 가입 신청을 하시겠습니까?')) {
      applyMutation.mutate();
    }
  };

  const handleLeave = () => {
    if (window.confirm('정말 이 그룹에서 탈퇴하시겠습니까?')) {
      leaveMutation.mutate();
    }
  };

  if (!hasToken) {
    return (
      <div className="empty-state">
        로그인 후 그룹 정보를 조회할 수 있습니다.
        <div className="group-form-actions">
          <Link to="/login" className="button button-primary">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="loading-state">그룹 정보를 불러오는 중입니다.</div>;
  }

  if (isError || !group) {
    return <div className="error-state">그룹 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <section className="group-page">
      <div className="group-detail-header">
        <div>
          <span className="group-detail-category">{group.category}</span>
          <h1>{group.name}</h1>
          <p>{group.currentMemberCount}명이 참여 중입니다.</p>
        </div>
        <div className="group-actions">
          <Link to="/groups" className="button">
            목록
          </Link>
          {(isOwner || isAccepted) && (
            <Link to={`/groups/${group.id}/boards`} className="button">
              게시판
            </Link>
          )}
          {(isOwner || isAccepted) && (
            <Link to={`/groups/${group.id}/schedules`} className="button">
              일정
            </Link>
          )}
          {(isOwner || isAccepted) && (
            <Link to={`/groups/${group.id}/todos`} className="button">
              공동 할일
            </Link>
          )}
          {(isOwner || isAccepted) && (
            <Link to={`/groups/${group.id}/goals`} className="button">
              스터디 목표
            </Link>
          )}
          {(isOwner || isAccepted) && (
            <Link to={`/groups/${group.id}/study-timer`} className="button">
              학습 타이머
            </Link>
          )}
          {(isOwner || isAccepted) && (
            <Link to={`/groups/${group.id}/stats`} className="button">
              학습 통계
            </Link>
          )}
          {isOwner ? (
            <>
              <Link to={`/groups/${group.id}/members`} className="button">
                멤버 관리
              </Link>
              <Link to={`/groups/${group.id}/edit`} className="button button-primary">
                수정
              </Link>
              <button
                type="button"
                className="button button-danger"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                삭제
              </button>
            </>
          ) : (
            <>
              {isPending && <button className="button" disabled>승인 대기 중</button>}
              {isAccepted && (
                <>
                  <button className="button" disabled>참여 중</button>
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={handleLeave}
                    disabled={leaveMutation.isPending}
                  >
                    탈퇴하기
                  </button>
                </>
              )}
              {!myMembership && (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleApply}
                  disabled={applyMutation.isPending}
                >
                  가입 신청
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <article className="group-detail">
        <p className="group-detail-description">{group.description}</p>
        <div className="group-detail-meta">
          <div>
            <span className="meta-label">정원</span>
            <span className="meta-value">
              {group.currentMemberCount}/{group.maxMemberCount}명
            </span>
          </div>
          <div>
            <span className="meta-label">생성일</span>
            <span className="meta-value">{new Date(group.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="meta-label">수정일</span>
            <span className="meta-value">{new Date(group.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </article>
    </section>
  );
};

export default GroupDetailPage;
