import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container">
      <h1>알맹 상점에 오신 것을 환영합니다</h1>
      <p>무포장 친환경 상점</p>
      <Link to="/weighing" style={linkStyle}>
        계량 시작하기
      </Link>
    </div>
  );
}

const linkStyle = {
  display: 'inline-block',
  marginTop: '20px',
  padding: '15px 30px',
  background: '#667eea',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '10px',
  fontWeight: 'bold',
  transition: 'all 0.3s',
};

export default Home;
