import React, { useState, useEffect } from 'react';
import { Bot, Shield, User } from 'lucide-react';

function HomePage({ onConnect, lastConfig }) {
  const [username, setUsername] = useState('AFK_Bot');
  const [auth, setAuth] = useState('offline');
  const [owner, setOwner] = useState('');

  // Pre-fill with last config if available
  useEffect(() => {
    if (lastConfig) {
      if (lastConfig.username) setUsername(lastConfig.username);
      if (lastConfig.auth) setAuth(lastConfig.auth);
      if (lastConfig.owner) setOwner(lastConfig.owner);
    }
  }, [lastConfig]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Please enter a bot username.');
      return;
    }
    onConnect({ username, auth, owner });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen" style={{ zIndex: 1 }}>
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: 'var(--accent-glow)', opacity: 0.15, transform: 'translate(-50%, -50%)' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: 'var(--accent-glow)', opacity: 0.15, transform: 'translate(50%, 50%)' }}></div>

      <div className="w-full max-w-lg glass-panel p-8 pulsing-glow relative overflow-hidden">
        {/* Title Header */}
        <div className="flex flex-col items-center text-center mb-8 relative">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-4 animate-bounce-slow">
            <Bot size={40} className="text-white" style={{ color: 'var(--accent-color)', filter: 'drop-shadow(0 0 8px var(--accent-color))' }} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 font-title">
            <span className="text-gradient">MINECRAFT AFK PORTAL</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Deploy persistent bots to keep your Minecraft chunks loaded 24/7.
          </p>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Bot Name */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <User size={14} /> Bot Username
              </label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="AFK_Bot"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Auth Mode */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Shield size={14} /> Auth Mode
              </label>
              <select
                className="input-field w-full"
                style={{ backgroundColor: '#13112b' }}
                value={auth}
                onChange={(e) => setAuth(e.target.value)}
              >
                <option value="offline">Offline (Cracked)</option>
                <option value="microsoft">Microsoft (Premium)</option>
              </select>
            </div>

            {/* Bot Owner command trigger (optional) */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <User size={14} /> Owner Username (Optional)
              </label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="Your Minecraft username to control bot in-game"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Let's you run in-game commands like #come and #jump</span>
            </div>
          </div>

          {/* Connect Button */}
          <button type="submit" className="btn btn-primary w-full py-3.5 mt-4 text-base tracking-wide uppercase">
            Deploy Bot to Server
          </button>
        </form>

      </div>
    </div>
  );
}

export default HomePage;
