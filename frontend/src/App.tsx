import { Link, Route, Routes } from 'react-router-dom';
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
          <Route
            path="/"
            element={
              <div className="home-content">
                <h1>스터디 그룹 관리 서비스</h1>
                <p>함께 공부할 그룹을 만들고, 찾고, 관리하세요.</p>
                <div className="hero-buttons">
                  <Link to="/groups" className="hero-btn primary">
                    그룹 둘러보기
                  </Link>
                  {!user && (
                    <Link to="/signup" className="hero-btn secondary">
                      시작하기
                    </Link>
                  )}
                </div>
              </div>
            }
          />
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
