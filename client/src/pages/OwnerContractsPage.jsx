import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchRooms } from '../features/rooms/roomSlice';
import { createContract, endContract, fetchContracts } from '../features/contracts/contractSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function OwnerContractsPage() {
  const dispatch = useDispatch();
  const { items: rooms } = useSelector((state) => state.rooms);
  const { items: contracts, loading, error } = useSelector((state) => state.contracts);
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState({
    roomId: '',
    tenantId: '',
    startDate: '',
    deposit: '',
    monthlyRent: '',
  });

  useEffect(() => {
    dispatch(fetchRooms({ limit: 100 }));
    dispatch(fetchContracts());

    const token = localStorage.getItem('token');
    axios
      .get(`${API_URL}/users?role=tenant`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTenants(res.data.data || []))
      .catch(() => {});
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      createContract({
        ...form,
        deposit: Number(form.deposit || 0),
        monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : undefined,
      })
    );
    if (createContract.fulfilled.match(result)) {
      dispatch(fetchRooms({ limit: 100 }));
      setForm({ roomId: '', tenantId: '', startDate: '', deposit: '', monthlyRent: '' });
    }
  };

  const handleEnd = async (contractId) => {
    const result = await dispatch(endContract(contractId));
    if (endContract.fulfilled.match(result)) {
      dispatch(fetchRooms({ limit: 100 }));
    }
  };

  return (
    <div>
      <h2>Quản lý hợp đồng</h2>
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} required>
          <option value="">-- Chọn phòng --</option>
          {rooms.map((r) => (
            <option key={r._id} value={r._id}>
              Phòng {r.roomNumber} ({r.status}) - {r.price.toLocaleString()} đ
            </option>
          ))}
        </select>

        <select value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} required>
          <option value="">-- Chọn người thuê --</option>
          {tenants.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} ({t.email})
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Tiền cọc"
          value={form.deposit}
          onChange={(e) => setForm({ ...form, deposit: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tiền thuê/tháng (mặc định theo phòng)"
          value={form.monthlyRent}
          onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
        />
        <button type="submit">Tạo hợp đồng</button>
      </form>

      {loading && <p>Đang tải danh sách hợp đồng...</p>}
      <ul>
        {contracts.map((c) => (
          <li key={c._id}>
            Phòng {c.roomId?.roomNumber} | Người thuê: {c.tenantId?.name} | Trạng thái:{' '}
            {c.isActive ? 'Đang hiệu lực' : 'Đã kết thúc'}
            {c.isActive && (
              <button type="button" onClick={() => handleEnd(c._id)}>
                Kết thúc hợp đồng
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}