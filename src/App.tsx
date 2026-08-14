import { HashRouter, Route, Routes } from 'react-router'
import Home from './pages/Home'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Investment from './pages/Investment'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import MyAccount from './pages/MyAccount'
import Admin from './pages/Admin'
import InterestCalculator from './pages/InterestCalculator'
import PersonalInfo from './pages/PersonalInfo'
import Introduction from './pages/Introduction'
import Benefits from './pages/Benefits'
import Wallet from './pages/Wallet'
import TransactionHistory from './pages/TransactionHistory'
import Notifications from './pages/Notifications'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import Referral from './pages/Referral'
import Reinvestment from './pages/Reinvestment'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/investment" element={<Investment />} />
        <Route path="/interest-calculator" element={<InterestCalculator />} />
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/benefits" element={<Benefits />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/my-account"
          element={
            <RequireAuth>
              <MyAccount />
            </RequireAuth>
          }
        />
        <Route
          path="/personal-info"
          element={
            <RequireAuth>
              <PersonalInfo />
            </RequireAuth>
          }
        />
        <Route
          path="/wallet"
          element={
            <RequireAuth>
              <Wallet />
            </RequireAuth>
          }
        />
        <Route
          path="/transactions"
          element={
            <RequireAuth>
              <TransactionHistory />
            </RequireAuth>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <Notifications />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
        <Route
          path="/referral"
          element={
            <RequireAuth>
              <Referral />
            </RequireAuth>
          }
        />
        <Route
          path="/reinvest"
          element={
            <RequireAuth>
              <Reinvestment />
            </RequireAuth>
          }
        />
        <Route
          path="/reinvest/:investmentId"
          element={
            <RequireAuth>
              <Reinvestment />
            </RequireAuth>
          }
        />
      </Routes>
    </HashRouter>
  )
}
