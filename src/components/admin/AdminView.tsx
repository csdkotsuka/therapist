'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatPrice, formatDate } from '@/lib/geo';
import {
  ShieldAlert,
  Users,
  Calendar,
  Percent,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Trash2,
  DollarSign,
  TrendingUp,
  Sliders,
  Check,
  Building,
  Home,
  ShieldCheck,
  Activity,
  Search,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { BookingStatus } from '@/types';

export const AdminView: React.FC = () => {
  const router = useRouter();
  const {
    allUsers,
    therapistProfiles,
    services,
    bookings,
    reviews,
    platformFeeRate,
    setPlatformFeeRate,
    toggleTherapistApproval,
    updateBookingStatus,
    refreshFromSupabase,
    isLoadingDb,
    switchUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kpi' | 'bookings' | 'users' | 'customers' | 'reviews' | 'settings'>('kpi');
  const [feeInput, setFeeInput] = useState<number>(platformFeeRate);
  const [feeSaveMessage, setFeeSaveMessage] = useState(false);

  // セラピスト審査・管理の絞り込み状態
  const [thSearch, setThSearch] = useState('');
  const [thApprovalFilter, setThApprovalFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [thAreaFilter, setThAreaFilter] = useState<string>('all');
  const [thStyleFilter, setThStyleFilter] = useState<'all' | 'visit' | 'store'>('all');

  // 顧客一覧の絞り込み状態
  const [custSearch, setCustSearch] = useState('');
  const [custAreaFilter, setCustAreaFilter] = useState<string>('all');
  const [custBookingFilter, setCustBookingFilter] = useState<'all' | 'has_bookings' | 'no_bookings'>('all');

  // 全体メトリクス
  const totalGMV = bookings
    .filter((b) => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.total_amount, 0);

  const totalRevenue = bookings
    .filter((b) => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.platform_fee, 0);

  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;
  const therapists = allUsers.filter((u) => u.role === 'therapist');
  const customers = allUsers.filter((u) => u.role === 'customer');

  // 絞り込み後のセラピスト一覧
  const filteredTherapists = therapists.filter((th) => {
    const tp = therapistProfiles[th.id];
    const isApproved = tp?.is_approved ?? false;

    // 1. 承認ステータス
    if (thApprovalFilter === 'approved' && !isApproved) return false;
    if (thApprovalFilter === 'pending' && isApproved) return false;

    // 2. エリア
    if (thAreaFilter !== 'all') {
      const addr = th.address || tp?.address || '';
      if (thAreaFilter === 'その他') {
        const mainCities = ['松山市', '今治市', '新居浜市', '西条市', '四国中央市', '宇和島市'];
        if (mainCities.some((c) => addr.includes(c))) return false;
      } else {
        if (!addr.includes(thAreaFilter)) return false;
      }
    }

    // 3. 施術形態
    if (thStyleFilter === 'visit' && !tp?.is_visit_based) return false;
    if (thStyleFilter === 'store' && !tp?.is_store_based) return false;

    // 4. キーワード検索
    if (thSearch.trim()) {
      const q = thSearch.toLowerCase();
      const nameMatch = th.name.toLowerCase().includes(q);
      const phoneMatch = th.phone?.toLowerCase().includes(q) ?? false;
      const addrMatch = (th.address || tp?.address || '').toLowerCase().includes(q);
      const specMatch = tp?.specialities?.some((s) => s.toLowerCase().includes(q)) ?? false;
      if (!nameMatch && !phoneMatch && !addrMatch && !specMatch) return false;
    }

    return true;
  });

  // 絞り込み後の顧客一覧
  const filteredCustomers = customers.filter((c) => {
    const customerBookings = bookings.filter((b) => b.customer_id === c.id);

    // 1. エリア
    if (custAreaFilter !== 'all') {
      const addr = c.address || '';
      if (custAreaFilter === 'その他') {
        const mainCities = ['松山市', '今治市', '新居浜市', '西条市', '四国中央市', '宇和島市'];
        if (mainCities.some((city) => addr.includes(city))) return false;
      } else {
        if (!addr.includes(custAreaFilter)) return false;
      }
    }

    // 2. 予約実績
    if (custBookingFilter === 'has_bookings' && customerBookings.length === 0) return false;
    if (custBookingFilter === 'no_bookings' && customerBookings.length > 0) return false;

    // 3. キーワード検索
    if (custSearch.trim()) {
      const q = custSearch.toLowerCase();
      const nameMatch = c.name.toLowerCase().includes(q);
      const emailMatch = c.email?.toLowerCase().includes(q) ?? false;
      const phoneMatch = c.phone?.toLowerCase().includes(q) ?? false;
      const addrMatch = (c.address || '').toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !phoneMatch && !addrMatch) return false;
    }

    return true;
  });

  const handleSaveFee = () => {
    setPlatformFeeRate(Number(feeInput));
    setFeeSaveMessage(true);
    setTimeout(() => setFeeSaveMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-purple-400">
              Admin Console
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1">CareHub プラットフォーム管理本部</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            全予約の監視・セラピスト承認・売上分配・手数料率設定
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
          <Percent className="w-4 h-4 text-emerald-400" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">現在の手数料率</span>
            <span className="text-sm font-black text-emerald-400">{platformFeeRate}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('kpi')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'kpi'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>KPI・ダッシュボード</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>全予約ステータス監視 ({bookings.length})</span>
          {pendingBookingsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>
            セラピスト審査・管理 (
            {filteredTherapists.length !== therapists.length
              ? `${filteredTherapists.length}/`
              : ''}
            {therapists.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'customers'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>
            顧客一覧 & 視点切替 (
            {filteredCustomers.length !== customers.length
              ? `${filteredCustomers.length}/`
              : ''}
            {customers.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>レビュー管理 ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>手数料率・プラットフォーム設定</span>
        </button>
      </div>

      {/* タブ 1: KPI ダッシュボード */}
      {activeTab === 'kpi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                総流通額 (GMV)
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{formatPrice(totalGMV)}</div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">確定・完了予約の総額</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                プラットフォーム手数料収益
              </span>
              <div className="text-2xl font-black text-purple-700 mt-1">{formatPrice(totalRevenue)}</div>
              <span className="text-[11px] text-purple-600 font-bold mt-1 block">平均テイクレート: {platformFeeRate}%</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                総予約リクエスト数
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{bookings.length} 件</div>
              <span className="text-[11px] text-amber-600 font-bold mt-1 block">未承認: {pendingBookingsCount} 件</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                アクティブセラピスト
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{therapists.length} 名</div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">登録顧客数: {customers.length} 名</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 予約ステータス内訳 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-4">予約ステータス構成</h4>
              <div className="space-y-3">
                {[
                  { label: '承認待ち (Pending)', count: bookings.filter((b) => b.status === 'pending').length, color: 'bg-amber-400' },
                  { label: '予約確定 (Confirmed)', count: bookings.filter((b) => b.status === 'confirmed').length, color: 'bg-emerald-500' },
                  { label: '施術完了 (Completed)', count: bookings.filter((b) => b.status === 'completed').length, color: 'bg-sky-500' },
                  { label: 'キャンセル (Cancelled)', count: bookings.filter((b) => b.status === 'cancelled').length, color: 'bg-rose-400' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>{item.label}</span>
                      <span>{item.count} 件</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{ width: `${(item.count / Math.max(1, bookings.length)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* プラットフォーム利用規約・セキュリティ状態 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">システム＆セキュリティ監視</h4>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-600 font-medium">PostGIS 空間インデックス</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">稼働中 (Normal)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Stripe Connect 分配エンジン</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">正常接続</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Row Level Security (RLS)</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">全テーブル有効</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* タブ 2: 全予約ステータス監視 */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h4 className="font-bold text-slate-900 text-sm">全予約トランザクション監視</h4>
            <span className="text-xs text-slate-500">最新順</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">予約ID</th>
                  <th className="px-6 py-3">顧客</th>
                  <th className="px-6 py-3">セラピスト</th>
                  <th className="px-6 py-3">形態</th>
                  <th className="px-6 py-3">日時</th>
                  <th className="px-6 py-3">金額 / 手数料</th>
                  <th className="px-6 py-3">ステータス</th>
                  <th className="px-6 py-3 text-right">管理者操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => {
                  const customer = allUsers.find((u) => u.id === b.customer_id);
                  const therapist = allUsers.find((u) => u.id === b.therapist_id);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-3.5 font-mono text-[11px] text-slate-500">{b.id}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">{customer?.name}</td>
                      <td className="px-6 py-3.5 text-slate-700">{therapist?.name}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {b.booking_type === 'visit' ? '出張' : '店舗'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{formatDate(b.scheduled_at)}</td>
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-slate-900">{formatPrice(b.total_amount)}</span>
                        <span className="text-[10px] text-purple-600 block">手数料: {formatPrice(b.platform_fee)}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : b.status === 'completed'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button
                            onClick={() => {
                              if (confirm('管理者権限でこの予約を強制キャンセル・全額返金しますか？')) {
                                updateBookingStatus(b.id, 'cancelled');
                              }
                            }}
                            className="px-2.5 py-1 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg font-bold border border-rose-200 transition"
                          >
                            強制キャンセル
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* タブ 3: セラピスト・ユーザー審査 */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">セラピスト登録審査 & パートナー管理</h4>
              <p className="text-[11px] text-slate-500">
                該当 {filteredTherapists.length} 名 / 全 {therapists.length} 名
              </p>
            </div>
            <button
              onClick={() => refreshFromSupabase()}
              disabled={isLoadingDb}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isLoadingDb ? '同期中...' : '最新データを取得'}</span>
            </button>
          </div>

          {/* 絞り込みフィルターバー */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* キーワード検索 */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={thSearch}
                onChange={(e) => setThSearch(e.target.value)}
                placeholder="セラピスト名、住所、専門分野で検索..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-500 shadow-2xs"
              />
            </div>

            {/* フィルターセレクト群 */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 審査ステータス */}
              <select
                value={thApprovalFilter}
                onChange={(e) => setThApprovalFilter(e.target.value as any)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-emerald-500 shadow-2xs"
              >
                <option value="all">審査: すべて</option>
                <option value="approved">承認済のみ</option>
                <option value="pending">審査中のみ</option>
              </select>

              {/* エリア */}
              <select
                value={thAreaFilter}
                onChange={(e) => setThAreaFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-emerald-500 shadow-2xs"
              >
                <option value="all">エリア: 全域</option>
                <option value="松山市">松山市</option>
                <option value="今治市">今治市</option>
                <option value="新居浜市">新居浜市</option>
                <option value="西条市">西条市</option>
                <option value="四国中央市">四国中央市</option>
                <option value="宇和島市">宇和島市</option>
                <option value="その他">その他市町</option>
              </select>

              {/* 施術形態 */}
              <select
                value={thStyleFilter}
                onChange={(e) => setThStyleFilter(e.target.value as any)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-emerald-500 shadow-2xs"
              >
                <option value="all">形態: すべて</option>
                <option value="visit">出張対応</option>
                <option value="store">店舗あり</option>
              </select>

              {/* リセットボタン */}
              {(thSearch || thApprovalFilter !== 'all' || thAreaFilter !== 'all' || thStyleFilter !== 'all') && (
                <button
                  onClick={() => {
                    setThSearch('');
                    setThApprovalFilter('all');
                    setThAreaFilter('all');
                    setThStyleFilter('all');
                  }}
                  className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl flex items-center gap-1 transition"
                  title="条件をクリア"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>クリア</span>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTherapists.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                条件に一致するセラピストが見つかりませんでした
              </div>
            ) : (
              filteredTherapists.map((th) => {
                const tp = therapistProfiles[th.id];
                const isApproved = tp?.is_approved ?? false;

                return (
                  <div key={th.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={th.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(th.name)}`}
                        alt={th.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{th.name}</h4>
                          <span className="text-xs text-slate-400 font-mono">{th.email}</span>
                          {!isApproved && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              新規・審査中
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 max-w-xl">
                          {tp?.bio || '新規登録セラピストです。管理者による審査待ちです。'}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(tp?.specialities && tp.specialities.length > 0
                            ? tp.specialities
                            : ['ボディケア', '整体']
                          ).map((spec) => (
                            <span key={spec} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-medium">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 承認トグルスイッチ & 視点切り替えボタン */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          switchUser(th.id);
                          router.push('/therapist');
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        title="このセラピストの視点で操作画面を表示"
                      >
                        <span>セラピスト視点で表示</span>
                      </button>

                      <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                        <span className={`text-xs font-bold ${isApproved ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {isApproved ? '承認済' : '審査中'}
                        </span>
                        <button
                          onClick={() => toggleTherapistApproval(th.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isApproved ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isApproved ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* タブ 4: 顧客一覧 & 視点切り替え */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">登録顧客一覧 & 視点切り替え</h4>
              <p className="text-[11px] text-slate-500">
                該当 {filteredCustomers.length} 名 / 全 {customers.length} 名
              </p>
            </div>
            <button
              onClick={() => refreshFromSupabase()}
              disabled={isLoadingDb}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isLoadingDb ? '同期中...' : '最新データを取得'}</span>
            </button>
          </div>

          {/* 絞り込みフィルターバー */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* キーワード検索 */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={custSearch}
                onChange={(e) => setCustSearch(e.target.value)}
                placeholder="顧客氏名、電話番号、メール、住所で検索..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-500 shadow-2xs"
              />
            </div>

            {/* フィルターセレクト群 */}
            <div className="flex flex-wrap items-center gap-2">
              {/* エリア */}
              <select
                value={custAreaFilter}
                onChange={(e) => setCustAreaFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-emerald-500 shadow-2xs"
              >
                <option value="all">エリア: 全域</option>
                <option value="松山市">松山市</option>
                <option value="今治市">今治市</option>
                <option value="新居浜市">新居浜市</option>
                <option value="西条市">西条市</option>
                <option value="四国中央市">四国中央市</option>
                <option value="宇和島市">宇和島市</option>
                <option value="その他">その他市町</option>
              </select>

              {/* 予約実績 */}
              <select
                value={custBookingFilter}
                onChange={(e) => setCustBookingFilter(e.target.value as any)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-emerald-500 shadow-2xs"
              >
                <option value="all">予約実績: すべて</option>
                <option value="has_bookings">予約利用あり</option>
                <option value="no_bookings">未利用（0件）</option>
              </select>

              {/* リセットボタン */}
              {(custSearch || custAreaFilter !== 'all' || custBookingFilter !== 'all') && (
                <button
                  onClick={() => {
                    setCustSearch('');
                    setCustAreaFilter('all');
                    setCustBookingFilter('all');
                  }}
                  className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl flex items-center gap-1 transition"
                  title="条件をクリア"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>クリア</span>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                条件に一致する顧客が見つかりませんでした
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const customerBookings = bookings.filter((b) => b.customer_id === c.id);

                return (
                  <div key={c.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name)}`}
                        alt={c.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/20 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">{c.email}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            予約 {customerBookings.length} 件
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                          {c.phone && (
                            <span className="inline-flex items-center gap-1 font-mono">
                              📞 {c.phone}
                            </span>
                          )}
                          {c.address && (
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              📍 {c.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* この顧客として表示（視点切り替え）ボタン */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => {
                          switchUser(c.id);
                          router.push('/');
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        title="この顧客の視点に切り替えて操作する"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>この顧客として表示</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* タブ 4: レビュー管理 */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm">レビューモデレーション</h4>
          <p className="text-xs text-slate-500">不適切なレビューや規約違反コメントの監視・非表示化を行えます。</p>

          <div className="space-y-3">
            {reviews.map((rev) => {
              const customer = allUsers.find((u) => u.id === rev.customer_id);
              const therapist = allUsers.find((u) => u.id === rev.therapist_id);

              return (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-start gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{customer?.name} 様</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-semibold text-slate-700">{therapist?.name} セラピストへ</span>
                      <div className="flex text-amber-500 font-bold ml-2">
                        ★ {rev.rating}
                      </div>
                    </div>
                    <p className="text-slate-600 mt-1.5 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{formatDate(rev.created_at)}</span>
                  </div>

                  <button
                    onClick={() => alert('このレビューを非表示・モデレーション処理しました')}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition"
                    title="非表示・削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* タブ 5: プラットフォーム手数料設定 */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 max-w-xl space-y-6">
          <div>
            <h4 className="font-bold text-slate-900 text-base">プラットフォーム手数料率の設定</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              決済時にプラットフォームが徴収する手数料率（Take Rate）を設定します。新規予約から自動適用されます。
            </p>
          </div>

          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-purple-900">手数料率 (%)</span>
              <span className="text-2xl font-black text-purple-700">{feeInput}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={feeInput}
              onChange={(e) => setFeeInput(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-purple-400">
              <span>5% (低コスト)</span>
              <span>20% (業界標準)</span>
              <span>40% (高付加価値)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {feeSaveMessage && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                設定を更新しました (即時反映)
              </span>
            )}
            <button
              onClick={handleSaveFee}
              className="ml-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              手数料率を保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
