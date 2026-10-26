'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatPrice, formatDate } from '@/lib/geo';
import { APP_BRANDS, AVAILABLE_ICONS, AVAILABLE_LOGOS } from '@/lib/branding';
import { AppBrandId, BookingStatus } from '@/types';
import {
  getChecklist,
  getVerificationStage,
  STAGE_META,
  QUALIFICATION_TYPES,
  REVIEW_FEE_YEN,
  STORAGE_BUCKET,
  VerificationStage,
  sampleDocumentDataUrl,
  isTherapistCertified,
} from '@/lib/verification';
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
  Palette,
  Sparkles,
  FileText,
  CreditCard,
  Eye,
  Lock,
  Award,
  X,
  ClipboardCheck,
  History,
  Upload,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

export type AdminSection = 'kpi' | 'bookings' | 'therapists' | 'customers' | 'messages' | 'reviews' | 'branding' | 'settings';

interface AdminViewProps {
  activeSection?: AdminSection;
}

export const AdminView: React.FC<AdminViewProps> = ({ activeSection = 'therapists' }) => {
  const router = useRouter();
  const {
    allUsers,
    therapistProfiles,
    services,
    bookings,
    reviews,
    messages,
    platformFeeRate,
    setPlatformFeeRate,
    toggleTherapistApproval,
    updateBookingStatus,
    refreshFromSupabase,
    isLoadingDb,
    switchUser,
    appBrand,
    currentBrand,
    customBranding,
    setAppBrand,
    updateCustomBranding,
    onboardings,
    verificationLogs,
    completeReviewFeePayment,
    completeStripeEkyc,
    submitTermsAgreement,
    uploadVerificationDoc,
    getVerificationDocPreviewUrl,
    approveTherapistVerification,
    rejectTherapistVerification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminSection>(activeSection);

  useEffect(() => {
    setActiveTab(activeSection);
  }, [activeSection]);
  const [feeInput, setFeeInput] = useState<number>(platformFeeRate);
  const [feeSaveMessage, setFeeSaveMessage] = useState(false);
  const [brandSaveMessage, setBrandSaveMessage] = useState<string | null>(null);

  // 審査モーダル＆監査ログ表示状態
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [qualPreviewUrl, setQualPreviewUrl] = useState<string | null>(null);
  const [insPreviewUrl, setInsPreviewUrl] = useState<string | null>(null);
  const [approvalQualificationType, setApprovalQualificationType] = useState<string>(QUALIFICATION_TYPES[0]);
  const [approvalRegistrationNumber, setApprovalRegistrationNumber] = useState<string>('');
  const [nameMatchConfirmed, setNameMatchConfirmed] = useState<boolean>(false);
  const [insuranceConfirmed, setInsuranceConfirmed] = useState<boolean>(false);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('');
  const [verificationFeedback, setVerificationFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessingDecision, setIsProcessingDecision] = useState<boolean>(false);
  const [showAuditLogsPanel, setShowAuditLogsPanel] = useState<boolean>(false);

  const handleSwitchBrand = async (brandId: AppBrandId) => {
    const target = APP_BRANDS[brandId];
    if (target) {
      await updateCustomBranding({
        appName: target.name,
        appJapaneseName: target.japaneseName,
        appCatchphrase: target.catchphrase,
        appTagline: target.tagline,
        selectedIcon: target.iconUrl,
        selectedLogo: target.logoUrl,
      });
    }
    await setAppBrand(brandId);
    setBrandSaveMessage(`「${target.japaneseName}」のプリセット設定を一括適用しました。ここから個別に変更可能です。`);
    setTimeout(() => {
      setBrandSaveMessage(null);
    }, 4500);
  };

  // 独立設定フォーム用のローカルstate
  const [appNameInput, setAppNameInput] = useState(currentBrand.name);
  const [appJpNameInput, setAppJpNameInput] = useState(currentBrand.japaneseName);
  const [appCatchphraseInput, setAppCatchphraseInput] = useState(currentBrand.catchphrase);

  useEffect(() => {
    setAppNameInput(currentBrand.name);
    setAppJpNameInput(currentBrand.japaneseName);
    setAppCatchphraseInput(currentBrand.catchphrase);
  }, [currentBrand.name, currentBrand.japaneseName, currentBrand.catchphrase]);

  const handleSaveAppName = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCustomBranding({
      appName: appNameInput,
      appJapaneseName: appJpNameInput,
      appCatchphrase: appCatchphraseInput,
    });
    setBrandSaveMessage(`アプリ名を「${appJpNameInput} (${appNameInput})」に更新しました。`);
    setTimeout(() => setBrandSaveMessage(null), 4000);
  };

  const handleSelectIcon = async (iconUrl?: string) => {
    await updateCustomBranding({ selectedIcon: iconUrl });
    setBrandSaveMessage('アプリアイコン・ファビコンを更新しました。');
    setTimeout(() => setBrandSaveMessage(null), 4000);
  };

  const handleSelectLogo = async (logoUrl?: string) => {
    await updateCustomBranding({ selectedLogo: logoUrl });
    setBrandSaveMessage('ヘッダー用ブランドロゴを更新しました。');
    setTimeout(() => setBrandSaveMessage(null), 4000);
  };

  // セラピスト審査・管理の絞り込み状態
  const [thSearch, setThSearch] = useState('');
  const [thApprovalFilter, setThApprovalFilter] = useState<'all' | 'unapproved' | 'ready' | 'in_progress' | 'rejected' | 'certified'>('all');
  const [thAreaFilter, setThAreaFilter] = useState<string>('all');
  const [thStyleFilter, setThStyleFilter] = useState<'all' | 'visit' | 'store'>('all');

  // 顧客一覧の絞り込み状態
  const [custSearch, setCustSearch] = useState('');
  const [custAreaFilter, setCustAreaFilter] = useState<string>('all');
  const [custBookingFilter, setCustBookingFilter] = useState<'all' | 'has_bookings' | 'no_bookings'>('all');

  // レビュー一覧のソート状態
  const [reviewSort, setReviewSort] = useState<'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc' | 'customer_asc' | 'therapist_asc'>('date_desc');

  // メッセージ監視の絞り込み状態
  const [msgSearch, setMsgSearch] = useState<string>('');
  const [msgFilter, setMsgFilter] = useState<'all' | 'suspicious' | 'customer' | 'therapist'>('all');

  // 横スクロールタブで現在のアクティブタブを可視領域に自動スクロール
  const activeTabNavRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (activeTabNavRef.current) {
      activeTabNavRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

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

  // 審査ステージ集計
  const stagePriority: Record<VerificationStage, number> = {
    ready: 0,
    in_progress: 1,
    rejected: 2,
    not_started: 3,
    certified: 4,
    legacy: 5,
  };

  const readyCount = therapists.filter((t) => getVerificationStage(therapistProfiles[t.id], onboardings[t.id]) === 'ready').length;
  const inProgressCount = therapists.filter((t) => {
    const s = getVerificationStage(therapistProfiles[t.id], onboardings[t.id]);
    return s === 'in_progress' || s === 'not_started';
  }).length;
  const rejectedCount = therapists.filter((t) => getVerificationStage(therapistProfiles[t.id], onboardings[t.id]) === 'rejected').length;
  const certifiedCount = therapists.filter((t) => getVerificationStage(therapistProfiles[t.id], onboardings[t.id]) === 'certified').length;
  const unapprovedCount = readyCount + inProgressCount + rejectedCount;

  // モーダルオープン時にプレビューURLや初期選択値をセットアップ
  const openVerificationModal = async (therapistId: string) => {
    setSelectedTherapistId(therapistId);
    setVerificationFeedback(null);
    setRejectReasonInput('');
    const ob = onboardings[therapistId];
    const tp = therapistProfiles[therapistId];
    const defaultQual =
      ob?.claimed_qualification_type && (QUALIFICATION_TYPES as readonly string[]).includes(ob.claimed_qualification_type)
        ? ob.claimed_qualification_type
        : QUALIFICATION_TYPES[0];
    setApprovalQualificationType(defaultQual);
    setApprovalRegistrationNumber('第 49201 号');
    setNameMatchConfirmed(Boolean(tp?.is_identity_verified && ob?.qualification_file_path));
    setInsuranceConfirmed(Boolean(ob?.insurance_file_path));

    const [qUrl, iUrl] = await Promise.all([
      getVerificationDocPreviewUrl(therapistId, 'qualification'),
      getVerificationDocPreviewUrl(therapistId, 'insurance'),
    ]);
    setQualPreviewUrl(qUrl);
    setInsPreviewUrl(iUrl);
  };

  // 選択中セラピストの提出状態変化に応じてプレビューURLを再取得
  useEffect(() => {
    if (!selectedTherapistId) return;
    let active = true;
    Promise.all([
      getVerificationDocPreviewUrl(selectedTherapistId, 'qualification'),
      getVerificationDocPreviewUrl(selectedTherapistId, 'insurance'),
    ]).then(([qUrl, iUrl]) => {
      if (!active) return;
      setQualPreviewUrl(qUrl);
      setInsPreviewUrl(iUrl);
    });
    return () => {
      active = false;
    };
  }, [selectedTherapistId, onboardings, getVerificationDocPreviewUrl]);

  // 絞り込み・審査優先順ソート後のセラピスト一覧
  const filteredTherapists = therapists
    .filter((th) => {
      const tp = therapistProfiles[th.id];
      const ob = onboardings[th.id];
      const stage = getVerificationStage(tp, ob);

      // 1. 審査ステージフィルター
      if (thApprovalFilter === 'unapproved' && stage === 'certified') return false;
      if (thApprovalFilter === 'ready' && stage !== 'ready') return false;
      if (thApprovalFilter === 'in_progress' && stage !== 'in_progress' && stage !== 'not_started') return false;
      if (thApprovalFilter === 'rejected' && stage !== 'rejected') return false;
      if (thApprovalFilter === 'certified' && stage !== 'certified') return false;

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
    })
    .sort((a, b) => {
      const stageA = getVerificationStage(therapistProfiles[a.id], onboardings[a.id]);
      const stageB = getVerificationStage(therapistProfiles[b.id], onboardings[b.id]);
      return stagePriority[stageA] - stagePriority[stageB];
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
          <h2 className="text-xl font-bold mt-1">{currentBrand.japaneseName} ({currentBrand.name}) 管理ポータル</h2>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
          <Percent className="w-4 h-4 text-emerald-400" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">現在の手数料率</span>
            <span className="text-sm font-black text-emerald-400">{platformFeeRate}%</span>
          </div>
        </div>
      </div>

      {/* 管理セクション見出しバー (セラピスト画面と統一された構造) */}
      {(() => {
        const adminSections = [
          { id: 'kpi' as const, label: 'KPI・ダッシュボード', icon: TrendingUp, desc: '流通総額・売上収益・予約推移のリアルタイム統計' },
          { id: 'bookings' as const, label: `全予約ステータス監視 (${bookings.length})`, icon: Calendar, desc: '出張・店舗の全トランザクション監視と強制キャンセル' },
          { id: 'therapists' as const, label: `セラピスト審査・管理 (${therapists.length})`, icon: ShieldCheck, desc: '4ステップ登録審査・書類確認・認定バッジ付与' },
          { id: 'customers' as const, label: `顧客一覧 & 視点切替 (${customers.length})`, icon: Users, desc: '登録顧客リストの確認・代理ログイン視点切替' },
          { id: 'messages' as const, label: `全メッセージ監視 (${messages.length})`, icon: MessageCircle, desc: 'トラブル防止・直契約監視・連絡履歴の確認' },
          { id: 'reviews' as const, label: `口コミ・レビュー管理 (${reviews.length})`, icon: Star, desc: 'お客様評価・口コミのソートとモデレーション' },
          { id: 'branding' as const, label: 'ブランド・ロゴ設定', icon: Palette, desc: 'サービス名（Care KURU等）やアプリアイコンの一括切替' },
          { id: 'settings' as const, label: '手数料率・プラットフォーム設定', icon: Sliders, desc: '基本手数料率の設定と保存' },
        ];
        const currentSec = adminSections.find((s) => s.id === activeTab) || adminSections[0];
        const SecIcon = currentSec.icon;

        return (
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 shadow-2xs">
                <SecIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                  {currentSec.label}
                </h1>
                <p className="text-xs text-slate-500 truncate hidden sm:block">
                  {currentSec.desc}
                </p>
              </div>
            </div>

            {/* クイックタブ（横スクロール可能・現在開いているタブに自動追従） */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 shrink-0 max-w-full sm:max-w-md lg:max-w-xl scrollbar-none">
              {adminSections.map((sec) => (
                <Link
                  key={sec.id}
                  ref={activeTab === sec.id ? activeTabNavRef : undefined}
                  href={`/admin/${sec.id}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                    activeTab === sec.id
                      ? 'bg-purple-900 text-white shadow-xs ring-2 ring-purple-600/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {sec.id === 'kpi'
                    ? 'KPI'
                    : sec.id === 'bookings'
                    ? '予約監視'
                    : sec.id === 'therapists'
                    ? '審査管理'
                    : sec.id === 'customers'
                    ? '顧客'
                    : sec.id === 'messages'
                    ? 'メッセージ'
                    : sec.id === 'reviews'
                    ? 'レビュー'
                    : sec.id === 'branding'
                    ? 'ブランド'
                    : '設定'}
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

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
            <table className="w-full text-left text-xs whitespace-nowrap min-w-[760px]">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3 whitespace-nowrap">予約番号</th>
                  <th className="px-5 py-3 whitespace-nowrap">顧客名</th>
                  <th className="px-5 py-3 whitespace-nowrap">セラピスト</th>
                  <th className="px-5 py-3 whitespace-nowrap">形態</th>
                  <th className="px-5 py-3 whitespace-nowrap">予約日時</th>
                  <th className="px-5 py-3 whitespace-nowrap">金額 / 手数料</th>
                  <th className="px-5 py-3 whitespace-nowrap">ステータス</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">管理者操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b, idx) => {
                  const customer = allUsers.find((u) => u.id === b.customer_id);
                  const therapist = allUsers.find((u) => u.id === b.therapist_id);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {b.serial_number || `BK-${String(idx + 1).padStart(4, '0')}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800 whitespace-nowrap">{customer?.name}</td>
                      <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">{therapist?.name}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {b.booking_type === 'visit' ? '出張' : '店舗'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{formatDate(b.scheduled_at)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{formatPrice(b.total_amount)}</span>
                        <span className="text-[10px] text-purple-600 block">手数料: {formatPrice(b.platform_fee)}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'awaiting_payment'
                              ? 'bg-teal-100 text-teal-800'
                              : b.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : b.status === 'completed'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {b.status === 'awaiting_payment' ? '承諾・決済待ち' : b.status === 'pending' ? '承認待ち' : b.status === 'confirmed' ? '予約確定' : b.status === 'completed' ? '完了' : 'キャンセル'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
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

      {/* タブ 3: セラピスト登録審査・書類確認 */}
      {activeTab === 'therapists' && (
        <div className="space-y-4">
          {/* 4ステップ審査フロー概要 (シンプル化) */}
          <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-md border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm sm:text-base font-black">
                セラピスト登録審査
              </h3>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowAuditLogsPanel((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    showAuditLogsPanel
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>承認ログ ({verificationLogs.length})</span>
                </button>
                <button
                  onClick={() => refreshFromSupabase()}
                  disabled={isLoadingDb}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isLoadingDb ? '同期中...' : '更新'}</span>
                </button>
              </div>
            </div>

            {/* 4ステップ (最小限のテキスト) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-amber-300 block">Step 1</span>
                <span className="font-bold text-white text-xs">審査手数料</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-sky-300 block">Step 2</span>
                <span className="font-bold text-white text-xs">eKYC身分確認</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-purple-300 block">Step 3</span>
                <span className="font-bold text-white text-xs">誓約・書類提出</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30">
                <span className="text-[10px] font-bold text-emerald-300 block">Step 4</span>
                <span className="font-bold text-emerald-200 text-xs">照合・承認</span>
              </div>
            </div>
          </div>

          {/* 審査ステージ別クイックフィルターカード */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { id: 'all', label: '全セラピスト', count: therapists.length, desc: '一覧表示', color: 'border-slate-200 bg-white text-slate-800' },
              { id: 'unapproved', label: '要確認・審査中', count: unapprovedCount, desc: '未承認すべて', color: 'border-amber-300 bg-amber-50/70 text-amber-900' },
              { id: 'ready', label: 'Step4 承認待ち', count: readyCount, desc: '全4書類＋決済完了', color: 'border-emerald-300 bg-emerald-50/80 text-emerald-900' },
              { id: 'in_progress', label: 'Step1〜3 手続き中', count: inProgressCount, desc: '決済・eKYC・書類待ち', color: 'border-sky-300 bg-sky-50/70 text-sky-900' },
              { id: 'rejected', label: '差戻し・再提出待ち', count: rejectedCount, desc: '旧ファイル削除済', color: 'border-rose-300 bg-rose-50/70 text-rose-900' },
              { id: 'certified', label: '本登録・専門認定済', count: certifiedCount, desc: '原本破棄済・ログ保持', color: 'border-indigo-200 bg-indigo-50/60 text-indigo-900' },
            ].map((card) => {
              const active = thApprovalFilter === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => setThApprovalFilter(card.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${card.color} ${
                    active ? 'ring-2 ring-slate-900 shadow-md -translate-y-0.5' : 'hover:shadow-xs opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold">{card.label}</span>
                    {active && <span className="w-2 h-2 rounded-full bg-slate-900" />}
                  </div>
                  <div className="text-xl font-black mt-1">{card.count} 名</div>
                  <span className="text-[10px] opacity-75 block mt-0.5">{card.desc}</span>
                </button>
              );
            })}
          </div>

          {/* 承認・自動データ削除ログ（テキスト監査証跡）パネル */}
          {showAuditLogsPanel && (
            <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-md overflow-hidden">
              <div className="px-6 py-3.5 bg-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-sm">審査証跡ログ</h4>
                  </div>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    原本ファイル削除後も、承認日時・管理者・資格名・登録番号の証跡を保持します。
                  </p>
                </div>
                <button
                  onClick={() => setShowAuditLogsPanel(false)}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold self-start sm:self-auto cursor-pointer"
                >
                  閉じる
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">承認/判定日時</th>
                      <th className="px-4 py-3 whitespace-nowrap">対象セラピスト</th>
                      <th className="px-4 py-3 whitespace-nowrap">判定</th>
                      <th className="px-4 py-3 whitespace-nowrap">確認資格名</th>
                      <th className="px-4 py-3 whitespace-nowrap">登録番号</th>
                      <th className="px-4 py-3 whitespace-nowrap">照合氏名</th>
                      <th className="px-4 py-3 whitespace-nowrap">管理者</th>
                      <th className="px-4 py-3 whitespace-nowrap min-w-[140px]">Storage自動削除</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {verificationLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(log.verified_at)}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                          {log.therapist_name || log.therapist_id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.decision === 'approved' ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              承認・認定付与
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              差戻し
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-indigo-900 whitespace-nowrap">
                          {log.qualification_type || <span className="text-slate-400 font-normal">-</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                          {log.registration_number || <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                          {log.confirmed_name || <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {log.verified_by ? `${log.verified_by.slice(0, 8)}...` : 'admin'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap min-w-[140px]">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                            <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{log.files_deleted_count ?? 0}件 削除済</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* メイン一覧テーブル＆カード */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
              <h4 className="font-bold text-slate-900 text-sm">
                セラピスト審査・提出書類一覧 ({filteredTherapists.length}名)
              </h4>
            </div>

            {/* 絞り込みフィルターバー */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={thSearch}
                  onChange={(e) => setThSearch(e.target.value)}
                  placeholder="セラピスト名、住所、専門資格で検索..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-500 shadow-2xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={thApprovalFilter}
                  onChange={(e) => setThApprovalFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-emerald-500 shadow-2xs"
                >
                  <option value="all">審査ステージ: すべて ({therapists.length})</option>
                  <option value="unapproved">要確認・未承認のみ ({unapprovedCount})</option>
                  <option value="ready">Step4: 最終承認待ち ({readyCount})</option>
                  <option value="in_progress">Step1〜3: 手続き中 ({inProgressCount})</option>
                  <option value="rejected">差戻し・再提出待ち ({rejectedCount})</option>
                  <option value="certified">本登録・専門認定済 ({certifiedCount})</option>
                </select>

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

                <select
                  value={thStyleFilter}
                  onChange={(e) => setThStyleFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-emerald-500 shadow-2xs"
                >
                  <option value="all">形態: すべて</option>
                  <option value="visit">出張対応</option>
                  <option value="store">店舗あり</option>
                </select>

                {(thSearch || thApprovalFilter !== 'all' || thAreaFilter !== 'all' || thStyleFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setThSearch('');
                      setThApprovalFilter('all');
                      setThAreaFilter('all');
                      setThStyleFilter('all');
                    }}
                    className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>クリア</span>
                  </button>
                )}
              </div>
            </div>

            {/* セラピスト審査一覧 (横スクロール対応 & 幅下限設定で損害保険との被りを完全防止) */}
            <div className="overflow-x-auto">
              <div className="min-w-[880px]">
                {/* テーブル見出し行 */}
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-between">
                  <div className="w-[240px] shrink-0">セラピスト・専門職情報</div>
                  <div className="w-[380px] shrink-0 grid grid-cols-5 text-center text-[11px] font-bold text-slate-600">
                    <div>審査手数料</div>
                    <div>電子誓約書</div>
                    <div>本人確認</div>
                    <div>国家資格証</div>
                    <div>損害保険</div>
                  </div>
                  <div className="w-[190px] shrink-0 text-right pr-2">操作・判定</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredTherapists.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      条件に一致するセラピストが見つかりませんでした
                    </div>
                  ) : (
                    filteredTherapists.map((th) => {
                      const tp = therapistProfiles[th.id];
                      const ob = onboardings[th.id];
                      const stage = getVerificationStage(tp, ob);
                      const stageMeta = STAGE_META[stage];
                      const checklist = getChecklist(tp, ob);
                      const certified = isTherapistCertified(tp);
                      const cityName = th.address ? th.address.replace('愛媛県', '').split('市')[0] + '市' : '愛媛';

                      return (
                        <div
                          key={th.id}
                          className={`px-4 py-2.5 transition flex items-center justify-between border-b border-slate-100 min-h-[54px] ${
                            stage === 'ready'
                              ? 'bg-emerald-50/60 hover:bg-emerald-50/90'
                              : stage === 'rejected'
                              ? 'bg-rose-50/40 hover:bg-rose-50/60'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* 左側: 基本情報 */}
                          <div className="w-[240px] shrink-0 flex items-center gap-2.5 min-w-0 pr-2">
                            <img
                              src={th.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(th.name)}`}
                              alt={th.name}
                              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                {th.name}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border shrink-0 ${stageMeta.badge}`}>
                                {stageMeta.label}
                              </span>
                              {certified && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-bold bg-indigo-600 text-white shrink-0">
                                  <Award className="w-2.5 h-2.5" />
                                  <span>認定</span>
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {cityName}
                              </span>
                            </div>
                          </div>

                          {/* 中央: 5つのステータス (済/未 のみ表示・幅380px固定で損害保険との被り防止) */}
                          <div className="w-[380px] shrink-0 grid grid-cols-5 text-center items-center gap-1">
                            {checklist.map((item) => {
                              const isDone = item.ok;
                              return (
                                <div key={item.key} className="flex justify-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-xs font-black inline-flex items-center justify-center min-w-[34px] ${
                                      isDone
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                                    }`}
                                    title={`${item.shortLabel}: ${isDone ? '済' : '未'}`}
                                  >
                                    {isDone ? '済' : '未'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* 右側: 審査・承認ボタン (幅190px固定で絶対に左と被らない) */}
                          <div className="w-[190px] shrink-0 flex items-center justify-end gap-1.5">
                            <Link
                              href={`/therapist/${th.id}/verification`}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap shadow-2xs ${
                                stage === 'ready'
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-500/20'
                                  : certified
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                              }`}
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>{stage === 'ready' ? '審査・承認' : '審査'}</span>
                            </Link>

                            <Link
                              href={`/therapist/${th.id}/requests`}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1 whitespace-nowrap shadow-2xs"
                              title="セラピスト画面（詳細）を開く"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>詳細</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              Step 4: 書類照合・審査承認 ＆ Storage自動削除モーダル
             ======================================================== */}
          {selectedTherapistId && (() => {
            const selUser = allUsers.find((u) => u.id === selectedTherapistId);
            const selTp = therapistProfiles[selectedTherapistId];
            const selOb = onboardings[selectedTherapistId];
            if (!selUser) return null;

            const selStage = getVerificationStage(selTp, selOb);
            const selStageMeta = STAGE_META[selStage];
            const selChecklist = getChecklist(selTp, selOb);
            const selCertified = isTherapistCertified(selTp);
            const selLogs = verificationLogs.filter((l) => l.therapist_id === selectedTherapistId);

            const handleApprove = async () => {
              setIsProcessingDecision(true);
              setVerificationFeedback(null);
              try {
                const res = await approveTherapistVerification({
                  therapistId: selectedTherapistId,
                  qualificationType: approvalQualificationType,
                  registrationNumber: approvalRegistrationNumber,
                  nameMatchConfirmed,
                  insuranceConfirmed,
                });
                setVerificationFeedback({
                  type: res.ok ? 'success' : 'error',
                  text: res.message,
                });
              } finally {
                setIsProcessingDecision(false);
              }
            };

            const handleReject = async () => {
              setIsProcessingDecision(true);
              setVerificationFeedback(null);
              try {
                const res = await rejectTherapistVerification({
                  therapistId: selectedTherapistId,
                  reason: rejectReasonInput,
                });
                setVerificationFeedback({
                  type: res.ok ? 'success' : 'error',
                  text: res.message,
                });
                if (res.ok) setRejectReasonInput('');
              } finally {
                setIsProcessingDecision(false);
              }
            };

            // デモ・検証用: 未完了のStep3書類をワンクリックでサンプル提出するヘルパー
            const handleSimulateStep3All = async () => {
              const cleanName = selUser.name.replace(/\s*\(.*?\)\s*$/, '').trim();
              await submitTermsAgreement(selectedTherapistId, cleanName, approvalQualificationType);
              // サンプルSVGからFileオブジェクトを生成して uploadVerificationDoc を呼ぶ
              const qSvgUrl = sampleDocumentDataUrl('qualification', cleanName);
              const iSvgUrl = sampleDocumentDataUrl('insurance', cleanName);
              const qRes = await fetch(qSvgUrl);
              const qBlob = await qRes.blob();
              const qFile = new File([qBlob], `${cleanName}_国家資格免許証.png`, { type: 'image/png' });
              await uploadVerificationDoc(selectedTherapistId, 'qualification', qFile);

              const iRes = await fetch(iSvgUrl);
              const iBlob = await iRes.blob();
              const iFile = new File([iBlob], `${cleanName}_賠償責任保険加入証明.pdf`, { type: 'application/pdf' });
              await uploadVerificationDoc(selectedTherapistId, 'insurance', iFile);

              setNameMatchConfirmed(true);
              setInsuranceConfirmed(true);
              setVerificationFeedback({
                type: 'success',
                text: 'Step 3（電子誓約書署名 ＋ 保有資格証 ＋ 損害賠償責任保険証票）の提出をシミュレートしました。このまま Step 4 の承認＆自動削除を実行できます。',
              });
            };

            return (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
                  {/* モーダルヘッダー */}
                  <div className="sticky top-0 z-10 bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={selUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selUser.name)}`}
                        alt={selUser.name}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-400/40"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base">{selUser.name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${selStageMeta.badge}`}>
                            {selStageMeta.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">{selUser.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTherapistId(null)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* フィードバック通知 */}
                    {verificationFeedback && (
                      <div
                        className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-2.5 ${
                          verificationFeedback.type === 'success'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        {verificationFeedback.type === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <p>{verificationFeedback.text}</p>
                        </div>
                      </div>
                    )}

                    {/* 1. 提出書類4点＋審査手数料 チェックリスト詳細 */}
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                        <span>4ステップ審査進捗 ＆ 提出書類4点の確認状況</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                        {selChecklist.map((item) => (
                          <div
                            key={item.key}
                            className={`p-3 rounded-2xl border text-xs ${
                              item.ok
                                ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                                : 'bg-amber-50/50 border-amber-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>{item.shortLabel}</span>
                              {item.ok ? (
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1 leading-snug">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 未完了ステップがある場合のクイックシミュレーションバー（動作確認用） */}
                    {!selCertified && selStage !== 'ready' && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-amber-900 block">
                              ⚡ 検証・シミュレーション操作（未完了ステップを即時進める）
                            </span>
                            <span className="text-[11px] text-amber-700">
                              セラピスト本人の画面（またはStripe Webhook）で行われる Step 1〜Step 3 の手続きをこの画面からワンクリックで再現できます。
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selTp?.payment_status !== 'completed' && (
                            <button
                              onClick={async () => {
                                const r = await completeReviewFeePayment(selectedTherapistId);
                                setVerificationFeedback({ type: 'success', text: r.message });
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>【Step 1】審査手数料(5,000円)決済完了を反映</span>
                            </button>
                          )}
                          {!selTp?.is_identity_verified && (
                            <button
                              onClick={async () => {
                                const r = await completeStripeEkyc(selectedTherapistId);
                                setVerificationFeedback({ type: r.ok ? 'success' : 'error', text: r.message });
                              }}
                              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>【Step 2】Stripe Webhook (payouts_enabled: true) 完了を反映</span>
                            </button>
                          )}
                          {(!selOb?.terms_agreed_at || !selOb?.qualification_file_path || !selOb?.insurance_file_path) && (
                            <button
                              onClick={handleSimulateStep3All}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>【Step 3】電子誓約書同意＋資格証・保険証アップロードを反映</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. Stripe Connect 認証氏名 × 資格証・保険証票画像の照合エリア */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* 左カラム: Stripe eKYC 身分証確認結果（画像非保持） */}
                      <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                            ② 身分証明書（Stripe eKYC）
                          </span>
                          <Lock className="w-4 h-4 text-sky-400" />
                        </div>

                        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5">
                          <span className="text-[10px] text-slate-400 block">Stripe Connect 認証氏名</span>
                          <div className="text-lg font-black text-emerald-400">
                            {selTp?.is_identity_verified || selCertified
                              ? selTp?.identity_verified_name || selUser.name.replace(/\s*\(.*?\)\s*$/, '')
                              : '未認証（Step 2 待ち）'}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Account: {selTp?.stripe_account_id || '未連携'}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-300">
                            payouts_enabled: {selTp?.is_identity_verified || selCertified ? 'true' : 'false'}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/70 text-[11px] text-slate-300 space-y-1">
                          <div className="font-bold text-white">① 電子誓約書（規約同意）</div>
                          {selOb?.terms_agreed_at || selCertified ? (
                            <>
                              <p className="text-emerald-300 font-bold">
                                ✓ 電子署名: {selOb?.terms_signature_name || selUser.name.replace(/\s*\(.*?\)\s*$/, '')}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                規約バージョン: {selOb?.terms_version || '2026-10-v1'}（直契約禁止・引き抜き禁止同意済）
                              </p>
                            </>
                          ) : (
                            <p className="text-amber-300">未同意</p>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          ※セキュリティ基本方針に基づき、運転免許証・マイナンバーカード等の身分証画像は自社DB・Storageへ一切保存せず、Stripe Connectの自動eKYC判定結果と認証氏名のみを取得しています。
                        </p>
                      </div>

                      {/* 中央カラム: ③ 保有資格証（PDF/画像）プレビュー */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">③ 資格証・認定証・修了証（画像/PDF）</span>
                            <span className="text-[10px] font-mono text-slate-500">{STORAGE_BUCKET}/</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            ファイル名: {selOb?.qualification_file_name || (selCertified ? '削除済み' : '未提出')}
                          </p>
                        </div>

                        {selOb?.qualification_file_path && qualPreviewUrl ? (
                          <div className="space-y-2">
                            <div className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-2xs">
                              <img
                                src={qualPreviewUrl}
                                alt="保有資格証プレビュー"
                                className="w-full h-44 object-contain bg-amber-50/30"
                              />
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold block">
                              ✓ 一時保管中（承認ボタンを押すとStorageから自動削除されます）
                            </span>
                          </div>
                        ) : selCertified || selOb?.files_purged_at ? (
                          <div className="h-44 rounded-xl bg-indigo-50/70 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center p-4 text-center">
                            <Trash2 className="w-7 h-7 text-indigo-500 mb-1.5" />
                            <span className="text-xs font-black text-indigo-950">
                              Storage（{STORAGE_BUCKET}/）から自動削除済み
                            </span>
                            <span className="text-[10px] text-indigo-700 mt-1">
                              承認完了と同時に原本ファイルは完全破棄（Delete）されました。下の承認ログにテキスト証跡のみ保持されています。
                            </span>
                          </div>
                        ) : (
                          <div className="h-44 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs">
                            資格証ファイル未提出
                          </div>
                        )}
                      </div>

                      {/* 右カラム: ④ 損害賠償責任保険の加入証明プレビュー */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">④ 損害賠償責任保険の加入証明</span>
                            <span className="text-[10px] font-mono text-slate-500">{STORAGE_BUCKET}/</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            ファイル名: {selOb?.insurance_file_name || (selCertified ? '削除済み' : '未提出')}
                          </p>
                        </div>

                        {selOb?.insurance_file_path && insPreviewUrl ? (
                          <div className="space-y-2">
                            <div className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-2xs">
                              <img
                                src={insPreviewUrl}
                                alt="賠償責任保険証明プレビュー"
                                className="w-full h-44 object-contain bg-amber-50/30"
                              />
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold block">
                              ✓ 一時保管中（承認ボタンを押すとStorageから自動削除されます）
                            </span>
                          </div>
                        ) : selCertified || selOb?.files_purged_at ? (
                          <div className="h-44 rounded-xl bg-indigo-50/70 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center p-4 text-center">
                            <Trash2 className="w-7 h-7 text-indigo-500 mb-1.5" />
                            <span className="text-xs font-black text-indigo-950">
                              Storage（{STORAGE_BUCKET}/）から自動削除済み
                            </span>
                            <span className="text-[10px] text-indigo-700 mt-1">
                              承認完了と同時に原本ファイルは完全破棄（Delete）されました。
                            </span>
                          </div>
                        ) : (
                          <div className="h-44 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs">
                            保険証票ファイル未提出
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Step 4: 運営承認フォーム（資格名・登録番号記録 ＋ 自動ファイル削除発火） */}
                    {!selCertified ? (
                      <div className="p-5 rounded-3xl bg-emerald-50/70 border-2 border-emerald-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>【Step 4】氏名照合チェック ＆ 自動データ破棄付き本登録承認</span>
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              承認ボタン押下時: ① <code className="font-mono text-emerald-800">is_certified = true</code> 更新 ＆ 専門認定バッジ付与 → ② 審査証跡テキストログ書き込み → ③ <code className="font-mono text-rose-700">{STORAGE_BUCKET}/</code> 内の提出ファイルを完全削除（Delete）します。
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              確認した資格名（qualification_type）*
                            </label>
                            <select
                              value={approvalQualificationType}
                              onChange={(e) => setApprovalQualificationType(e.target.value)}
                              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                            >
                              {QUALIFICATION_TYPES.map((q) => (
                                <option key={q} value={q}>
                                  {q}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              資格登録番号（registration_number・任意）
                            </label>
                            <input
                              type="text"
                              value={approvalRegistrationNumber}
                              onChange={(e) => setApprovalRegistrationNumber(e.target.value)}
                              placeholder="例: 第 49201 号"
                              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 pt-1">
                          <label className={`flex items-center gap-2.5 text-xs font-bold text-slate-800 ${selCertified ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
                            <input
                              type="checkbox"
                              checked={selCertified ? true : nameMatchConfirmed}
                              disabled={selCertified || isProcessingDecision}
                              onChange={(e) => !selCertified && setNameMatchConfirmed(e.target.checked)}
                              className={`w-4 h-4 accent-emerald-600 rounded ${selCertified ? 'cursor-not-allowed' : ''}`}
                            />
                            <span>
                              Stripeから連携された「認証氏名（{selTp?.identity_verified_name || selUser.name.replace(/\s*\(.*?\)\s*$/, '')}）」と「資格証画像の氏名」を照合し、一致を確認しました
                            </span>
                            {selCertified && (
                              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold ml-1 inline-flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" />
                                <span>確定ロック済</span>
                              </span>
                            )}
                          </label>

                          <label className={`flex items-center gap-2.5 text-xs font-bold text-slate-800 ${selCertified ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
                            <input
                              type="checkbox"
                              checked={selCertified ? true : insuranceConfirmed}
                              disabled={selCertified || isProcessingDecision}
                              onChange={(e) => !selCertified && setInsuranceConfirmed(e.target.checked)}
                              className={`w-4 h-4 accent-emerald-600 rounded ${selCertified ? 'cursor-not-allowed' : ''}`}
                            />
                            <span>
                              損害賠償責任保険の加入証明を確認しました（承認と同時に資格証・保険証票の原本ファイルを自動削除します）
                            </span>
                            {selCertified && (
                              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold ml-1 inline-flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" />
                                <span>確定ロック済</span>
                              </span>
                            )}
                          </label>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                          <button
                            onClick={handleApprove}
                            disabled={isProcessingDecision}
                            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>承認して本登録完了（提出ファイルをStorageから即時自動削除）</span>
                          </button>
                        </div>

                        {/* 差戻しエリア */}
                        <div className="pt-4 border-t border-emerald-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            value={rejectReasonInput}
                            onChange={(e) => setRejectReasonInput(e.target.value)}
                            placeholder="差戻す場合の理由（例: 資格証の登録番号が見切れているため再撮影してください）"
                            className="flex-1 px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-800"
                          />
                          <button
                            onClick={handleReject}
                            disabled={isProcessingDecision}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shrink-0 cursor-pointer"
                          >
                            差戻し＆一時ファイル削除
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Award className="w-8 h-8 text-indigo-600 shrink-0" />
                          <div>
                            <h4 className="text-xs font-black text-indigo-950">
                              本登録承認・専門認定済み（is_certified = true）
                            </h4>
                            <p className="text-[11px] text-indigo-800">
                              提出された資格証・保険証票ファイルは {STORAGE_BUCKET}/ バケットから自動削除済みで、以下のテキスト承認ログのみがDBに保持されています。
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. このセラピストの審査証跡（テキストログ）履歴 */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <History className="w-4 h-4 text-indigo-600" />
                        <span>このセラピストの審査証跡ログ（画像削除後も保持されるDBテキストログ）</span>
                      </h4>
                      {selLogs.length === 0 ? (
                        <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          まだ承認・差戻しログはありません（または初期シード認定セラピストです）。
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selLogs.map((l) => (
                            <div
                              key={l.id}
                              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    l.decision === 'approved'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {l.decision === 'approved' ? '承認 (approved)' : '差戻し (rejected)'}
                                </span>
                                <span className="font-bold text-slate-900">
                                  資格名: {l.qualification_type || '-'}
                                </span>
                                <span className="font-mono text-slate-700">
                                  登録番号: {l.registration_number || '-'}
                                </span>
                                <span className="text-slate-600">
                                  照合氏名: {l.confirmed_name || '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                <span>承認日時: {formatDate(l.verified_at)}</span>
                                <span className="text-rose-600 font-bold">
                                  Storage削除: {l.files_deleted_count ?? 0}件 ({l.files_deleted_at ? formatDate(l.files_deleted_at) : '即時'})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
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
                  <div key={c.id} className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name)}`}
                        alt={c.name}
                        className="w-8 h-8 rounded-xl object-cover ring-1 ring-blue-500/20 shrink-0"
                      />
                      <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{c.name}</h4>
                          <span className="text-[10px] sm:text-xs text-slate-400 font-mono truncate hidden sm:inline">{c.email}</span>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                            予約 {customerBookings.length}件
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {c.phone && (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                              📞 {c.phone}
                            </span>
                          )}
                          {c.address && (
                            <span className="inline-flex items-center gap-1 text-slate-600 text-[11px] truncate max-w-[200px] hidden md:inline">
                              📍 {c.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* この顧客として表示（右端ボタン） */}
                    <div className="shrink-0">
                      <button
                        onClick={() => {
                          switchUser(c.id);
                          router.push('/');
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer"
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

      {/* タブ: 全メッセージ監視 */}
      {activeTab === 'messages' && (() => {
        const suspiciousPattern = /(?:0\d{1,4}[-(]?\d{1,4}[-)]?\d{3,4}|line|ライン|直契約|直接取引|口座番号|個人間|メアド|メールアドレス|paypay|振込)/i;

        const filteredMessages = [...messages]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .filter((m) => {
            const sender = allUsers.find((u) => u.id === m.sender_id);
            const receiver = allUsers.find((u) => u.id === m.receiver_id);
            const isSuspicious = suspiciousPattern.test(m.content);

            if (msgFilter === 'suspicious' && !isSuspicious) return false;
            if (msgFilter === 'customer' && sender?.role !== 'customer') return false;
            if (msgFilter === 'therapist' && sender?.role !== 'therapist') return false;

            if (!msgSearch.trim()) return true;
            const q = msgSearch.toLowerCase();
            return (
              m.content.toLowerCase().includes(q) ||
              (sender?.name && sender.name.toLowerCase().includes(q)) ||
              (receiver?.name && receiver.name.toLowerCase().includes(q)) ||
              m.booking_id.toLowerCase().includes(q)
            );
          });

        return (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
            {/* ヘッダー */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                  <span>全メッセージ監視（チャット履歴・直契約監視）</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  全 {messages.length} 件中 {filteredMessages.length} 件を表示中。ユーザー名をクリックすると管理者としてその画面へジャンプします。
                </p>
              </div>
              <button
                onClick={() => refreshFromSupabase()}
                disabled={isLoadingDb}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 self-start sm:self-auto"
              >
                <span>{isLoadingDb ? '同期中...' : '最新メッセージを取得'}</span>
              </button>
            </div>

            {/* フィルターバー */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={msgSearch}
                  onChange={(e) => setMsgSearch(e.target.value)}
                  placeholder="送信者・受信者名、本文テキスト、予約IDで検索..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-500 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={msgFilter}
                  onChange={(e) => setMsgFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-emerald-500 shadow-2xs"
                >
                  <option value="all">すべてのメッセージ</option>
                  <option value="suspicious">⚠️ 連絡先検知の可能性あり</option>
                  <option value="customer">顧客からの送信のみ</option>
                  <option value="therapist">セラピストからの送信のみ</option>
                </select>
              </div>
            </div>

            {/* メッセージ一覧リスト */}
            <div className="divide-y divide-slate-100">
              {filteredMessages.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  該当するメッセージはありません。
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const sender = allUsers.find((u) => u.id === msg.sender_id);
                  const receiver = allUsers.find((u) => u.id === msg.receiver_id);
                  const booking = bookings.find((b) => b.id === msg.booking_id);
                  const service = services.find((s) => s.id === booking?.service_id);
                  const isSuspicious = suspiciousPattern.test(msg.content);

                  const renderUserPill = (user: typeof sender, label: '送信者' | '宛先') => {
                    if (!user) {
                      return <span className="text-slate-400 text-xs">不明ユーザー</span>;
                    }
                    const isTherapist = user.role === 'therapist';
                    const isCustomer = user.role === 'customer';

                    if (isTherapist) {
                      return (
                        <Link
                          href={`/therapist/${user.id}/requests`}
                          className="inline-flex items-center gap-1.5 p-1 -m-1 rounded-lg hover:bg-purple-50 group transition"
                          title="管理ポータル管理者としてセラピスト詳細画面を開く"
                        >
                          <img
                            src={user.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                            alt=""
                            className="w-6 h-6 rounded-lg object-cover ring-1 ring-purple-200 shrink-0"
                          />
                          <span className="font-bold text-slate-900 group-hover:text-purple-700 text-xs">
                            {user.name}
                          </span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">
                            セラピスト
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-purple-600" />
                        </Link>
                      );
                    }

                    if (isCustomer) {
                      return (
                        <button
                          onClick={() => {
                            switchUser(user.id);
                            router.push('/');
                          }}
                          className="inline-flex items-center gap-1.5 p-1 -m-1 rounded-lg hover:bg-emerald-50 group transition text-left cursor-pointer"
                          title="この顧客として代理ログイン表示する"
                        >
                          <img
                            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt=""
                            className="w-6 h-6 rounded-lg object-cover ring-1 ring-emerald-200 shrink-0"
                          />
                          <span className="font-bold text-slate-900 group-hover:text-emerald-700 text-xs">
                            {user.name}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                            顧客
                          </span>
                          <Users className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                        </button>
                      );
                    }

                    return (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        {user.name}（管理者）
                      </span>
                    );
                  };

                  return (
                    <div
                      key={msg.id}
                      className={`p-4 transition hover:bg-slate-50/70 ${
                        isSuspicious ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* 口コミ・レビューと同様に横一列に並べたヘッダー行 */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold">FROM:</span>
                            {renderUserPill(sender, '送信者')}
                          </div>
                          <span className="text-slate-400 font-bold">➔</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold">TO:</span>
                            {renderUserPill(receiver, '宛先')}
                          </div>

                          {booking && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                              予約: {booking.id.slice(0, 8)} ({service?.title || '施術'})
                            </span>
                          )}

                          {isSuspicious && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              連絡先検知の可能性
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-mono">
                            {new Date(msg.created_at).toLocaleString('ja-JP')}
                          </span>
                          {msg.is_read ? (
                            <span className="text-emerald-600 font-bold">既読</span>
                          ) : (
                            <span className="text-slate-400">未読</span>
                          )}
                        </div>
                      </div>

                      {/* 本文 */}
                      <div
                        className={`p-3 rounded-2xl text-xs text-slate-800 leading-relaxed border whitespace-pre-wrap ${
                          isSuspicious
                            ? 'bg-amber-50/80 border-amber-200 text-amber-950 font-medium'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* タブ 4: レビュー管理 */}
      {activeTab === 'reviews' && (() => {
        const sortedReviews = [...reviews].sort((a, b) => {
          if (reviewSort === 'date_desc') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          if (reviewSort === 'date_asc') {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          }
          if (reviewSort === 'rating_desc') {
            return b.rating - a.rating;
          }
          if (reviewSort === 'rating_asc') {
            return a.rating - b.rating;
          }
          if (reviewSort === 'customer_asc') {
            const custA = allUsers.find((u) => u.id === a.customer_id)?.name || '';
            const custB = allUsers.find((u) => u.id === b.customer_id)?.name || '';
            return custA.localeCompare(custB, 'ja');
          }
          if (reviewSort === 'therapist_asc') {
            const thA = allUsers.find((u) => u.id === a.therapist_id)?.name || '';
            const thB = allUsers.find((u) => u.id === b.therapist_id)?.name || '';
            return thA.localeCompare(thB, 'ja');
          }
          return 0;
        });

        return (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">口コミ・レビュー管理 ({reviews.length}件)</h4>
                <p className="text-xs text-slate-500">不適切なレビューの監視やソート確認を行えます。</p>
              </div>

              {/* ソートセレクター */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-500 shrink-0">並び順:</span>
                <select
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-emerald-500 cursor-pointer shadow-2xs"
                >
                  <option value="date_desc">📅 投稿日: 新しい順</option>
                  <option value="date_asc">📅 投稿日: 古い順</option>
                  <option value="rating_desc">⭐ 評価: 高い順</option>
                  <option value="rating_asc">⭐ 評価: 低い順</option>
                  <option value="customer_asc">👤 顧客名順 (五十音)</option>
                  <option value="therapist_asc">💆‍♀️ セラピスト名順 (五十音)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {sortedReviews.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  レビューはまだ投稿されていません
                </div>
              ) : (
                sortedReviews.map((rev) => {
                  const customer = allUsers.find((u) => u.id === rev.customer_id);
                  const therapist = allUsers.find((u) => u.id === rev.therapist_id);

                  return (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-start gap-4 text-xs hover:bg-slate-100/60 transition">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {customer ? (
                            <button
                              onClick={() => {
                                switchUser(customer.id);
                                router.push('/');
                              }}
                              className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-emerald-700 hover:underline cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs"
                              title="この顧客としてアプリを表示（視点切替）"
                            >
                              <Users className="w-3 h-3 text-emerald-600" />
                              <span>{customer.name} 様</span>
                            </button>
                          ) : (
                            <span className="font-bold text-slate-900">匿名顧客 様</span>
                          )}

                          <span className="text-slate-400 font-bold">➔</span>

                          {therapist ? (
                            <Link
                              href={`/therapist/${therapist.id}/requests`}
                              className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-purple-700 hover:underline bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs"
                              title="このセラピスト画面（詳細）を開く"
                            >
                              <Award className="w-3 h-3 text-purple-600" />
                              <span>{therapist.name} セラピストへ</span>
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-700">セラピストへ</span>
                          )}

                          <div className="flex items-center gap-1 text-amber-500 font-bold ml-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-xs">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed pt-0.5">{rev.comment}</p>
                        <span className="text-[10px] text-slate-400 block">{formatDate(rev.created_at)}</span>
                      </div>

                      <button
                        onClick={() => alert('このレビューを非表示・モデレーション処理しました')}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition shrink-0"
                        title="非表示・削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* タブ: アプリ名・ロゴ・ブランド設定 (独立設定対応) */}
      {activeTab === 'branding' && (
        <div className="space-y-8">
          {/* 上部ステータスカード: 採用中の組み合わせプレビュー */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5 text-emerald-600" />
                  <span>ブランド・ロゴ・アイコン 独立設定</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  「アプリアイコン（＝ファビコン）」「ブランドロゴ」「アプリ名（テキスト）」をそれぞれ選ぶだけで、選んだ組み合わせが即座にアプリ全体（ヘッダー、ブラウザタブ、トップ画面）へ採用されます。
                </p>
              </div>

              {/* 切り替え完了トースト通知 */}
              {brandSaveMessage && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold flex items-center gap-2 shadow-md animate-fadeIn shrink-0">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{brandSaveMessage}</span>
                </div>
              )}
            </div>

            {/* 現在採用されている組み合わせプレビュー（3要素を横並び表示） */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. 採用中アイコン（＝ファビコン） */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-50 border border-slate-200 flex items-center justify-center p-1">
                  {currentBrand.iconUrl ? (
                    <img
                      src={currentBrand.iconUrl}
                      alt={currentBrand.japaneseName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold block">採用中のアイコン (＝ファビコン)</span>
                  <span className="text-xs font-black text-slate-900 truncate block">
                    {AVAILABLE_ICONS.find((i) => i.url === currentBrand.iconUrl)?.label || 'カスタムアイコン'}
                  </span>
                </div>
              </div>

              {/* 2. 採用中ブランドロゴ */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
                <div className="h-10 px-2 rounded-xl overflow-hidden shrink-0 bg-slate-50 border border-slate-200 flex items-center justify-center max-w-[120px]">
                  {currentBrand.logoUrl ? (
                    <img
                      src={currentBrand.logoUrl}
                      alt="採用中ロゴ"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">テキスト表示</span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold block">採用中のロゴ</span>
                  <span className="text-xs font-black text-slate-900 truncate block">
                    {AVAILABLE_LOGOS.find((l) => l.url === currentBrand.logoUrl)?.label || 'デフォルトロゴ'}
                  </span>
                </div>
              </div>

              {/* 3. 採用中アプリ名 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 font-black text-sm">
                  Aa
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold block">採用中のアプリ名</span>
                  <strong className="text-xs font-black text-slate-900 truncate block">
                    {currentBrand.japaneseName} ({currentBrand.name})
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* 独立設定 1: アプリ名設定 */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">1</span>
                  <span>アプリ名称・キャッチコピー設定 (テキスト入力 / 候補選択)</span>
                </h5>
                <p className="text-xs text-slate-500 mt-0.5">ヘッダーやブラウザタイトルに表示されるサービス名を直接編集できます。</p>
              </div>

              {/* クイック選択候補 */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">候補から選ぶ:</span>
                {[
                  { jp: 'ケアクル', en: 'Care KURU', cp: 'プロがあなたの元へ届く。出張・店舗ヘルスケア＆ボディケア' },
                  { jp: 'ケアリアゴー', en: 'Carearia Go', cp: 'あなたの「したい」叶える場所。' },
                  { jp: 'セラリンク', en: 'Theralink', cp: '内側から輝く、本当の美しさを。' },
                  { jp: 'ケアゴー', en: 'Care Go', cp: 'その一歩が、もっとキレイな未来をつくる。' },
                  { jp: 'ケアリアゴー', en: 'Careia Go', cp: 'あなたのキレイと健康をプロの手で。' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAppJpNameInput(preset.jp);
                      setAppNameInput(preset.en);
                      setAppCatchphraseInput(preset.cp);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                      idx === 0
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-2xs'
                        : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border-slate-200/80'
                    }`}
                  >
                    {idx === 0 ? `★ ${preset.jp} (${preset.en})` : `${preset.jp} (${preset.en})`}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveAppName} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">アプリ名 (日本語)</label>
                <input
                  type="text"
                  value={appJpNameInput}
                  onChange={(e) => setAppJpNameInput(e.target.value)}
                  placeholder="例: ケアクル"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">アプリ名 (英字 / 英語)</label>
                <input
                  type="text"
                  value={appNameInput}
                  onChange={(e) => setAppNameInput(e.target.value)}
                  placeholder="例: Care KURU"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">キャッチコピー</label>
                <input
                  type="text"
                  value={appCatchphraseInput}
                  onChange={(e) => setAppCatchphraseInput(e.target.value)}
                  placeholder="例: プロがあなたの元へ届く。出張・店舗ヘルスケア＆ボディケア"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-emerald-500"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>アプリ名称を保存・反映</span>
                </button>
              </div>
            </form>
          </div>

          {/* 独立設定 2: アプリアイコン / ファビコン設定 */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-black">2</span>
                <span>アプリアイコン ＆ ファビコン設定 (独立選択)</span>
              </h5>
              <p className="text-xs text-slate-500 mt-0.5">
                ブラウザのタブアイコンやヘッダーのシンボルマークとして使用するアイコンを選択します。提供画像の赤枠ロゴからテキストをトリミングした高品質シンボルマークを選択可能です。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AVAILABLE_ICONS.map((iconItem) => {
                const isSelected = currentBrand.iconUrl === iconItem.url;

                return (
                  <div
                    key={iconItem.id}
                    onClick={() => handleSelectIcon(iconItem.url)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between text-center ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-xs overflow-hidden mb-3">
                      {iconItem.url ? (
                        <img
                          src={iconItem.url}
                          alt={iconItem.label}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: (iconItem as any).svg || '' }}
                        />
                      )}
                    </div>

                    <div className="space-y-1 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 block">
                        {iconItem.badge}
                      </span>
                      <h6 className="font-bold text-xs text-slate-900 leading-tight">
                        {iconItem.label}
                      </h6>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-black'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>適用中</span>
                        </>
                      ) : (
                        <span>このアイコンを適用</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 独立設定 3: ブランドロゴ設定 */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-black">3</span>
                <span>ヘッダー用ブランドロゴ設定 (独立選択)</span>
              </h5>
              <p className="text-xs text-slate-500 mt-0.5">ヘッダーや資料ページに掲載するロゴ画像のタイプを選択できます。</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AVAILABLE_LOGOS.map((logoItem) => {
                const isSelected = currentBrand.logoUrl === logoItem.url;

                return (
                  <div
                    key={logoItem.id}
                    onClick={() => handleSelectLogo(logoItem.url)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between text-center ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="w-full h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-xs overflow-hidden mb-3">
                      <img
                        src={logoItem.url}
                        alt={logoItem.label}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <h6 className="font-bold text-xs text-slate-900 leading-tight mb-3">
                      {logoItem.label}
                    </h6>

                    <button
                      type="button"
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-black'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>適用中</span>
                        </>
                      ) : (
                        <span>このロゴを適用</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ブランドプリセット一括切り替えカード */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h5 className="font-bold text-slate-900 text-sm">プリセットブランド一括切り替え</h5>
              <p className="text-xs text-slate-500">名称・カラー・ロゴ・アイコンをパッケージとして一括適用できます。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(['carearia_go_green', 'theralink', 'care_go_blue', 'careia_go_pink', 'carea_go', 'thera_go'] as AppBrandId[]).map((brandKey) => {
                const brand = APP_BRANDS[brandKey];
                if (!brand) return null;
                const isSelected = appBrand === brandKey;

                return (
                  <div
                    key={brandKey}
                    className={`bg-white rounded-3xl border-2 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg -translate-y-0.5'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* 上部: アイコン単体プレビュー */}
                      <div className="relative h-36 bg-gradient-to-b from-slate-50 to-slate-100/60 border-b border-slate-100 flex flex-col items-center justify-center p-3">
                        <div className="w-16 h-16 rounded-2xl shadow-md overflow-hidden bg-white p-1 border border-slate-200 flex items-center justify-center">
                          {brand.iconUrl ? (
                            <img
                              src={brand.iconUrl}
                              alt={brand.japaneseName}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              dangerouslySetInnerHTML={{ __html: brand.iconSvg }}
                            />
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-md">
                              <Check className="w-3 h-3" />
                              <span>適用中</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ブランド情報 */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-black text-base text-slate-900 tracking-tight">
                            {brand.japaneseName}
                          </h3>
                          <span
                            className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase"
                            style={{ backgroundColor: `${brand.themeColor}15`, color: brand.themeColor }}
                          >
                            {brand.tagline}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-emerald-700">
                          「{brand.catchphrase}」
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {brand.description}
                        </p>
                      </div>
                    </div>

                    {/* 下部: 適用切り替えボタン */}
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => handleSwitchBrand(brandKey)}
                        disabled={isSelected}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-500/50 cursor-default font-black'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow-md active:scale-98 cursor-pointer'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>適用中</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>「{brand.japaneseName}」を一括適用</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
