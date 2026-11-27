import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OwnerArea from "./pages/OwnerArea";
import TenantArea from "./pages/TenantArea";
import NotFound from "./pages/NotFound";
import TenantRepairs from "./pages/tenant/Repairs";
import OwnerRepairs from "./pages/owner/Repairs";
import OwnerInvoices from "./pages/owner/Invoices";
import OwnerDashboard from "./pages/owner/Dashboard";
import OwnerReadings from "./pages/owner/Readings";
import TenantOverview from "./pages/tenant/Overview";
import TenantInvoices from "./pages/tenant/Invoices";
import TenantInvoiceDetail from "./pages/tenant/InvoiceDetail";
const App = () => (
  <Routes>
    <Route element={<Layout />}>
      {/* Công khai */}
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Chỉ chủ trọ. B, C thêm <Route> con vào đây */}
      <Route element={<ProtectedRoute roles={["owner"]} />}>
        <Route path="owner" element={<OwnerArea />}>
          <Route index element={<OwnerDashboard />} />
          <Route path="repairs" element={<OwnerRepairs />} />
          <Route path="invoices" element={<OwnerInvoices />} />
          {/* THÊM: đường dẫn /owner/readings */}
          <Route path="readings" element={<OwnerReadings />} />
        </Route>
      </Route>

      {/* Chỉ người thuê. A thêm route con vào đây */}
      <Route element={<ProtectedRoute roles={["tenant"]} />}>
        <Route path="tenant" element={<TenantArea />}>
          <Route index element={<TenantOverview />} />
          <Route path="invoices" element={<TenantInvoices />} />
          <Route path="invoices/:id" element={<TenantInvoiceDetail />} />
          <Route path="repairs" element={<TenantRepairs />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;