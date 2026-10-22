'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatPrice, formatDate } from '@/lib/geo';
import { Service, Booking, ServiceCategory, VerificationDocKind } from '@/types';
import { TherapistProfileEdit } from './TherapistProfileEdit';
import { BookingChatModal } from '@/components/chat/BookingChatModal';
import {
  REVIEW_FEE_YEN,
  STORAGE_BUCKET,
  QUALIFICATION_TYPES,
  TERMS_VERSION,
  TERMS_ITEMS,
  getChecklist,
  getVerificationStage,
  STAGE_META,
  isTherapistCertified,
  sampleDocumentDataUrl,
} from '@/lib/verification';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  Navigation,
  Sliders,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Home,
  Building,
  User,
  ExternalLink,
  Car,
  Star,
  MessageSquare,
  ThumbsUp,
  PenTool,
  RotateCcw,
  MessageCircle,
  Layers,
  Gift,
  Tag,
  Sparkles,
  FileText,
  Upload,
  Lock,
  Award,
  Trash2,
  ClipboardCheck,
} from 'lucide-react';

export type TherapistSection =
  | 'verification'
  | 'requests'
  | 'schedule'
  | 'campaign'
  | 'services'
  | 'reviews'
  | 'earnings'
  | 'profile';

interface TherapistViewProps {
  therapistId?: string;
  activeSection?: TherapistSection;
}

export const TherapistView: React.FC<TherapistViewProps> = ({ therapistId, activeSection }) => {
  const {
    currentUser,
    therapistProfiles,
    services,
    bookings,
    reviews,
    messages,
    updateBookingStatus,
    updateTherapistLocation,
    updateTherapistInfo,
    addService,
    allUsers,
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

  // URLで指定されたセラピストIDがあればそれを、なければcurrentUserを対象とする
  const targetUser = (therapistId ? allUsers.find((u) => u.id === therapistId) : null) || currentUser;
  const isAdminViewer = currentUser.role === 'admin';

  const therapist = therapistProfiles[targetUser.id];
  const onboarding = onboardings[targetUser.id];
  const verificationStage = getVerificationStage(therapist, onboarding);
  const stageMeta = STAGE_META[verificationStage];
  const checklist = getChecklist(therapist, onboarding);
  const isCertified = isTherapistCertified(therapist);
  const myServices = services.filter((s) => s.therapist_id === targetUser.id);
  const myBookings = bookings.filter((b) => b.therapist_id === targetUser.id);
  const myReviews = reviews.filter((r) => r.therapist_id === targetUser.id);

  // タブ管理: 未認定のセラピストは初期表示で 'verification' (4ステップ本登録・書類提出) タブを開く
  const [activeTab, setActiveTab] = useState<TherapistSection>(
    activeSection || (isCertified ? 'requests' : 'verification')
  );

  useEffect(() => {
    if (activeSection) {
      setActiveTab(activeSection);
    }
  }, [activeSection]);

  // Step 3 電子誓約書・書類アップロード用ステート
  const [checkedTerms, setCheckedTerms] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TERMS_ITEMS.map((item) => [item.id, Boolean(onboarding?.terms_agreed_at)]))
  );
  const [signatureName, setSignatureName] = useState<string>(
    onboarding?.terms_signature_name || targetUser.name.replace(/\s*\(.*?\)\s*$/, '').trim()
  );
  const [claimedQualification, setClaimedQualification] = useState<string>(
    onboarding?.claimed_qualification_type || QUALIFICATION_TYPES[0]
  );
  const [stepFeedback, setStepFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isStepBusy, setIsStepBusy] = useState<boolean>(false);

  // 管理者審査・承認用ステート（isAdminViewer時）
  const [adminQualType, setAdminQualType] = useState<string>(
    onboarding?.claimed_qualification_type || QUALIFICATION_TYPES[0]
  );
  const [adminRegNumber, setAdminRegNumber] = useState<string>('');
  const [adminNameConfirmed, setAdminNameConfirmed] = useState<boolean>(false);
  const [adminInsConfirmed, setAdminInsConfirmed] = useState<boolean>(false);
  const [adminRejectReason, setAdminRejectReason] = useState<string>('');
  const [adminDecisionMsg, setAdminDecisionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAdminDeciding, setIsAdminDeciding] = useState<boolean>(false);
  const [qualPreviewUrl, setQualPreviewUrl] = useState<string | null>(null);
  const [insPreviewUrl, setInsPreviewUrl] = useState<string | null>(null);

  // 管理者表示時に書類プレビューURLを読み込む
  useEffect(() => {
    if (isAdminViewer && onboarding) {
      if (onboarding.qualification_file_path) {
        getVerificationDocPreviewUrl(targetUser.id, 'qualification').then(setQualPreviewUrl);
      }
      if (onboarding.insurance_file_path) {
        getVerificationDocPreviewUrl(targetUser.id, 'insurance').then(setInsPreviewUrl);
      }
    }
  }, [isAdminViewer, targetUser.id, onboarding?.qualification_file_path, onboarding?.insurance_file_path, getVerificationDocPreviewUrl]);

  // チャットモーダル状態
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);

  // 特典・キャンペーン設定状態
  const [campEnabled, setCampEnabled] = useState<boolean>(Boolean(therapist?.campaign));
  const [campBadge, setCampBadge] = useState<string>(therapist?.campaign?.badge || '初回1,000円引');
  const [campTitle, setCampTitle] = useState<string>(therapist?.campaign?.title || '【初回限定】1,000円割引キャンペーン');
  const [campDesc, setCampDesc] = useState<string>(therapist?.campaign?.description || '当店を初めてご利用の方限定で、施術代金より1,000円割引いたします。');
  const [campType, setCampType] = useState<'fixed' | 'percent' | 'gift'>(therapist?.campaign?.discount_type || 'fixed');
  const [campVal, setCampVal] = useState<number>(therapist?.campaign?.discount_value ?? 1000);
  const [campValidUntil, setCampValidUntil] = useState<string>(therapist?.campaign?.valid_until || '');
  const [campSavedToast, setCampSavedToast] = useState(false);

  // スケジュール・営業時間設定状態
  const [selectedDays, setSelectedDays] = useState<string[]>(
    therapist?.available_days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  );
  const [startTime, setStartTime] = useState<string>(therapist?.available_hours_start || '09:00');
  const [endTime, setEndTime] = useState<string>(therapist?.available_hours_end || '21:00');
  const [isSeparateStoreHours, setIsSeparateStoreHours] = useState<boolean>(
    therapist?.is_separate_store_hours || false
  );
  const [storeStartTime, setStoreStartTime] = useState<string>(
    therapist?.store_hours_start || '10:00'
  );
  const [storeEndTime, setStoreEndTime] = useState<string>(
    therapist?.store_hours_end || '20:00'
  );
  const [visitRadius, setVisitRadius] = useState<number>(therapist?.visit_radius_km || 15);
  const [scheduleSavedToast, setScheduleSavedToast] = useState(false);

  // 新規メニューモーダル
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('8000');
  const [newDuration, setNewDuration] = useState('60');
  const [newCategory, setNewCategory] = useState<ServiceCategory>('physical_therapy');

  // 完了報告・電子署名ステート
  const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 予約成立後（confirmedな出張予約）のGPS位置情報・常時自動送信（手動ボタン不要で常にバックグラウンド同期）
  useEffect(() => {
    const activeVisitBookings = myBookings.filter(
      (b) => b.status === 'confirmed' && b.booking_type === 'visit'
    );
    if (activeVisitBookings.length === 0) return;

    let watchId: number | null = null;
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            activeVisitBookings.forEach((b) => {
              updateTherapistLocation(b.id, pos.coords.latitude, pos.coords.longitude);
            });
          },
          (err) => {
            console.warn('Geolocation watch error:', err);
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );
      } catch (e) {
        // ignore
      }
    }

    // 定期タイマーでも確実に現在地を更新同期（5秒ごと）
    const interval = setInterval(() => {
      activeVisitBookings.forEach((b) => {
        if (therapist?.lat && therapist?.lng) {
          const delta = (Math.random() - 0.5) * 0.0003;
          const currentLat = b.therapist_current_lat || therapist.lat;
          const currentLng = b.therapist_current_lng || therapist.lng;
          updateTherapistLocation(b.id, currentLat + delta, currentLng + delta);
        }
      });
    }, 5000);

    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(interval);
    };
  }, [myBookings, therapist, updateTherapistLocation]);

  // 売上統計の計算
  const completedBookings = myBookings.filter((b) => b.status === 'completed');
  const totalGrossEarnings = completedBookings.reduce((sum, b) => sum + b.total_amount, 0);
  const totalNetEarnings = completedBookings.reduce((sum, b) => sum + b.therapist_earnings, 0);
  const totalPlatformFees = completedBookings.reduce((sum, b) => sum + b.platform_fee, 0);
  const pendingRequests = myBookings.filter((b) => b.status === 'pending');
  const activeBookings = myBookings.filter((b) => b.status === 'confirmed');

  const daysOfWeek = [
    { id: 'mon', label: '月' },
    { id: 'tue', label: '火' },
    { id: 'wed', label: '水' },
    { id: 'thu', label: '木' },
    { id: 'fri', label: '金' },
    { id: 'sat', label: '土' },
    { id: 'sun', label: '日' },
  ];

  const toggleDay = (id: string) => {
    if (selectedDays.includes(id)) {
      setSelectedDays(selectedDays.filter((d) => d !== id));
    } else {
      setSelectedDays([...selectedDays, id]);
    }
  };

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addService({
      therapist_id: currentUser.id,
      title: newTitle,
      description: newDescription,
      price: parseInt(newPrice, 10),
      duration_minutes: parseInt(newDuration, 10),
      category: newCategory,
      is_active: true,
    });

    setIsAddServiceOpen(false);
    setNewTitle('');
    setNewDescription('');
    alert('新しいメニューを公開しました');
  };

  const handleSaveCampaign = async () => {
    await updateTherapistInfo(
      targetUser.id,
      {},
      {
        campaign: campEnabled
          ? {
              badge: campBadge.trim() || '特典あり',
              title: campTitle.trim() || campBadge.trim(),
              description: campDesc.trim(),
              valid_until: campValidUntil || undefined,
              discount_type: campType,
              discount_value: Number(campVal) || 0,
            }
          : undefined,
      }
    );
    setCampSavedToast(true);
    setTimeout(() => setCampSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 管理者閲覧モードバナー ＆ 管理ページに戻るボタン */}
      {isAdminViewer && (
        <div className="bg-purple-950 text-white px-5 py-3.5 rounded-2xl shadow-lg border border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-bold bg-purple-700 px-2.5 py-0.5 rounded text-xs">
              👑 管理者審査・閲覧モード
            </span>
            <span className="text-xs text-purple-200">
              セラピスト <strong>{targetUser.name}</strong>（ID: <code className="text-purple-300 font-mono text-[11px]">{targetUser.id}</code>）の画面を代理表示・審査中
            </span>
          </div>

          <Link
            href="/admin/therapists"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-purple-950 hover:bg-purple-100 text-xs font-black transition shadow-sm self-start sm:self-auto shrink-0"
          >
            <span>← 管理ページ（セラピスト審査・管理）に戻る</span>
          </Link>
        </div>
      )}

      {/* セラピストステータスバナー */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={targetUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetUser.name)}`}
            alt={targetUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-400/30 shrink-0"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold">{targetUser.name} セラピスト</h2>
              {isCertified ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>本登録・専門認定済パートナー</span>
                </span>
              ) : (
                <Link
                  href={`/therapist/${targetUser.id}/verification`}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs"
                >
                  <ClipboardCheck className="w-3 h-3" />
                  <span>本登録審査: {stageMeta.label}（手続きへ）</span>
                </Link>
              )}
              {therapist?.is_store_based && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-400/30 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  <span>店舗あり</span>
                </span>
              )}
              {therapist?.is_visit_based && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  <span>出張対応</span>
                </span>
              )}
              {therapist?.campaign && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-rose-500 to-amber-500 text-white flex items-center gap-1 shadow-xs">
                  <Gift className="w-3 h-3" />
                  <span>特典掲載中: {therapist.campaign.badge}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200 mt-1 line-clamp-1 max-w-md">
              {therapist?.store_name ? `【店舗】${therapist.store_name} • ` : ''}
              {therapist?.bio || 'プロフィール設定中'}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-emerald-100">
              <span>★ 評価 {therapist?.rating_avg || '5.0'} ({therapist?.reviews_count || 0}件)</span>
              {therapist?.is_visit_based && (
                <>
                  <span>•</span>
                  <span>出張対応半径: {visitRadius}km</span>
                </>
              )}
              {therapist?.is_store_based && therapist?.store_address && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-teal-200">
                    <Building className="w-3.5 h-3.5" />
                    <span>店舗住所: {therapist.store_address}</span>
                  </span>
                </>
              )}
              <span>•</span>
              <Link
                href={`/therapist/${targetUser.id}/campaign`}
                className="text-[11px] underline underline-offset-2 text-amber-200 hover:text-white flex items-center gap-1 font-bold"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{therapist?.campaign ? '特典を変更する' : '特典・キャンペーンを追加する'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stripe Express 連携状態 */}
        <div className="bg-emerald-950/40 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 text-right w-full md:w-auto">
          <div className="flex items-center gap-2 justify-end text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Stripe Connect Express 連携済</span>
          </div>
          <div className="mt-1">
            <span className="text-[10px] text-emerald-200 block">振込可能残高</span>
            <span className="text-2xl font-black text-white">{formatPrice(totalNetEarnings)}</span>
          </div>
        </div>
      </div>

      {/* ナビゲーションタブ（各メニュー独立URL対応） */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 border-b border-slate-200 pb-3">
        <Link
          href={`/therapist/${targetUser.id}/requests`}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-2xs ${
            activeTab === 'requests'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>予約リクエスト・進行中</span>
          {pendingRequests.length > 0 && (
            <span className="w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </Link>

        <Link
          href={`/therapist/${targetUser.id}/schedule`}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-2xs ${
            activeTab === 'schedule'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>営業時間・シフト・出張設定</span>
        </Link>

        <Link
          href={`/therapist/${targetUser.id}/campaign`}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-2xs ${
            activeTab === 'campaign'
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Gift className={`w-4 h-4 ${activeTab === 'campaign' ? 'text-white' : 'text-rose-500'}`} />
          <span>特典・キャンペーン設定</span>
          {therapist?.campaign ? (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">
              掲載中
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
          )}
        </Link>

        <Link
          href={`/therapist/${targetUser.id}/services`}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-2xs ${
            activeTab === 'services'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>施術メニュー管理 ({myServices.length})</span>
        </Link>

        <Link
          href={`/therapist/${targetUser.id}/reviews`}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-2xs ${
            activeTab === 'reviews'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>お客様の評価・口コミ ({myReviews.length})</span>
        </Link>

        <Link
          href={`/therapist/${targetUser.id}/earnings`}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-2xs ${
            activeTab === 'earnings'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>売上・振込明細</span>
        </Link>

        <Link
          href={`/therapist/${targetUser.id}/profile`}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-2xs ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4 text-teal-500" />
          <span>👤 プロフィール & 店舗情報編集</span>
        </Link>

        <Link
          href={`/therapist/${targetUser.id}/verification`}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-2xs ${
            activeTab === 'verification'
              ? 'bg-indigo-700 text-white shadow-md'
              : !isCertified
              ? 'bg-amber-50 text-amber-900 border-2 border-amber-400 hover:bg-amber-100'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>📋 4ステップ本登録・資格証/保険証提出</span>
          <span
            className={`px-2 py-0.2 rounded-full text-[9px] font-black border ${stageMeta.badge}`}
          >
            {stageMeta.label}
          </span>
        </Link>
      </div>

      {/* タブ 0: 4ステップ本登録・審査手続きウィザード */}
      {activeTab === 'verification' && (() => {
        const feePaid = isCertified || therapist?.payment_status === 'completed';
        const ekycDone = isCertified || Boolean(therapist?.is_identity_verified);
        const termsDone = isCertified || Boolean(onboarding?.terms_agreed_at);
        const qualDone = isCertified || Boolean(onboarding?.qualification_file_path);
        const insDone = isCertified || Boolean(onboarding?.insurance_file_path);
        const allTermsChecked = TERMS_ITEMS.every((item) => Boolean(checkedTerms[item.id]));
        const myLogs = verificationLogs.filter((l) => l.therapist_id === targetUser.id);

        const handleDocUploadChange = async (kind: VerificationDocKind, e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setIsStepBusy(true);
          setStepFeedback(null);
          try {
            const res = await uploadVerificationDoc(targetUser.id, kind, file);
            setStepFeedback({ type: res.ok ? 'success' : 'error', text: res.message });
          } finally {
            setIsStepBusy(false);
            e.target.value = '';
          }
        };

        const handleSampleDocUpload = async (kind: VerificationDocKind) => {
          setIsStepBusy(true);
          setStepFeedback(null);
          try {
            const cleanName = targetUser.name.replace(/\s*\(.*?\)\s*$/, '').trim();
            const svgUrl = sampleDocumentDataUrl(kind, cleanName);
            const r = await fetch(svgUrl);
            const blob = await r.blob();
            const ext = kind === 'qualification' ? 'png' : 'pdf';
            const mime = kind === 'qualification' ? 'image/png' : 'application/pdf';
            const sampleFile = new File(
              [blob],
              `${cleanName}_${kind === 'qualification' ? '国家資格免許証' : '損害賠償責任保険証明'}_サンプル.${ext}`,
              { type: mime }
            );
            const res = await uploadVerificationDoc(targetUser.id, kind, sampleFile);
            setStepFeedback({ type: res.ok ? 'success' : 'error', text: res.message });
          } finally {
            setIsStepBusy(false);
          }
        };

        return (
          <div className="space-y-6">
            {/* 全体ステータス＆基本方針説明カード */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${stageMeta.badge}`}>
                      現在の審査ステージ: {stageMeta.label}
                    </span>
                    {isCertified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                        <Award className="w-3.5 h-3.5" />
                        <span>専門認定バッジ付与済</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1.5">
                    セラピスト登録・審査の4ステップフロー
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    運転免許証等の身分証明書画像は自社DBには一切保存せず Stripe Connect の自動eKYCに完全委託しています。また、提出された資格証・保険証票ファイルは運営の承認完了と同時に Supabase Storage（{STORAGE_BUCKET}/）から自動削除されます。
                  </p>
                </div>
              </div>

              {onboarding?.rejection_reason && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-bold flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block">運営本部からの差戻し理由:</span>
                    <p className="mt-0.5">{onboarding.rejection_reason}</p>
                    <span className="text-[11px] text-rose-700 font-normal block mt-1">
                      ※前回提出された一時ファイルはセキュリティ保護のため自動削除されています。Step 3 より再アップロードしてください。
                    </span>
                  </div>
                </div>
              )}

              {stepFeedback && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
                    stepFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{stepFeedback.text}</span>
                </div>
              )}

              {/* 5項目サマリー */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
                {checklist.map((item) => (
                  <div
                    key={item.key}
                    className={`p-3 rounded-2xl border text-xs ${
                      item.ok
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{item.shortLabel}</span>
                      {item.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">未完了</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 【Step 1】アカウント仮作成 ＆ 審査手数料（覚悟料 5,000円）の決済 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      【Step 1】アカウント開設 ＆ 審査手数料（覚悟料）の決済
                    </h4>
                    <p className="text-xs text-slate-500">
                      審査手数料（{REVIEW_FEE_YEN.toLocaleString()}円 / 返金不可）を Stripe 決済すると Step 2 へ進めます。
                    </p>
                  </div>
                </div>
                {feePaid ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ 決済完了 (payment_status: completed)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    未決済
                  </span>
                )}
              </div>

              {!feePaid && (
                <button
                  disabled={isStepBusy}
                  onClick={async () => {
                    setIsStepBusy(true);
                    try {
                      const res = await completeReviewFeePayment(targetUser.id);
                      if (res.redirectUrl) {
                        window.location.href = res.redirectUrl;
                        return;
                      }
                      setStepFeedback({ type: res.ok ? 'success' : 'error', text: res.message });
                    } finally {
                      setIsStepBusy(false);
                    }
                  }}
                  className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Stripe で審査手数料（{REVIEW_FEE_YEN.toLocaleString()}円）を決済する</span>
                </button>
              )}
            </div>

            {/* 【Step 2】Stripe Connect による口座登録 ＆ 自動eKYC（身元確認） */}
            <div className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 ${!feePaid ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      【Step 2】Stripe Connect による口座登録 ＆ 自動eKYC（身元確認）
                    </h4>
                    <p className="text-xs text-slate-500">
                      Stripe Express オンボーディング画面にて振込口座情報および運転免許証等＋顔撮影を行います（免許証画像は自社DBに一切保存されません）。
                    </p>
                  </div>
                </div>
                {ekycDone ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ eKYC本人確認済（認証氏名: {therapist?.identity_verified_name || targetUser.name.replace(/\s*\(.*?\)\s*$/, '')}）
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    未完了
                  </span>
                )}
              </div>

              {!ekycDone && (
                <button
                  disabled={!feePaid || isStepBusy}
                  onClick={async () => {
                    setIsStepBusy(true);
                    try {
                      const res = await completeStripeEkyc(targetUser.id);
                      if (res.redirectUrl) {
                        window.location.href = res.redirectUrl;
                        return;
                      }
                      setStepFeedback({ type: res.ok ? 'success' : 'error', text: res.message });
                    } finally {
                      setIsStepBusy(false);
                    }
                  }}
                  className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Stripe Express で口座登録＆自動eKYC（本人確認）を行う</span>
                </button>
              )}
            </div>

            {/* 【Step 3】電子誓約書同意 ＋ 資格証・保険証票のアップロード */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      【Step 3】電子誓約書同意 ＋ 保有資格証・損害賠償責任保険証票のアップロード
                    </h4>
                    <p className="text-xs text-slate-500">
                      ファイルは一時保管バケット（<code className="font-mono text-indigo-700">{STORAGE_BUCKET}/</code>）へ暗号化アップロードされ、Step 4 の運営承認完了と同時に自動削除されます。
                    </p>
                  </div>
                </div>
                {termsDone && qualDone && insDone ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ Step 3 すべて提出済
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    提出手続き中
                  </span>
                )}
              </div>

              {/* 3-A: 電子誓約書 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">① 電子誓約書（利用規約・直契約禁止・引き抜き禁止等への同意）</span>
                  <span className="text-[11px] font-mono text-slate-400">Ver: {TERMS_VERSION}</span>
                </div>

                <div className="space-y-2">
                  {TERMS_ITEMS.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(checkedTerms[item.id]) || termsDone}
                        onChange={(e) =>
                          setCheckedTerms((prev) => ({ ...prev, [item.id]: e.target.checked }))
                        }
                        className="w-4 h-4 accent-emerald-600 mt-0.5 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-900">{item.title}: </span>
                        <span className="text-slate-600">{item.body}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">申請する保有資格種別</label>
                    <select
                      value={claimedQualification}
                      onChange={(e) => setClaimedQualification(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      {QUALIFICATION_TYPES.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">電子署名（本名フルネーム）</label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="例: 橋本 沙織"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      disabled={(!allTermsChecked && !termsDone) || isStepBusy}
                      onClick={async () => {
                        setIsStepBusy(true);
                        try {
                          const res = await submitTermsAgreement(targetUser.id, signatureName, claimedQualification);
                          setStepFeedback({ type: res.ok ? 'success' : 'error', text: res.message });
                        } finally {
                          setIsStepBusy(false);
                        }
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-xs font-bold transition cursor-pointer"
                    >
                      {termsDone ? '電子署名を更新する' : '誓約事項に同意して電子署名する'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3-B: 資格証 & 保険証票アップロード */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 保有資格証 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">③ 保有資格証（国家資格免状 PDF/画像）</span>
                    {qualDone ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {isCertified ? '確認＆自動削除済' : '提出済'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        未提出
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {isCertified
                      ? '運営承認完了に伴い、一時保管バケットから完全削除されました。'
                      : onboarding?.qualification_file_name
                      ? `提出ファイル: ${onboarding.qualification_file_name}`
                      : 'PT/OT/ST/助産師等の免状画像またはPDF（10MB以下）を選択してください。'}
                  </p>
                  {!isCertified && (
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>ファイルを選択して提出</span>
                        <input
                          type="file"
                          accept=".pdf,image/jpeg,image/png,image/webp"
                          onChange={(e) => handleDocUploadChange('qualification', e)}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSampleDocUpload('qualification')}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        サンプル免状画像を提出
                      </button>
                    </div>
                  )}
                </div>

                {/* 損害賠償責任保険の加入証明 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">④ 損害賠償責任保険の加入証明（PDF/画像）</span>
                    {insDone ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {isCertified ? '確認＆自動削除済' : '提出済'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        未提出
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {isCertified
                      ? '運営承認完了に伴い、一時保管バケットから完全削除されました。'
                      : onboarding?.insurance_file_name
                      ? `提出ファイル: ${onboarding.insurance_file_name}`
                      : '賠償責任保険の加入者証・保険証券（PDF/画像）を選択してください。'}
                  </p>
                  {!isCertified && (
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>ファイルを選択して提出</span>
                        <input
                          type="file"
                          accept=".pdf,image/jpeg,image/png,image/webp"
                          onChange={(e) => handleDocUploadChange('insurance', e)}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSampleDocUpload('insurance')}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        サンプル保険証票を提出
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 【Step 4】運営管理画面でのチェック ＆ 自動データ破棄承認 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                    4
                  </span>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      【Step 4】運営管理画面での簡易チェック ＆ 自動データ削除付き本登録承認
                    </h4>
                    <p className="text-xs text-slate-500">
                      運営本部にて Stripe 認証氏名と資格証氏名を照合後、本登録承認と同時に提出ファイルは Storage から完全自動削除されます。
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stageMeta.badge}`}>
                  {stageMeta.label}
                </span>
              </div>

              {/* 管理者として表示している場合: 承認・差戻し操作パネル */}
              {isAdminViewer ? (
                <div className="pt-2 border-t border-slate-200 space-y-4">
                  <div className="bg-indigo-950 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-xs text-emerald-300">
                          運営管理者専用 審査・判定コントロールパネル
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        「承認」をクリックすると即座に <code className="text-emerald-300 font-mono">{STORAGE_BUCKET}/</code> 内の提出ファイルが完全削除され、DBにテキスト監査ログ（承認日時・管理者ID・資格名・番号）のみが記録されます。
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] bg-indigo-900 px-2.5 py-1 rounded-lg border border-indigo-700">
                        対象: <strong>{targetUser.name}</strong>
                      </span>
                    </div>
                  </div>

                  {adminDecisionMsg && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                        adminDecisionMsg.type === 'success'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{adminDecisionMsg.text}</span>
                    </div>
                  )}

                  {/* 提出書類 ＆ 照合情報カード */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 資格証プレビュー＆照合 */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">
                          国家資格免状（申請: {onboarding?.claimed_qualification_type || '未指定'}）
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {onboarding?.qualification_file_name || 'ファイル未提出'}
                        </span>
                      </div>

                      {qualPreviewUrl ? (
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <img
                            src={qualPreviewUrl}
                            alt="資格証プレビュー"
                            className="w-full max-h-48 object-contain bg-slate-100"
                          />
                          <div className="p-2 text-right bg-slate-50 border-t border-slate-200">
                            <a
                              href={qualPreviewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-indigo-600 hover:underline font-bold inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>別タブで原寸大表示</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                          {isCertified
                            ? '✓ 承認完了に伴い原本画像はStorageから自動削除されました'
                            : '資格証ファイルがまだ提出されていません'}
                        </div>
                      )}
                    </div>

                    {/* 賠償責任保険プレビュー＆照合 */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">損害賠償責任保険 加入証明</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {onboarding?.insurance_file_name || 'ファイル未提出'}
                        </span>
                      </div>

                      {insPreviewUrl ? (
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <img
                            src={insPreviewUrl}
                            alt="保険証プレビュー"
                            className="w-full max-h-48 object-contain bg-slate-100"
                          />
                          <div className="p-2 text-right bg-slate-50 border-t border-slate-200">
                            <a
                              href={insPreviewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-indigo-600 hover:underline font-bold inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>別タブで原寸大表示</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                          {isCertified
                            ? '✓ 承認完了に伴い原本画像はStorageから自動削除されました'
                            : '保険証券ファイルがまだ提出されていません'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 照合氏名と署名の突き合わせ */}
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] text-indigo-900 font-bold block">Stripe eKYC 認証氏名</span>
                        <span className="font-black text-slate-900 text-sm">
                          {therapist?.identity_verified_name || targetUser.name.replace(/\s*\(.*?\)\s*$/, '')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-900 font-bold block">電子誓約書 署名氏名</span>
                        <span className="font-bold text-slate-800">
                          {onboarding?.terms_signature_name || '未署名'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-900 font-bold block">誓約同意日時</span>
                        <span className="font-mono text-slate-700">
                          {onboarding?.terms_agreed_at ? formatDate(onboarding.terms_agreed_at) : '未同意'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-1.5 border-t border-indigo-200/60">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={adminNameConfirmed}
                          onChange={(e) => setAdminNameConfirmed(e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 rounded"
                        />
                        <span>【照合確認①】Stripe本人確認氏名と資格証原本の氏名が完全に一致していることを確認しました</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={adminInsConfirmed}
                          onChange={(e) => setAdminInsConfirmed(e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 rounded"
                        />
                        <span>【照合確認②】損害賠償責任保険が有効期限内かつ本人名義であることを確認しました</span>
                      </label>
                    </div>
                  </div>

                  {/* 認定資格種別 ＆ 登録番号入力 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        認定する国家資格種別
                      </label>
                      <select
                        value={adminQualType}
                        onChange={(e) => setAdminQualType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        {QUALIFICATION_TYPES.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        資格登録番号 / 免状番号（証跡ログに記録）
                      </label>
                      <input
                        type="text"
                        value={adminRegNumber}
                        onChange={(e) => setAdminRegNumber(e.target.value)}
                        placeholder="例: 第123456号"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* アクションボタン群 */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      disabled={isAdminDeciding || !adminNameConfirmed || !adminInsConfirmed}
                      onClick={async () => {
                        if (!confirm(`セラピスト「${targetUser.name}」の本登録を承認しますか？\n（承認と同時に一時保管ファイルは完全自動削除されます）`)) {
                          return;
                        }
                        setIsAdminDeciding(true);
                        setAdminDecisionMsg(null);
                        try {
                          const res = await approveTherapistVerification({
                            therapistId: targetUser.id,
                            qualificationType: adminQualType,
                            registrationNumber: adminRegNumber,
                            nameMatchConfirmed: adminNameConfirmed,
                            insuranceConfirmed: adminInsConfirmed,
                          });
                          setAdminDecisionMsg({
                            type: res.ok ? 'success' : 'error',
                            text: res.message,
                          });
                          if (res.ok) {
                            setQualPreviewUrl(null);
                            setInsPreviewUrl(null);
                          }
                        } finally {
                          setIsAdminDeciding(false);
                        }
                      }}
                      className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-emerald-200" />
                      <span>{isCertified ? '資格情報を更新承認する' : '本登録を承認する（ファイル完全自動削除）'}</span>
                    </button>

                    {/* 差戻し操作 */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={adminRejectReason}
                        onChange={(e) => setAdminRejectReason(e.target.value)}
                        placeholder="差戻し理由（例: 保険証が不鮮明）..."
                        className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 w-56"
                      />
                      <button
                        disabled={isAdminDeciding || !adminRejectReason.trim()}
                        onClick={async () => {
                          if (!confirm(`差戻しを実行しますか？\n（不備のある提出ファイルはStorageから自動削除され、再提出要請されます）`)) {
                            return;
                          }
                          setIsAdminDeciding(true);
                          setAdminDecisionMsg(null);
                          try {
                            const res = await rejectTherapistVerification({
                              therapistId: targetUser.id,
                              reason: adminRejectReason,
                            });
                            setAdminDecisionMsg({
                              type: res.ok ? 'success' : 'error',
                              text: res.message,
                            });
                            if (res.ok) {
                              setAdminRejectReason('');
                              setQualPreviewUrl(null);
                              setInsPreviewUrl(null);
                            }
                          } finally {
                            setIsAdminDeciding(false);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        差戻し実行
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* セラピスト本人の画面表示時: ステータス説明のみ（承認ボタンはなし） */
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                  {isCertified ? (
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        ✓ 運営本部による審査が完了し、本登録および専門認定バッジが付与されました。規定に従い、免状原本ファイルは安全に破棄されました。
                      </span>
                    </div>
                  ) : verificationStage === 'ready' ? (
                    <div className="flex items-center gap-2 text-amber-800 font-bold">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        4点の手続き・提出が完了しました。現在、運営本部にて照合審査を行っています。承認まで今しばらくお待ちください。
                      </span>
                    </div>
                  ) : (
                    <p className="text-slate-500">
                      Step 1〜3 の手続き（決済・eKYC・誓約書・免状アップロード）が完了すると、自動的に運営本部へ審査依頼が送信されます。
                    </p>
                  )}
                </div>
              )}

              {/* 過去の審査ログ */}
              {myLogs.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 block">審査証跡テキスト記録</span>
                  {myLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {log.decision === 'approved' ? '✓ 承認完了' : '差戻し'}
                        </span>
                        {log.qualification_type && (
                          <span className="text-indigo-700 font-bold">
                            確認資格: {log.qualification_type} ({log.registration_number || '確認済'})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        日時: {formatDate(log.verified_at)} / 一時ファイル {log.files_deleted_count ?? 2}件 自動削除済
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* タブ 1: 予約リクエスト・進行中 */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* 未承認リクエスト (Pending) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>新規予約リクエスト（承認・辞退の対応が必要です）</span>
              </h3>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {pendingRequests.length}件の未対応
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                現在、対応待ちの新規リクエストはありません。
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((b) => {
                  const customer = allUsers.find((u) => u.id === b.customer_id);
                  const service = services.find((s) => s.id === b.service_id);

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={customer?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={customer?.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{customer?.name} 様</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {b.booking_type === 'visit' ? '出張訪問' : '店舗ご来店'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{service?.title}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                            <span className="font-bold text-emerald-700">{formatDate(b.scheduled_at)}</span>
                            <span>•</span>
                            <span>手取り報酬: <strong className="text-slate-900">{formatPrice(b.therapist_earnings)}</strong></span>
                            <span className="text-[10px] text-slate-400">(総額 {formatPrice(b.total_amount)})</span>
                          </div>
                          {b.booking_type === 'visit' && (
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              出張先: {b.visit_address}
                            </p>
                          )}
                          {b.customer_notes && (
                            <p className="text-[11px] bg-slate-50 p-2 rounded-xl text-slate-600 mt-2 border border-slate-100">
                              💬 顧客からの要望: {b.customer_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end border-t md:border-t-0 pt-3 md:pt-0">
                        {/* メッセージボタン */}
                        <button
                          onClick={() => setChatBooking(b)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs relative"
                          title="お客様とメッセージで連絡"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>メッセージ</span>
                          {messages.some((m) => m.booking_id === b.id && m.receiver_id === currentUser.id && !m.is_read) && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('このリクエストを辞退しますか？')) {
                              updateBookingStatus(b.id, 'cancelled');
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5 text-rose-500" />
                          <span>辞退</span>
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, 'confirmed')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>承認</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 進行中・確定済みの予約 (Confirmed) */}
          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>進行中・確定済みの予約 ({activeBookings.length}件)</span>
            </h3>

            {activeBookings.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                現在、進行中の確定予約はありません。
              </div>
            ) : (
              <div className="space-y-3">
                {activeBookings.map((b) => {
                  const customer = allUsers.find((u) => u.id === b.customer_id);
                  const service = services.find((s) => s.id === b.service_id);

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={customer?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={customer?.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-400 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{customer?.name} 様</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              確定済み
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {b.booking_type === 'visit' ? '出張' : '店舗'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{service?.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="font-bold text-emerald-700">{formatDate(b.scheduled_at)}</span>
                            <span>•</span>
                            <span>報酬: {formatPrice(b.therapist_earnings)}</span>
                          </div>
                          {b.booking_type === 'visit' && (
                            <p className="text-[11px] text-slate-500 mt-1">
                              訪問先: {b.visit_address}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end border-t md:border-t-0 pt-3 md:pt-0">
                        {/* メッセージボタン */}
                        <button
                          onClick={() => setChatBooking(b)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs relative"
                          title="お客様とメッセージで連絡"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>メッセージ</span>
                          {messages.some((m) => m.booking_id === b.id && m.receiver_id === currentUser.id && !m.is_read) && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          )}
                        </button>

                        {/* 出張時の常時GPS自動同期インジケーター */}
                        {b.booking_type === 'visit' && (
                          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                            <span>GPS常時自動送信中</span>
                          </div>
                        )}

                        {/* 施術完了報告ボタン (お客様サイン・確認モーダルを開く) */}
                        <button
                          onClick={() => {
                            setCompletingBooking(b);
                            setHasSignature(false);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>施術完了を報告 (顧客確認・サイン)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* タブ 2: 営業時間・シフト・出張エリア設定 */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-3xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>稼働シフト・営業時間 & 出張エリア設定</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              顧客が予約できる受付曜日・時間帯を設定します。出張訪問と店舗来店は1画面で共通または個別に管理できます。
            </p>
          </div>

          {/* 曜日選択 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                受付可能曜日（稼働日） <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                選択されていない曜日は「定休日」として自動登録されます
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((d) => {
                const isSelected = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`w-11 h-11 rounded-2xl text-xs font-black transition flex flex-col items-center justify-center gap-0.5 shadow-2xs ${
                      isSelected
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-600/30'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <span>{d.label}</span>
                    <span className="text-[9px] font-normal opacity-80">
                      {isSelected ? '営業' : '休'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 出張・店舗の時間設定モード切替 */}
          {therapist?.is_store_based && therapist?.is_visit_based && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  出張・店舗の受付時間の一括管理
                </span>
                <span className="text-[11px] text-slate-500">
                  {isSeparateStoreHours
                    ? '出張施術と店舗施術で別々の時間帯を設定します'
                    : '出張施術と店舗施術で同じ受付時間帯を使用します（推奨・自動連動）'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSeparateStoreHours}
                  onChange={(e) => setIsSeparateStoreHours(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          )}

          {/* 時間帯設定 */}
          {!isSeparateStoreHours ? (
            /* 共通時間帯設定 (通常モード) */
            <div className="space-y-2 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>基本の受付・営業時間（出張・店舗 共通）</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  共通連動中
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">開始時刻</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">終了時刻</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 個別時間帯設定 (詳細モード: 出張 vs 店舗 を1画面で比較設定) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              {/* 出張の受付枠 */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Home className="w-4 h-4 text-emerald-600" />
                  <span>出張施術の受付時間</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">開始時刻</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">終了時刻</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 店舗の営業時間 */}
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                  <Building className="w-4 h-4 text-teal-700" />
                  <span>店舗サロンの営業時間</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">開店時刻</label>
                    <input
                      type="time"
                      value={storeStartTime}
                      onChange={(e) => setStoreStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">閉店時刻</label>
                    <input
                      type="time"
                      value={storeEndTime}
                      onChange={(e) => setStoreEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 自動反映プレビュー */}
          {therapist?.is_store_based && (
            <div className="p-3.5 bg-slate-100 rounded-2xl text-xs text-slate-600 flex items-start gap-2">
              <Building className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">
                  店舗・サロン情報の「営業時間・定休日」へ自動連動します
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  表示プレビュー: 【
                  {selectedDays.map((d) => daysOfWeek.find((x) => x.id === d)?.label).join('・')}曜{' '}
                  {!isSeparateStoreHours ? `${startTime} 〜 ${endTime}` : `${storeStartTime} 〜 ${storeEndTime}`}{' '}
                  (
                  {daysOfWeek.filter((d) => !selectedDays.includes(d.id)).length > 0
                    ? `${daysOfWeek.filter((d) => !selectedDays.includes(d.id)).map((d) => d.label).join('・')}曜定休`
                    : '無休'}
                  )】
                </span>
              </div>
            </div>
          )}

          {/* 出張可能エリア (半径スライダー) */}
          {therapist?.is_visit_based && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-emerald-600" />
                  <span>出張訪問可能エリア（半径）</span>
                </label>
                <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  拠点から {visitRadius} km
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={visitRadius}
                onChange={(e) => setVisitRadius(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>3km (近隣のみ)</span>
                <span>15km (松山市中心部・今治等)</span>
                <span>30km (広域対応)</span>
              </div>
            </div>
          )}

          {/* 保存ボタン */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {scheduleSavedToast && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>シフト・営業時間設定を保存しました（店舗情報にも連動反映済）</span>
              </span>
            )}
            <button
              type="button"
              onClick={async () => {
                const dayLabelsMap: Record<string, string> = {
                  mon: '月',
                  tue: '火',
                  wed: '水',
                  thu: '木',
                  fri: '金',
                  sat: '土',
                  sun: '日',
                };
                const openDaysStr = selectedDays.map((id) => dayLabelsMap[id]).join('・');
                const closedDayIds = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].filter(
                  (id) => !selectedDays.includes(id)
                );
                const closedDaysStr = closedDayIds.length > 0
                  ? `${closedDayIds.map((id) => dayLabelsMap[id]).join('・')}曜定休`
                  : '無休';

                const effectiveStoreStart = isSeparateStoreHours ? storeStartTime : startTime;
                const effectiveStoreEnd = isSeparateStoreHours ? storeEndTime : endTime;
                const autoStoreHours = `${openDaysStr} ${effectiveStoreStart} 〜 ${effectiveStoreEnd} (${closedDaysStr})`;

                await updateTherapistInfo(
                  targetUser.id,
                  {},
                  {
                    available_days: selectedDays,
                    available_hours_start: startTime,
                    available_hours_end: endTime,
                    is_separate_store_hours: isSeparateStoreHours,
                    store_hours_start: storeStartTime,
                    store_hours_end: storeEndTime,
                    store_hours: autoStoreHours,
                    visit_radius_km: visitRadius,
                  }
                );

                setScheduleSavedToast(true);
                setTimeout(() => setScheduleSavedToast(false), 3500);
              }}
              className="ml-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
            >
              スケジュール・営業時間を保存
            </button>
          </div>
        </div>
      )}

      {/* タブ: 特典・キャンペーン設定 */}
      {activeTab === 'campaign' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>特典・キャンペーン設定</span>
                  <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">
                    集客・成約率UP
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  お客様のトップ検索画面で「🎁 特典・キャンペーン」絞り込みにヒットし、目立つバッジが表示されます。
                </p>
              </div>
            </div>

            {/* トグルスイッチ */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={campEnabled}
                onChange={(e) => setCampEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              <span className="ml-3 text-xs font-bold text-slate-800">
                {campEnabled ? 'キャンペーン掲載中' : 'キャンペーン停止中'}
              </span>
            </label>
          </div>

          {campEnabled ? (
            <div className="space-y-5">
              {/* かんたんプリセット */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
                <span className="text-xs font-bold text-amber-900 block mb-2">
                  💡 よく使われる人気のキャンペーン（タップで簡単セット）:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      badge: '初回1,000円引',
                      title: '【初回限定】1,000円割引キャンペーン',
                      desc: '当店のご利用が初めてのお客様限定！全メニュー1,000円OFFでプロの施術をご体感いただけます。',
                      type: 'fixed' as const,
                      val: 1000,
                    },
                    {
                      badge: 'OPEN記念20%OFF',
                      title: 'OPEN記念！全メニュー20%割引',
                      desc: 'オープンを記念して期間限定で全施術料金を20%割引にてご提供いたします。',
                      type: 'percent' as const,
                      val: 20,
                    },
                    {
                      badge: 'ヘッドスパ10分無料',
                      title: '極上ドライヘッドスパ（10分）無料プレゼント',
                      desc: '60分以上の施術をご予約いただいた方に、眼精疲労に効くヘッドスパを無料で延長サービス！',
                      type: 'gift' as const,
                      val: 0,
                    },
                    {
                      badge: '出張費無料',
                      title: '出張交通費0円キャンペーン',
                      desc: 'ご指定の場所（ご自宅・オフィス・ホテル等）への出張訪問費が全額無料となります。',
                      type: 'gift' as const,
                      val: 0,
                    },
                    {
                      badge: '骨盤診断無料',
                      title: '専門セラピストによる骨盤・姿勢診断プレゼント',
                      desc: '施術前に骨盤の歪みや姿勢バランスを丁寧に測定・アドバイスいたします。',
                      type: 'gift' as const,
                      val: 0,
                    },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCampBadge(preset.badge);
                        setCampTitle(preset.title);
                        setCampDesc(preset.desc);
                        setCampType(preset.type);
                        setCampVal(preset.val);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1.5 active:scale-95"
                    >
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>{preset.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 入力フォーム */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    バッジ表示テキスト <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={campBadge}
                    onChange={(e) => setCampBadge(e.target.value)}
                    placeholder="例: 初回1,000円引、20%OFF、ヘッドスパ無料"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-rose-600 focus:outline-rose-500 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">※写真カードの上にタグとして表示されます（全角10〜12文字推奨）</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    キャンペーン名・見出し <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={campTitle}
                    onChange={(e) => setCampTitle(e.target.value)}
                    placeholder="例: 【初回限定】1,000円割引キャンペーン実施中！"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">特典の形態</label>
                  <select
                    value={campType}
                    onChange={(e) => setCampType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500"
                  >
                    <option value="fixed">定額値引き (円)</option>
                    <option value="percent">定率値引き (%)</option>
                    <option value="gift">無料サービス・特典プレゼント</option>
                  </select>
                </div>

                {campType !== 'gift' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {campType === 'fixed' ? '割引金額 (円)' : '割引率 (%)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={campVal}
                      onChange={(e) => setCampVal(Number(e.target.value))}
                      placeholder={campType === 'fixed' ? '1000' : '20'}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    有効期限（空欄なら無期限）
                  </label>
                  <input
                    type="date"
                    value={campValidUntil}
                    onChange={(e) => setCampValidUntil(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  特典の詳細説明・対象条件
                </label>
                <textarea
                  rows={3}
                  value={campDesc}
                  onChange={(e) => setCampDesc(e.target.value)}
                  placeholder="例: 初めて当店をご利用のお客様限定。全施術メニューから1,000円割引いたします。"
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-emerald-500 shadow-2xs leading-relaxed"
                />
              </div>

              {/* プレビュー表示 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">お客様の検索画面での表示イメージ:</span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-black shadow-xs">
                  <Gift className="w-3.5 h-3.5" />
                  <span>{campBadge || '特典あり'}</span>
                </div>
                {campTitle && (
                  <p className="text-xs font-bold text-slate-900 mt-2">{campTitle}</p>
                )}
                {campDesc && (
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{campDesc}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Gift className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">現在、特典・キャンペーンは停止中です</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                右上の「キャンペーン掲載中」スイッチをオンにすると、初回割引や無料延長などの特典を設定・公開できます。
              </p>
            </div>
          )}

          {/* 保存ボタン */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {campSavedToast && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>特典・キャンペーン設定を保存しました（即時公開中）</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveCampaign}
              className="ml-auto px-6 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
            >
              特典・キャンペーンを保存する
            </button>
          </div>
        </div>
      )}

      {/* タブ 3: 施術メニュー管理 */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">施術メニュー設定</h3>
              <p className="text-xs text-slate-500">料金や所要時間の変更、新メニューの追加を行えます。</p>
            </div>
            <button
              onClick={() => setIsAddServiceOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>新メニューを追加</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myServices.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                      公開中
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">所要時間: {s.duration_minutes}分</span>
                  <span className="text-base font-black text-slate-900">{formatPrice(s.price)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 新規メニューモーダル */}
          {isAddServiceOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm">新規メニューの登録</h4>
                  <button
                    onClick={() => setIsAddServiceOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddServiceSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">メニュー名</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="例: 全身リセット整体 60分"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">説明・施術内容</label>
                    <textarea
                      rows={3}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="施術の特徴や対象とする症状を入力してください"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">料金 (円・税込)</label>
                      <input
                        type="number"
                        required
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">所要時間 (分)</label>
                      <input
                        type="number"
                        required
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">カテゴリ</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-xl bg-white"
                    >
                      <option value="physical_therapy">理学療法 (PT)</option>
                      <option value="occupational_therapy">作業療法 (OT)</option>
                      <option value="speech_therapy">言語聴覚 (ST)</option>
                      <option value="dental_hygiene">歯科衛生・訪問口腔ケア</option>
                      <option value="acupuncture">鍼灸・経絡治療</option>
                      <option value="dietitian">管理栄養・食事指導</option>
                      <option value="midwife">助産・産前産後ケア</option>
                      <option value="orthoptist">視能訓練・アイケア</option>
                      <option value="massage">もみほぐし・整体</option>
                      <option value="aroma">アロマ・リンパ</option>
                      <option value="chiropractic">カイロプラクティック</option>
                      <option value="beauty">睡眠・ドライヘッドスパ</option>
                      <option value="esthetic">エステ・フェイシャル</option>
                      <option value="personal_training">パーソナルトレーニング</option>
                      <option value="footcare">フットケア・巻き爪・ネイル</option>
                      <option value="counseling">心理カウンセリング・メンタル</option>
                      <option value="parenting">離乳食・育児相談</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddServiceOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      公開する
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* タブ 4: 売上・振込明細 (Stripe Connect) */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">総取扱高 (GMV)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{formatPrice(totalGrossEarnings)}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">完了件数: {completedBookings.length}件</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">プラットフォーム利用手数料 (20%)</span>
              <div className="text-2xl font-black text-rose-600 mt-1">-{formatPrice(totalPlatformFees)}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">集客・決済代行手数料</span>
            </div>

            <div className="bg-emerald-50/60 rounded-3xl p-5 border border-emerald-200 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">純手取り受取額</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">{formatPrice(totalNetEarnings)}</div>
              <span className="text-[11px] text-emerald-600 mt-1 block">Stripe Connect口座へ即時振込可能</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 text-sm">施術完了・売上履歴一覧</h4>
              <button
                onClick={() => alert('Stripe Express ダッシュボードへリダイレクトします（外部URL）')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                <span>Stripe Express ダッシュボード</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {completedBookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">完了した施術の履歴はまだありません</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {completedBookings.map((b) => {
                  const customer = allUsers.find((u) => u.id === b.customer_id);
                  const service = services.find((s) => s.id === b.service_id);
                  return (
                    <div key={b.id} className="py-3.5 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{customer?.name} 様 - {service?.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(b.scheduled_at)} • {b.booking_type === 'visit' ? '出張' : '店舗'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-600 text-sm">+{formatPrice(b.therapist_earnings)}</div>
                        <div className="text-[10px] text-slate-400">総額 {formatPrice(b.total_amount)} (手数料 -{formatPrice(b.platform_fee)})</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* タブ 4: お客様の評価・口コミ一覧 */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 評価サマリーカード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 総合評価スコア */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                総合平均評価
              </span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-4xl font-black text-slate-900">
                  {therapist?.rating_avg ? therapist.rating_avg.toFixed(2) : '5.00'}
                </span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                全 {myReviews.length > 0 ? myReviews.length : therapist?.reviews_count || 0} 件のお客様評価
              </p>
            </div>

            {/* 星の内訳 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs md:col-span-2 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                評価の内訳
              </h4>
              {[5, 4, 3, 2, 1].map((starCount) => {
                const count = myReviews.filter((r) => r.rating === starCount).length;
                const total = Math.max(1, myReviews.length);
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={starCount} className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-bold text-slate-700 flex items-center gap-1">
                      <span>★{starCount}</span>
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-400 text-[11px] font-mono">
                      {count} 件
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 口コミ・レビュー詳細リスト */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>お客様からいただいた口コミ・レビュー ({myReviews.length}件)</span>
              </h4>
              <span className="text-xs text-slate-400">新しい順</span>
            </div>

            {myReviews.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <Star className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p>現在まだレビューはありません。</p>
                <p className="text-[11px] text-slate-400">施術完了後にお客様から投稿された口コミがここに表示されます。</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myReviews.map((rev) => {
                  const customer = allUsers.find((u) => u.id === rev.customer_id);
                  const booking = bookings.find((b) => b.id === rev.booking_id);
                  const service = services.find((s) => s.id === booking?.service_id);

                  return (
                    <div key={rev.id} className="py-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={customer?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer?.name || 'Customer')}`}
                            alt={customer?.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <span className="font-bold text-slate-900 text-xs">
                              {customer?.name || 'お客様'} 様
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>{formatDate(rev.created_at)}</span>
                              {booking && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-medium">
                                    {booking.booking_type === 'visit' ? '出張施術' : '店舗訪問'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 星評価 */}
                        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-amber-900 text-xs ml-1">
                            {rev.rating}.0
                          </span>
                        </div>
                      </div>

                      {/* 施術メニュー */}
                      {service && (
                        <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg inline-block">
                          メニュー: {service.title}
                        </div>
                      )}

                      {/* コメント本文 */}
                      <p className="text-xs text-slate-700 leading-relaxed pl-1 pt-1">
                        {rev.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* タブ 5: プロフィール・登録情報編集 */}
      {activeTab === 'profile' && <TherapistProfileEdit therapistId={targetUser.id} />}

      {/* チャットモーダル */}
      {chatBooking && (
        <BookingChatModal
          booking={chatBooking}
          onClose={() => setChatBooking(null)}
          activeUserId={targetUser.id}
          viewerRole="therapist"
        />
      )}

      {/* 施術完了報告・お客様確認電子サインモーダル */}
      {completingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
            {/* ヘッダー */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-emerald-950 text-sm">施術完了報告・お客様確認サイン</h3>
              </div>
              <button
                onClick={() => setCompletingBooking(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 予約サマリー */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">お客様名:</span>
                  <span className="font-bold text-slate-900">
                    {allUsers.find((u) => u.id === completingBooking.customer_id)?.name || 'お客様'} 様
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">施術メニュー:</span>
                  <span className="font-bold text-slate-900">
                    {services.find((s) => s.id === completingBooking.service_id)?.title || '施術コース'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">決済金額:</span>
                  <span className="font-black text-emerald-600">
                    {formatPrice(completingBooking.total_amount)}
                  </span>
                </div>
              </div>

              {/* 手書きサイン案内 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                    <span>お客様受領サイン（画面上に指やペンでご署名）</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.clearRect(0, 0, canvas.width, canvas.height);
                          setHasSignature(false);
                        }
                      }
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>クリア</span>
                  </button>
                </div>

                {/* Canvas サインパッド */}
                <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 p-1 relative overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={150}
                    onMouseDown={(e) => {
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      const rect = canvas.getBoundingClientRect();
                      ctx.beginPath();
                      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                      ctx.lineWidth = 2.5;
                      ctx.lineCap = 'round';
                      ctx.strokeStyle = '#0f172a';
                      setIsDrawing(true);
                      setHasSignature(true);
                    }}
                    onMouseMove={(e) => {
                      if (!isDrawing) return;
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      const rect = canvas.getBoundingClientRect();
                      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                      ctx.stroke();
                    }}
                    onMouseUp={() => setIsDrawing(false)}
                    onMouseLeave={() => setIsDrawing(false)}
                    onTouchStart={(e) => {
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      const rect = canvas.getBoundingClientRect();
                      const touch = e.touches[0];
                      ctx.beginPath();
                      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
                      ctx.lineWidth = 2.5;
                      ctx.lineCap = 'round';
                      ctx.strokeStyle = '#0f172a';
                      setIsDrawing(true);
                      setHasSignature(true);
                    }}
                    onTouchMove={(e) => {
                      if (!isDrawing) return;
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      const rect = canvas.getBoundingClientRect();
                      const touch = e.touches[0];
                      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
                      ctx.stroke();
                    }}
                    onTouchEnd={() => setIsDrawing(false)}
                    className="w-full h-[140px] bg-white rounded-xl cursor-crosshair touch-none"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                      枠内にお客様のサインをご記入ください
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 space-y-1">
                <p className="font-bold">安心の施術完了・売上計上フロー</p>
                <p className="text-slate-600">
                  完了報告と同時にお客様へ通知が送信され、レビュー投稿の依頼が届きます。Stripeの事前仮決済枠から施術売上が正式に確定計上されます。
                </p>
              </div>

              {/* ボタン列 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('サインなしで完了報告を行いますか？（お客様がご就寝中などの場合に適用してください）')) {
                      updateBookingStatus(completingBooking.id, 'completed');
                      setCompletingBooking(null);
                      alert('施術完了を報告しました。売上が計上されました。');
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 underline py-1"
                >
                  サインをスキップして完了
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setCompletingBooking(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                  >
                    戻る
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateBookingStatus(completingBooking.id, 'completed');
                      setCompletingBooking(null);
                      alert('お客様サインを受領し、施術完了を正式に報告しました！売上が計上されました。');
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>受領確認・完了を確定する</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
