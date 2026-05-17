import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, getAuthHeaders } from '../../api/apiClient';
import { AuthContext } from '../../context/AuthContext';

const ChatWidget = () => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [collapsed, setCollapsed] = useState(false);
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
      if (activeChat) {
        const refreshed = nextFavorites.find((item) => item.id === activeChat.id);
        if (!refreshed) {
          setActiveChat(null);
          setMessages([]);
        } else {
          setActiveChat(refreshed);
        }
      }
    } catch (error) {
      setStatus(error.response?.data?.message || 'Nie udało się pobrać ulubionych.');
    }
  }, [activeChat, getRequestConfig]);

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
  }, [loadFavorites]);

  useEffect(() => {
    if (!activeChat) return undefined;
    loadConversation(activeChat.id);
    const intervalId = window.setInterval(() => loadConversation(activeChat.id), 4000);
    return () => window.clearInterval(intervalId);
  }, [activeChat, loadConversation]);

  useEffect(() => {
    const handleOpenChat = (event) => {
      const detail = event.detail || {};
      if (!detail.userId) return;
      const favorite = favorites.find((item) => item.id === detail.userId);
      setCollapsed(false);
      setActiveChat(favorite || {
        id: detail.userId,
        login: detail.login,
        imie: detail.imie,
        nazwisko: detail.nazwisko
      });
    };
    window.addEventListener('eventflow-open-chat', handleOpenChat);
    return () => window.removeEventListener('eventflow-open-chat', handleOpenChat);
  }, [favorites]);

  const sortedFavorites = useMemo(
    () => [...favorites].sort((a, b) => `${a.imie || ''} ${a.nazwisko || ''} ${a.login}`.localeCompare(`${b.imie || ''} ${b.nazwisko || ''} ${b.login}`)),
    [favorites]
  );

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!activeChat || !draft.trim()) return;
    try {
      await apiClient.post(`/chat/conversations/${activeChat.id}`, { content: draft.trim() }, getRequestConfig());
      setDraft('');
      loadConversation(activeChat.id);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Nie udało się wysłać wiadomości.');
    }
  };

  if (!currentUser?.id) return null;

  return (
    <div className={`chat-widget ${collapsed ? 'is-collapsed' : ''}`}>
      <button type="button" className="chat-widget-toggle" onClick={() => setCollapsed((prev) => !prev)}>
        Chat
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
                  className={`chat-favorite-button ${activeChat?.id === item.id ? 'is-active' : ''}`}
                  onClick={() => setActiveChat(item)}
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
                  {message.content}
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
