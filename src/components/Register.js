import React, { useState } from 'react';
import { registerUser } from '../firebase';
import './Auth.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('กรุณากรอกชื่อ');
      return false;
    }

    if (!formData.email) {
      setError('กรุณากรอกอีเมล');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      return false;
    }

    if (formData.password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return false;
    }

    // Check for at least one uppercase, one lowercase, and one number
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก และตัวเลขอย่างน้อยอย่างละหนึ่งตัว');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await registerUser(formData.email, formData.password, formData.name);

      // Get ID token for API calls
      const idToken = await user.getIdToken();

      const userData = {
        uid: user.uid,
        email: user.email,
        name: formData.name
      };

      onRegister(userData, idToken);
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'การสมัครสมาชิกล้มเหลว กรุณาลองใหม่อีกครั้ง';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'รหัสผ่านอ่อนเกินไป';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'การสมัครสมาชิกถูกปิดใช้งานชั่วคราว';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z\d]/.test(password)) strength++;

    const labels = ['', 'อ่อน', 'พอใช้', 'ดี', 'แข็งแรง'];
    return { strength, label: labels[strength] || 'แข็งแรงมาก' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">✨</div>
          <h2>เข้าร่วม Expense Tracker</h2>
          <p>สร้างบัญชีของคุณเพื่อเริ่มต้นใช้งาน</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">ชื่อเต็ม</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="กรอกชื่อเต็มของคุณ"
                required
                className="auth-input"
              />
            </div>
          </div>

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
                placeholder="สร้างรหัสผ่านที่แข็งแรง"
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
            {formData.password && (
              <div className="password-strength">
                <div className="strength-meter">
                  <div
                    className={`strength-fill strength-${passwordStrength.strength}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="strength-label">{passwordStrength.label}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
            <div className="input-wrapper">
              <span className="input-icon">🔐</span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="ยืนยันรหัสผ่านของคุณ"
                required
                className="auth-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" required className="checkbox" />
              <span className="checkmark"></span>
              ฉันยอมรับเงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัว
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
                กำลังสร้างบัญชี...
              </>
            ) : (
              'สร้างบัญชี'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="social-login">
          <button className="social-button google">
            <span className="social-icon">🌐</span>
            สมัครสมาชิกด้วย Google
          </button>
          <button className="social-button github">
            <span className="social-icon">💻</span>
            สมัครสมาชิกด้วย GitHub
          </button>
        </div>

        <div className="auth-footer">
          <p>
            มีบัญชีอยู่แล้ว?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToLogin}
            >
              เข้าสู่ระบบ
            </button>
          </p>
        </div>
      </div>

      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1">🎯</div>
          <div className="shape shape-2">💡</div>
          <div className="shape shape-3">🚀</div>
          <div className="shape shape-4">📊</div>
        </div>
      </div>
    </div>
  );
};

export default Register;