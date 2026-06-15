import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getMyInfo, login, signup } from '../api/auth.api';
import { LoginRequest, SignupRequest } from '../types/auth.types';
import { getApiErrorMessage } from '../utils/apiError';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: () => {
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    },
    onError: (error) => {
      alert(getApiErrorMessage(error, '회원가입에 실패했습니다.'));
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      sessionStorage.setItem('accessToken', response.data.accessToken);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/');
    },
    onError: (error) => {
      alert(getApiErrorMessage(error, '로그인에 실패했습니다.'));
    },
  });

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: () => getMyInfo(),
    enabled: !!sessionStorage.getItem('accessToken'),
    retry: false,
  });

  const logout = () => {
    sessionStorage.removeItem('accessToken');
    queryClient.setQueryData(['me'], null);
    navigate('/login');
  };

  return {
    user: user?.data,
    isLoading,
    isError,
    signup: signupMutation.mutate,
    login: loginMutation.mutate,
    logout,
  };
};
