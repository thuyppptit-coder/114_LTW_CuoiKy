import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OwnerArea from "./pages/OwnerArea";
import TenantArea from "./pages/TenantArea";
import NotFound from "./pages/NotFound";

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
          <Route index element={<p>Tổng quan (C làm dashboard)</p>} />
        </Route>
      </Route>

      {/* Chỉ người thuê. A thêm route con vào đây */}
      <Route element={<ProtectedRoute roles={["tenant"]} />}>
        <Route path="tenant" element={<TenantArea />}>
          <Route index element={<p>Phòng và hợp đồng của tôi</p>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;