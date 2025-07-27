import React, { useState, useEffect } from 'react';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Notification = ({ user, authToken }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    if (!user || !authToken) return; // Prevent API call if not authenticated
    try {
      const res = await axios.get('http://localhost:8000/api/notifications', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount((res.data.notifications || []).filter(n => !n.read_at).length);
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // POLLING: fetch notifications every 10 seconds
  useEffect(() => {
    let interval;
    if (user && authToken) {
      fetchNotifications(); // fetch immediately
      interval = setInterval(fetchNotifications, 10000); // every 10 seconds
    }
    return () => clearInterval(interval);
  }, [user, authToken]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      fetchNotifications();
    } catch (err) {
      // handle error
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read_at;
    if (filter === 'read') return !!n.read_at;
    return true;
  });

  return (
    <div className="relative">
      <button
        onClick={() => setNotifOpen(!notifOpen)}
        className="relative p-2 rounded-full hover:bg-green-100 transition"
        aria-label="Notifications"
      >
        <BellIcon className="w-7 h-7 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5">{unreadCount}</span>
        )}
      </button>
      {notifOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 border-b font-bold text-green-700 flex items-center justify-between">
            Notifications
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`px-2 py-1 rounded ${filter==='all'?'bg-green-100 text-green-700':''}`}>All</button>
              <button onClick={() => setFilter('unread')} className={`px-2 py-1 rounded ${filter==='unread'?'bg-green-100 text-green-700':''}`}>Unread</button>
              <button onClick={() => setFilter('read')} className={`px-2 py-1 rounded ${filter==='read'?'bg-green-100 text-green-700':''}`}>Read</button>
            </div>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <li className="px-4 py-4 text-gray-500 text-center">No notifications</li>
            ) : (
              filteredNotifications.map(n => (
                <li key={n.id} className={`px-4 py-3 border-b ${n.read_at ? 'bg-white' : 'bg-green-50 font-semibold'}`}>
                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <div>{n.data.message}</div>
                      {Array.isArray(n.data.items) && n.data.items.length > 0 && (
                        <ul className="mt-1 ml-2 text-xs text-gray-700 list-disc">
                          {n.data.items.map((item, idx) => (
                            <li key={idx}>
                              {item.asset_name} (Qty: {item.quantity}, Date: {item.request_date})
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                    {!n.read_at && (
                      <button onClick={() => markAsRead(n.id)} className="ml-2 p-1 rounded hover:bg-green-200" title="Mark as read">
                        <CheckIcon className="w-5 h-5 text-green-600" />
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notification;
