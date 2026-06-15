import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createGroup, fetchGroupDetail, updateGroup } from '../../api/group.api';
import { useAuth } from '../../hooks/useAuth';
import { GroupFormData } from '../../types/group.types';
import { getApiErrorMessage } from '../../utils/apiError';
import './Group.css';

const initialForm: GroupFormData = {
  name: '',
  description: '',
  category: '',
  maxMemberCount: 5,
};

const GroupFormPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditMode = !!groupId;
  const numericGroupId = Number(groupId);
  const [form, setForm] = useState<GroupFormData>(initialForm);

  const { data, isLoading } = useQuery({
    queryKey: ['group', numericGroupId],
    queryFn: () => fetchGroupDetail(numericGroupId),
    enabled: isEditMode && Number.isFinite(numericGroupId),
  });

  useEffect(() => {
    if (data?.data) {
      setForm({
        name: data.data.name,
        description: data.data.description,
        category: data.data.category,
        maxMemberCount: data.data.maxMemberCount,
      });
    }
  }, [data]);

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      navigate(`/groups/${response.data.id}`);
    },
    onError: (error) => {
      alert(getApiErrorMessage(error, '그룹 생성에 실패했습니다.'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: GroupFormData) => updateGroup(numericGroupId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', numericGroupId] });
      navigate(`/groups/${response.data.id}`);
    },
    onError: (error) => {
      alert(getApiErrorMessage(error, '그룹 수정에 실패했습니다.'));
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
      return;
    }

    createMutation.mutate(payload);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const ownerId = data?.data.ownerId;
  const canEdit = !isEditMode || (!!user && ownerId === user.id);

  if (!user) {
    return (
      <div className="empty-state">
        로그인 후 그룹을 만들거나 수정할 수 있습니다.
        <div className="group-form-actions">
          <Link to="/login" className="button button-primary">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  if (isEditMode && isLoading) {
    return <div className="loading-state">그룹 정보를 불러오는 중입니다.</div>;
  }

  if (!canEdit) {
    return <div className="error-state">이 그룹을 수정할 권한이 없습니다.</div>;
  }

  return (
    <section className="group-page">
      <div className="group-form-header">
        <div>
          <h1>{isEditMode ? '그룹 수정' : '그룹 만들기'}</h1>
          <p>스터디 주제와 인원을 정해 새 그룹을 관리하세요.</p>
        </div>
        <Link to={isEditMode ? `/groups/${numericGroupId}` : '/groups'} className="button">
          취소
        </Link>
      </div>

      <form className="group-form" onSubmit={handleSubmit}>
        <label>
          그룹 이름
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            maxLength={100}
            required
            placeholder="예: 알고리즘 실전 스터디"
          />
        </label>

        <label>
          카테고리
          <input
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            maxLength={50}
            required
            placeholder="예: 코딩 테스트"
          />
        </label>

        <label>
          최대 인원
          <input
            type="number"
            value={form.maxMemberCount}
            onChange={(event) =>
              setForm((current) => ({ ...current, maxMemberCount: Number(event.target.value) }))
            }
            min={2}
            max={100}
            required
          />
        </label>

        <label>
          설명
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            maxLength={1000}
            required
            placeholder="스터디 목표, 진행 방식, 모집 조건을 적어주세요."
          />
        </label>

        <div className="group-form-actions">
          <button type="submit" className="button button-primary" disabled={isSubmitting}>
            {isEditMode ? '수정 완료' : '생성하기'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default GroupFormPage;
