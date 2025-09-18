import React, { useState } from 'react';
import { loginUser } from '../firebase';
import './Auth.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await loginUser(formData.email, formData.password);

      // Get ID token for API calls
      const idToken = await user.getIdToken();

      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0]
      };

      onLogin(userData, idToken);
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'เข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูลของคุณ';

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'ไม่พบบัญชีผู้ใช้นี้';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'รหัสผ่านไม่ถูกต้อง';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'บัญชีนี้ถูกปิดใช้งาน';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่อีกครั้ง';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2>ยินดีต้อนรับกลับ</h2>
          <p>เข้าสู่ระบบบัญชีของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">ที่อยู่อีเมล</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="กรอกอีเมลของคุณ"
                required
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="กรอกรหัสผ่านของคุณ"
                required
                className="auth-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox" />
              <span className="checkmark"></span>
              จดจำฉัน
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button primary"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </button>
        </form>


        <div className="auth-footer">
          <p>
            ยังไม่มีบัญชี?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToRegister}
            >
              สมัครสมาชิก
            </button>
          </p>
        </div>
      </div>

      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1">💰</div>
          <div className="shape shape-2">📊</div>
          <div className="shape shape-3">💳</div>
          <div className="shape shape-4">📈</div>
        </div>
      </div>
    </div>
  );
};

export default Login;