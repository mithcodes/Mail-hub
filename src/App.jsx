import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Body from "./pages/Body";
import Inbox from "./pages/Inbox";
import Mail from "./pages/Mail";
import SendMail from "./components/ComposeMail/SendMail";
import { and, collection, doc, onSnapshot, or, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";    
import { auth, db } from "./firebase";
import { useDispatch, useSelector } from "react-redux";
import { setEmails, setMailsArrToDelPermanent, setProfile, setUser } from "./redux/appSlice";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import LoadingSpinner from "./components/UI/LoadingSpinner";              
import Sent from "./pages/Sent";
import Starred from "./pages/Starred";
import Snoozed from "./pages/Snoozed";
import Draft from "./pages/Draft";
import Trash from "./pages/Trash";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserProfile from "./pages/UserProfile";
import AllMails from "./pages/AllMails";

// Define the routes
const createRouter = (signedIn) =>
  createBrowserRouter([
    {
      path: "/",
      element: !signedIn ? <Login /> : <Navigate to="/inbox" />,
    },
    {
      path: "/signup",
      element: !signedIn ? <SignUp /> : <Navigate to="/inbox" />,
    },
    {
      path: "/forgotpassword",
      element: !signedIn ? <ForgotPassword /> : <Navigate to="/inbox" />,
    },
    {
      path: "/userprofile",
      element: signedIn ? <UserProfile /> : <Navigate to="/" />,
    },
    {
      path: "/inbox",
      element: <Body />,
      children: [
        { path: "/inbox", element: signedIn ? <Inbox /> : <Navigate to="/" /> },
        {
          path: "/inbox/:id",
          element: signedIn ? <Mail /> : <Navigate to="/" />,
        },
      ],
    },
    {
      path: "/starred",
      element: <Body />,
      children: [
        {
          path: "/starred",
          element: signedIn ? <Starred /> : <Navigate to="/" />,
        },
        {
          path: "/starred/:id",
          element: signedIn ? <Mail /> : <Navigate to="/" />,
        },
      ],
    },
    {
      path: "/snoozed",
      element: <Body />,
      children: [
        {
          path: "/snoozed",
          element: signedIn ? <Snoozed /> : <Navigate to="/" />,
        },
        {
          path: "/snoozed/:id",
          element: signedIn ? <Mail /> : <Navigate to="/" />,
        },
      ],
    },
    {
      path: "/sent",
      element: <Body />,
      children: [
        { path: "/sent", element: signedIn ? <Sent /> : <Navigate to="/" /> },
        {
          path: "/sent/:id",
          element: signedIn ? <Mail /> : <Navigate to="/" />,
        },
      ],
    },
    {
      path: "/draft",
      element: <Body />,
      children: [
        { path: "/draft", element: signedIn ? <Draft /> : <Navigate to="/" /> },
        {
          path: "/draft/:id",
          element: signedIn ? <Mail /> : <Navigate to="/" />,
        },
      ],
    },
    {
      path: "/trash",
      element: <Body />,
      children: [
        { path: "/trash", element: signedIn ? <Trash /> : <Navigate to="/" /> },
        {
          path: "/trash/:id",
          element: signedIn ? <Mail /> : <Navigate to="/" />,
        },
      ],
    },
    {
      path: "/allmails",
      element: <Body />,
      children: [
        { path: "/allmails", element: signedIn ? <AllMails /> : <Navigate to="/" /> },
        {
          path: "/allmails/:id",
          element: signedIn ? <Mail /> : <Navigate to="/" />,
        },
      ],
    },
    {
      path: "*", // Catch-all route
      element: signedIn ? <Navigate to="/inbox" /> : <Navigate to="/" />,
    },
  ]);

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true); // Loading state
  const emails = useSelector((state) => state.appSlice.emails);
  const user = useSelector((state) => state.appSlice.user);

  useEffect(() => {
    const q = query(
      collection(db, "emails"),
      where("emailID", "==", user?.email || ""),
      orderBy("createdAt", "desc")
    );

    const q2 = query(
      collection(db, "emails"), 
      and(
        or(
          where("to", "==", user?.email || ""),
          where("from", "==", user?.email || "")
        ),
        where("emailID", "!=", user?.email || "")
      ),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allEmails = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : null,
      }));

      dispatch(setEmails(allEmails));
      setLoading(false); // Stop loading when emails are fetched
      NProgress.done(); // Stop NProgress after fetching emails
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      const allEmails = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : null,
      }));

      dispatch(setMailsArrToDelPermanent(allEmails));
      setLoading(false); // Stop loading when emails are fetched
      NProgress.done(); // Stop NProgress after fetching emails
    });

    return () => {
      unsubscribe();
      unsubscribe2();
      NProgress.done(); // Ensure NProgress stops on unmount
    }; // Cleanup on unmount
  }, [user]);

  // Start NProgress when the app is loading
  useEffect(() => {
    if (loading) {
      NProgress.start();
    }
  }, [loading]);

  useEffect(() => {
    const email = user?.email ? user?.email : "abc";
    const unsubscribe = onSnapshot(
      doc(db, email, email),
      (doc) => {
        // console.log(doc.data());
        dispatch(setProfile(doc.data()));
      },
      (error) => {
        console.error("Error fetching document:", error);
      }
    );
  }, [user]);

  const router = createRouter(user);

  return (
    <>
      <ToastContainer />
      {loading ? (
        <div className="fixed top-20 left-[45%]">
          <LoadingSpinner />{" "}
        </div>
      ) : (
        <RouterProvider router={router} />
      )}
      <div className="fixed w-[36%] bottom-0 right-10 z-10">
        <SendMail />
      </div>
    </>
  );
}

export default App;



// Purpose: Main entry point of the Gmail clone app. Handles routing, data fetching, loading states, and global UI elements.

// Key Responsibilities:

// Routing

// Uses React Router v6 (createBrowserRouter) for all app routes:

// Auth pages: /, /signup, /forgotpassword

// Main app pages: /inbox, /sent, /draft, /trash, /starred, /snoozed, /allmails

// Dynamic routes: /inbox/:id, /sent/:id, etc.

// Redirects based on user login state.

// Firebase Data Fetching

// Emails:

// q → Emails sent by current user, ordered by creation time (latest first).

// q2 → Emails related to the user but not sent by them, used for deletion logic.

// Uses onSnapshot for real-time updates.

// User Profile:

// Fetches current user profile document from Firestore and stores in Redux.

// Redux Integration

// setEmails → stores fetched emails.

// setMailsArrToDelPermanent → stores emails for deletion.

// setProfile → stores user profile.

// Loading & UI Feedback

// Shows spinner while loading emails/profile.

// Uses NProgress for a top loading bar.

// Persistent UI Components

// SendMail component fixed at bottom-right for composing emails.

// ToastContainer for notifications.

// Data Flow:

// Firebase → Redux Store → UI Components (Inbox, Mail, Trash, etc.)


// Real-time Firestore updates automatically update the Redux store and UI.

// Summary in One Line:
// The App component initializes the app, fetches user data in real-time, manages loading/UI feedback, and controls navigation between authentication and mailbox pages.
