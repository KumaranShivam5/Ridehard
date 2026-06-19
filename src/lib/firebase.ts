import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import userAvatarImg from '../assets/images/user_avatar_1781791703214.jpg';

// Detect if we have real credentials
export const isFirebaseReal = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'MOCK_API_KEY';

let app;
let dbInstance: any = null;
let authInstance: any = null;

if (isFirebaseReal) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    authInstance = getAuth(app);

    // Validate connection asynchronously as instructed in the skill
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(dbInstance, 'test', 'connection'));
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Firebase client reports ofline state.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.error("Error setting up Firebase connection: ", err);
  }
} else {
  console.info("[RideHard Config] Firebase is in Fallback Local Engine Mode. Serving data from Express Server APIs.");
}

export const db = dbInstance;
export const auth = authInstance;

// Custom Error Handler conformant with FirestoreErrorInfo interface
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid || null,
      email: authInstance?.currentUser?.email || null,
      emailVerified: authInstance?.currentUser?.emailVerified || null,
      isAnonymous: authInstance?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Payload: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Simple Auth Trigger wrapper using Google Login Popup
export async function triggerGoogleLogin(): Promise<FirebaseUser | null> {
  if (!isFirebaseReal || !authInstance) {
    // Return a mocked veteran admin user in fallback mode so that veteran logins still work.
    // This allows the full app to be tested flawlessly in the editor iframe!
    const mockUser = {
      uid: 'mock-veteran-uid',
      displayName: 'Captain Shivam',
      email: 'kumaranshivam57@gmail.com',
      emailVerified: true,
      photoURL: userAvatarImg
    } as any;
    console.info("Logging in with mock admin user in Fallback local state.");
    return mockUser;
  }
  
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(authInstance, provider);
    return result.user;
  } catch (error) {
    console.error("Popup Authentication failed: ", error);
    throw error;
  }
}
