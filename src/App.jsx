import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import PageNotFound from "./lib/PageNotFound";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

import AppLayout from "@/components/layout/AppLayout";
import Home from "@/pages/Home";
import Streams from "@/pages/Streams";
import StreamView from "@/pages/StreamView";
import Store from "@/pages/Store";
import WalletPage from "@/pages/WalletPage";
import VipPage from "@/pages/VipPage";
import Ranking from "@/pages/Ranking";
import Support from "@/pages/Support";
import Feed from "@/pages/Feed";
import Rooms from "@/pages/Rooms";
import GeneralChat from "@/pages/GeneralChat";
import Rules from "@/pages/Rules";
import Privacy from "@/pages/Privacy";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminStreams from "@/pages/admin/AdminStreams";
import AdminStore from "@/pages/admin/AdminStore";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminVip from "@/pages/admin/AdminVip";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminTags from "@/pages/admin/AdminTags";
import AdminMembers from "@/pages/admin/AdminMembers";
import Profile from "@/pages/Profile";
import Inventory from "@/pages/Inventory";

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/streams" element={<Streams />} />
        <Route path="/stream/:id" element={<StreamView />} />
        <Route path="/store" element={<Store />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/vip" element={<VipPage />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/support" element={<Support />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/chat" element={<GeneralChat />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/inventory" element={<Inventory />} />

        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="streams" element={<AdminStreams />} />
          <Route path="store" element={<AdminStore />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="vip" element={<AdminVip />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tags" element={<AdminTags />} />
          <Route path="members" element={<AdminMembers />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <>
      <Router>
        <AuthenticatedApp />
      </Router>

      <Toaster />
      <SonnerToaster position="bottom-right" theme="dark" />
    </>
  );
}

export default App;
