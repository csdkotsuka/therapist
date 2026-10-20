import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  Auth,
  UserCredential,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Firebase初期化（クライアントサイド・SSR安全）
export function getFirebaseServices() {
  if (typeof window === 'undefined') {
    return { app: null, auth: null, db: null };
  }

  if (!app) {
    if (getApps().length > 0) {
      app = getApp();
    } else if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      try {
        app = initializeApp(firebaseConfig);
      } catch (err) {
        console.warn('Firebase initialization warning:', err);
      }
    }
  }

  if (app && !auth) {
    try {
      auth = getAuth(app);
    } catch (e) {
      console.warn('Firebase Auth init error:', e);
    }
  }

  if (app && !db) {
    try {
      db = getFirestore(app);
    } catch (e) {
      console.warn('Firestore init error:', e);
    }
  }

  return { app, auth, db };
}

export interface CustomerRegistrationData {
  name: string;
  email: string;
  password?: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
  building?: string;
  lat: number;
  lng: number;
}

export interface RegistrationResult {
  success: boolean;
  uid: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    lat: number;
    lng: number;
  };
  isSavedToFirebase: boolean;
  error?: string;
}

/**
 * 顧客新規アカウント作成 & Firebase (Auth + Firestore) へのデータ保存
 */
export async function registerCustomerToFirebase(
  data: CustomerRegistrationData
): Promise<RegistrationResult> {
  const fullAddress = `${data.prefecture}${data.city}${data.street}${data.building ? ' ' + data.building : ''}`;
  const generatedId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let firebaseUid = generatedId;
  let isSavedToFirebase = false;

  const { auth, db } = getFirebaseServices();

  // 1. Firebase Auth でアカウント作成 (メール/パスワード)
  if (auth && data.password) {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      firebaseUid = userCredential.user.uid;

      // プロフィール名の設定
      await updateProfile(userCredential.user, {
        displayName: data.name,
      });

      isSavedToFirebase = true;
    } catch (authError: any) {
      console.warn('Firebase Auth notice (falling back or handled):', authError.message);
      // Firebase の設定がモックキーまたは無効の場合も、安全にIDを生成して継続
      if (authError.code === 'auth/email-already-in-use') {
        throw new Error('このメールアドレスは既に登録されています。ログイン画面からログインしてください。');
      }
      if (authError.code === 'auth/weak-password') {
        throw new Error('パスワードが短すぎます。6文字以上で設定してください。');
      }
      if (authError.code === 'auth/invalid-email') {
        throw new Error('メールアドレスの形式が正しくありません。');
      }
    }
  }

  // 2. Cloud Firestore に顧客プロファイル & 位置情報を保存
  if (db) {
    try {
      const customerDocRef = doc(db, 'customers', firebaseUid);
      const firestoreData = {
        uid: firebaseUid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: fullAddress,
        addressDetails: {
          postalCode: data.postalCode,
          prefecture: data.prefecture,
          city: data.city,
          street: data.street,
          building: data.building || '',
        },
        // 将来の全国展開・Uber Eats風近接検索のためのGeoデータ
        location: {
          lat: data.lat,
          lng: data.lng,
          accuracy: 'geocoded_or_gps',
        },
        role: 'customer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(customerDocRef, firestoreData, { merge: true });

      // users コレクションにも互換性のために保存
      const userDocRef = doc(db, 'users', firebaseUid);
      await setDoc(userDocRef, {
        id: firebaseUid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'customer',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
        address: fullAddress,
        lat: data.lat,
        lng: data.lng,
        createdAt: serverTimestamp(),
      }, { merge: true });

      isSavedToFirebase = true;
    } catch (firestoreError: any) {
      console.warn('Firestore write warning:', firestoreError);
    }
  }

  // ローカルストレージにもバックアップ（オフライン・開発時互換）
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('carehub_registered_customers') || '[]';
      const list = JSON.parse(stored);
      list.push({
        uid: firebaseUid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: fullAddress,
        lat: data.lat,
        lng: data.lng,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem('carehub_registered_customers', JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  return {
    success: true,
    uid: firebaseUid,
    customer: {
      id: firebaseUid,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: fullAddress,
      lat: data.lat,
      lng: data.lng,
    },
    isSavedToFirebase,
  };
}
