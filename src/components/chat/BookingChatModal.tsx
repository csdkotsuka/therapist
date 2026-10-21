'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Booking, ChatMessage } from '@/types';
import { formatDate } from '@/lib/geo';
import {
  X,
  Send,
  MessageCircle,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  CheckCheck,
  Check,
  Lock,
} from 'lucide-react';

interface BookingChatModalProps {
  booking: Booking;
  onClose: () => void;
}

export const BookingChatModal: React.FC<BookingChatModalProps> = ({ booking, onClose }) => {
  const { currentUser, allUsers, services, messages, sendChatMessage, markMessagesAsRead } = useApp();

  const isTherapist = currentUser.id === booking.therapist_id;
  const partnerId = isTherapist ? booking.customer_id : booking.therapist_id;
  const partnerUser = allUsers.find((u) => u.id === partnerId);
  const service = services.find((s) => s.id === booking.service_id);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 対象予約のメッセージ一覧
  const bookingMessages = messages.filter((m) => m.booking_id === booking.id);

  // 開いた時に既読処理
  useEffect(() => {
    markMessagesAsRead(booking.id);
  }, [booking.id, bookingMessages.length, markMessagesAsRead]);

  // 新着メッセージで最下部へスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [bookingMessages.length]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    try {
      await sendChatMessage(booking.id, partnerId, text);
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-50 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px] max-h-[92vh] animate-fadeIn cursor-default"
      >
        {/* ヘッダー */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <img
                src={partnerUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={partnerUser?.name}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/20"
              />
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5"></span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {partnerUser?.name || 'お相手'}
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-bold">
                  {isTherapist ? 'お客様' : 'セラピスト'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 truncate">
                <span>{service?.title}</span>
                <span>•</span>
                <span>{formatDate(booking.scheduled_at)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 囲い込み・直接取引防止バナー */}
        <div className="bg-emerald-50 px-3.5 py-1.5 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>安心メッセージ機能（アプリ内完結）</span>
          </div>
          <span className="text-[10px] text-emerald-600">直接取引・個人LINE交換防止</span>
        </div>

        {/* メッセージ本文スクロールエリア */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookingMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-200/60 flex items-center justify-center mb-2">
                <MessageCircle className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-600">メッセージはまだありません</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                当日の訪問場所・駐車場の案内や、到着時刻のご連絡などにご活用ください。
              </p>
            </div>
          ) : (
            bookingMessages.map((msg) => {
              const isMine = msg.sender_id === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {/* 相手のアバター */}
                  {!isMine && (
                    <img
                      src={partnerUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt=""
                      className="w-7 h-7 rounded-xl object-cover shrink-0 mb-1"
                    />
                  )}

                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs break-words ${
                        isMine
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>

                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatMessageTime(msg.created_at)}
                      </span>
                      {isMine && (
                        <span className="text-[10px] text-emerald-600 flex items-center font-bold">
                          <CheckCheck className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力フォーム */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力... (Enterで送信)"
              className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center transition shadow-xs disabled:opacity-40 active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
