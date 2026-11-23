import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchRooms } from '../features/rooms/roomSlice';
import { useDebounce } from '../hooks/useDebounce';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function GuestRoomsPage() {
  const dispatch = useDispatch();
  const { items: rooms, pagination, loading, error } = useSelector((state) => state.rooms);

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    page: 1,
  });
  const debouncedFilters = useDebounce(filters, 400);

  const [contact, setContact] = useState({
    fullName: '',
    phone: '',
    email: '',
    roomId: '',
    message: '',
  });
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    dispatch(
      fetchRooms({
        status: 'Trống',
        minPrice: debouncedFilters.minPrice,
        maxPrice: debouncedFilters.maxPrice,
        minArea: debouncedFilters.minArea,
        maxArea: debouncedFilters.maxArea,
        page: debouncedFilters.page,
        limit: 6,
      })
    );
  }, [dispatch, debouncedFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSendContact = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    try {
      await axios.post(`${API_URL}/contacts`, {
        ...contact,
        roomId: contact.roomId || null,
      });
      setStatusMsg('Gửi liên hệ thành công!');
      setContact({ fullName: '', phone: '', email: '', roomId: '', message: '' });
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Gửi liên hệ thất bại');
    }
  };

  return (
    <div>
      <h2>Phòng trọ đang trống</h2>

      <div>
        <input type="number" name="minPrice" placeholder="Giá từ" value={filters.minPrice} onChange={handleFilterChange} />
        <input type="number" name="maxPrice" placeholder="Giá đến" value={filters.maxPrice} onChange={handleFilterChange} />
        <input type="number" name="minArea" placeholder="Diện tích từ (m²)" value={filters.minArea} onChange={handleFilterChange} />
        <input type="number" name="maxArea" placeholder="Diện tích đến (m²)" value={filters.maxArea} onChange={handleFilterChange} />
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p>{error}</p>}

      <div>
        {rooms.map((room) => (
          <div key={room._id}>
            <h3>Phòng {room.roomNumber} ({room.status})</h3>
            <p>Giá: {room.price.toLocaleString()} đ/tháng | Diện tích: {room.area} m²</p>
            <p>Dãy: {room.buildingId?.name} - {room.buildingId?.address}</p>
            <button type="button" onClick={() => setContact((prev) => ({ ...prev, roomId: room._id }))}>
              Chọn phòng liên hệ
            </button>
          </div>
        ))}
      </div>

      <div>
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
        >
          Trước
        </button>
        <span>Trang {pagination.page}/{pagination.totalPages}</span>
        <button
          type="button"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
        >
          Sau
        </button>
      </div>

      <hr />
      <h3>Để lại thông tin liên hệ</h3>
      {statusMsg && <p>{statusMsg}</p>}
      <form onSubmit={handleSendContact}>
        <input
          type="text"
          placeholder="Họ tên *"
          required
          value={contact.fullName}
          onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Số điện thoại *"
          required
          value={contact.phone}
          onChange={(e) => setContact({ ...contact, phone: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={contact.email}
          onChange={(e) => setContact({ ...contact, email: e.target.value })}
        />
        <textarea
          placeholder="Nội dung liên hệ *"
          required
          value={contact.message}
          onChange={(e) => setContact({ ...contact, message: e.target.value })}
        />
        <button type="submit">Gửi</button>
      </form>
    </div>
  );
}