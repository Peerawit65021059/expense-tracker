import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium' }) => {
  return (
    <div className={`logo ${size}`}>
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        {/* Wallet body */}
        <path
          d="M45 15H15C12.7909 15 11 16.7909 11 19V41C11 43.2091 12.7909 45 15 45H45C47.2091 45 49 43.2091 49 41V19C49 16.7909 47.2091 15 45 15Z"
          fill="#3498db"
          stroke="#2980b9"
          strokeWidth="2"
        />

        {/* Wallet fold */}
        <path
          d="M49 25L53 21V35L49 31V25Z"
          fill="#2980b9"
          stroke="#21618c"
          strokeWidth="2"
        />

        {/* Money symbol */}
        <circle
          cx="30"
          cy="30"
          r="8"
          fill="white"
          stroke="#3498db"
          strokeWidth="2"
        />

        {/* Baht sign */}
        <text
          x="30"
          y="35"
          textAnchor="middle"
          fill="#3498db"
          fontSize="12"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          ฿
        </text>

        {/* Chart bars */}
        <rect x="18" y="20" width="3" height="8" fill="#27ae60" />
        <rect x="23" y="18" width="3" height="10" fill="#27ae60" />
        <rect x="28" y="22" width="3" height="6" fill="#e74c3c" />
        <rect x="33" y="16" width="3" height="12" fill="#e74c3c" />
        <rect x="38" y="19" width="3" height="9" fill="#f39c12" />

        {/* Trend line */}
        <path
          d="M18 24 L23 22 L28 26 L33 20 L38 23"
          stroke="#2c3e50"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="logo-text">
        <span className="logo-title">จัดการ</span>
        <span className="logo-subtitle">การเงิน</span>
      </div>
    </div>
  );
};

export default Logo;