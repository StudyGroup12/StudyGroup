import { Link, Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import GroupDetailPage from './pages/group/GroupDetailPage';
import GroupFormPage from './pages/group/GroupFormPage';
import GroupListPage from './pages/group/GroupListPage';
import MembershipPage from './pages/membership/MembershipPage';
import BoardListPage from './pages/board/BoardListPage';
import BoardDetailPage from './pages/board/BoardDetailPage';
import BoardFormPage from './pages/board/BoardFormPage';
import { useAuth } from './hooks/useAuth';
import './App.css';

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  // 랜딩 페이지는 자체 네브바/푸터를 가지므로 전역 레이아웃 없이 단독 렌더링
  if (isLanding) {
    return <LandingPage />;
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <nav className="nav-container">
          <Link to="/" className="logo">
            StudyGroup
          </Link>
          <div className="nav-links">
            <Link to="/groups" className="nav-link">
              스터디 그룹
            </Link>
            {user ? (
              <>
                <span className="user-nickname">{user.nickname}님</span>
                <button onClick={logout} className="logout-btn" type="button">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  로그인
                </Link>
                <Link to="/signup" className="nav-link">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/groups" element={<GroupListPage />} />
          <Route path="/groups/new" element={<GroupFormPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          <Route path="/groups/:groupId/edit" element={<GroupFormPage />} />
          <Route path="/groups/:groupId/members" element={<MembershipPage />} />
          <Route path="/groups/:groupId/boards" element={<BoardListPage />} />
          <Route path="/groups/:groupId/boards/new" element={<BoardFormPage />} />
          <Route path="/groups/:groupId/boards/:boardId" element={<BoardDetailPage />} />
          <Route path="/groups/:groupId/boards/:boardId/edit" element={<BoardFormPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 StudyGroup. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
