package com.studygroup.global.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// auth 도메인 담당자가 구현
// MemberRepository를 주입받아 userId로 Member를 조회하도록 작성
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        throw new UnsupportedOperationException("auth 담당자가 구현해야 합니다.");
    }
}
