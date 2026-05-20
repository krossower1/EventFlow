import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, getAuthHeaders } from '../../api/apiClient';
import { AuthContext } from '../../context/AuthContext';

const formatMessageTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ChatWidget = () => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [externalActiveChat, setExternalActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [collapsed, setCollapsed] = useState(true);
  const [status, setStatus] = useState('');

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const loadFavorites = useCallback(async () => {
    try {
      const response = await apiClient.get('/chat/favorites', getRequestConfig());
      const nextFavorites = Array.isArray(response.data) ? response.data : [];
      setFavorites(nextFavorites);
      setStatus('');

      if (activeChatId && !nextFavorites.some((item) => item.id === activeChatId)) {
        setActiveChatId(null);
        setExternalActiveChat(null);
        setMessages([]);
      } else if (!activeChatId && nextFavorites.length > 0) {
        setActiveChatId(nextFavorites[0].id);
        setExternalActiveChat(nextFavorites[0]);
      }
    } catch (error) {
      setStatus(error.response?.data?.message || 'Nie udało się pobrać ulubionych.');
    }
  }, [activeChatId, getRequestConfig]);

  const loadConversation = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const response = await apiClient.get(`/chat/conversations/${userId}`, getRequestConfig());
      setMessages(Array.isArray(response.data) ? response.data : []);
      setStatus('');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Nie udało się pobrać wiadomości.');
    }
  }, [getRequestConfig]);

  useEffect(() => {
    loadFavorites();
    const intervalId = window.setInterval(loadFavorites, 4000);
    return () => window.clearInterval(intervalId);
  }, [loadFavorites]);

  useEffect(() => {
    if (!activeChatId) return undefined;
    setMessages([]);
    loadConversation(activeChatId);
    const intervalId = window.setInterval(() => loadConversation(activeChatId), 4000);
    return () => window.clearInterval(intervalId);
  }, [activeChatId, loadConversation]);

  useEffect(() => {
    const handleOpenChat = (event) => {
      const detail = event.detail || {};
      if (!detail.userId) return;
      setCollapsed(false);
      setActiveChatId(detail.userId);
      setExternalActiveChat({
        id: detail.userId,
        login: detail.login,
        imie: detail.imie,
        nazwisko: detail.nazwisko
      });
    };
    window.addEventListener('eventflow-open-chat', handleOpenChat);
    return () => window.removeEventListener('eventflow-open-chat', handleOpenChat);
  }, []);

  const sortedFavorites = useMemo(
    () => [...favorites].sort((a, b) => `${a.imie || ''} ${a.nazwisko || ''} ${a.login}`.localeCompare(`${b.imie || ''} ${b.nazwisko || ''} ${b.login}`)),
    [favorites]
  );

  const activeChat = useMemo(() => {
    if (!activeChatId) return null;
    return favorites.find((item) => item.id === activeChatId) || externalActiveChat;
  }, [activeChatId, favorites, externalActiveChat]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!activeChatId || !draft.trim()) return;
    try {
      await apiClient.post(`/chat/conversations/${activeChatId}`, { content: draft.trim() }, getRequestConfig());
      setDraft('');
      loadFavorites();
      loadConversation(activeChatId);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Nie udało się wysłać wiadomości.');
    }
  };

  if (!currentUser?.id) return null;

  return (
    <div className={`chat-widget ${collapsed ? 'is-collapsed' : ''}`}>
      <button type="button" className="chat-widget-toggle" onClick={() => setCollapsed((prev) => !prev)}>
        <img src="/icons/communications.png" alt="" width={22} height={22} style={{ width: '22px', height: '22px' }} />
      </button>
      {!collapsed && (
        <div className="chat-widget-panel">
          <div className="chat-widget-sidebar">
            <div className="chat-widget-title">Ulubieni</div>
            <div className="chat-widget-favorites">
              {sortedFavorites.length > 0 ? sortedFavorites.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`chat-favorite-button ${activeChatId === item.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveChatId(item.id);
                    setExternalActiveChat(item);
                  }}
                >
                  <span>{item.imie || '-'} {item.nazwisko || '-'}</span>
                  <small>@{item.login}</small>
                </button>
              )) : (
                <p className="chat-widget-empty">Dodaj użytkowników do ulubionych.</p>
              )}
            </div>
          </div>
          <div className="chat-widget-main">
            <div className="chat-widget-header">
              <strong>{activeChat ? `${activeChat.imie || ''} ${activeChat.nazwisko || ''}`.trim() || activeChat.login : 'Wybierz rozmowę'}</strong>
            </div>
            <div className="chat-widget-messages">
              {activeChat ? messages.map((message) => (
                <div key={message.id} className={`chat-message ${message.senderId === currentUser.id ? 'is-own' : ''}`}>
                  <div>{message.content}</div>
                  <small className="chat-message-time">{formatMessageTime(message.sentAt)}</small>
                </div>
              )) : (
                <p className="chat-widget-empty">Kliknij osobę z ulubionych, aby rozpocząć rozmowę.</p>
              )}
            </div>
            {status ? <p className="chat-widget-status">{status}</p> : null}
            <form className="chat-widget-form" onSubmit={sendMessage}>
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Napisz wiadomość..."
                disabled={!activeChat}
              />
              <button type="submit" disabled={!activeChat || !draft.trim()}>
                Wyślij
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
