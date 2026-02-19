import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
// Додав сюди getDocs та getDoc для користувачів
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, getDocs, getDoc } from 'firebase/firestore';

const AdminPanel = () => {
  // === СТЕЙТИ ===
  const [activeTab, setActiveTab] = useState('orders'); // Яка вкладка активна: 'orders' чи 'users'
  
  // Стейт для замовлень (твій)
  const [orders, setOrders] = useState([]);
  
  // Стейти для користувачів (нові)
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Дані для картки клієнта
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // === ЕФЕКТИ ТА ФУНКЦІЇ ===

  // 1. Отримуємо замовлення (твій старий код)
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. Видалення замовлення (твій старий код)
  const deleteOrder = async (id) => {
    if(window.confirm("Видалити це замовлення?")) {
      await deleteDoc(doc(db, "orders", id));
    }
  };

  // 3. Завантаження всіх користувачів (нове)
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      setUsers(userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Помилка завантаження користувачів:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // 4. Завантаження повної інформації про клієнта по кліку (нове)
  const handleUserClick = async (userId) => {
    setLoadingDetails(true);
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setSelectedUser({ id: userDocSnap.id, ...userDocSnap.data() });
      } else {
        alert("Користувача не знайдено в базі!");
      }
    } catch (error) {
      console.error("Помилка завантаження деталей клієнта:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // === РЕНДЕР ===
  return (
    <div style={{ padding: '100px 20px', background: '#000', minHeight: '100vh', color: '#fff' }}>
      
      {/* --- НАВІГАЦІЯ (ВКЛАДКИ) --- */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button 
          onClick={() => { setActiveTab('orders'); setSelectedUser(null); }}
          style={{ 
            padding: '10px 20px', fontSize: '16px', cursor: 'pointer', fontFamily: 'Oswald',
            background: activeTab === 'orders' ? '#ff4500' : '#111',
            color: '#fff', border: '1px solid #ff4500', borderRadius: '5px'
          }}
        >
          📦 ЗАМОВЛЕННЯ
        </button>
        <button 
          onClick={() => { setActiveTab('users'); fetchUsers(); }}
          style={{ 
            padding: '10px 20px', fontSize: '16px', cursor: 'pointer', fontFamily: 'Oswald',
            background: activeTab === 'users' ? '#ff4500' : '#111',
            color: '#fff', border: '1px solid #ff4500', borderRadius: '5px'
          }}
        >
          👥 КОРИСТУВАЧІ
        </button>
      </div>


      {/* --- ВКЛАДКА 1: ЗАМОВЛЕННЯ (твій старий рендер) --- */}
      {activeTab === 'orders' && (
        <>
          <h1 style={{ color: '#ff4500', fontFamily: 'Oswald' }}>ВСІ ЗАМОВЛЕННЯ</h1>
          <div style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
            {orders.length === 0 ? <p>Замовлень поки немає...</p> : orders.map(order => (
              <div key={order.id} style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px', background: '#111', position: 'relative' }}>
                <button 
                  onClick={() => deleteOrder(order.id)}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                >🗑️</button>
                <h3>Замовлення № {order.id.slice(0,5)}</h3>
                <p><strong>Клієнт:</strong> {order.userName}</p>
                <p><strong>Телефон:</strong> {order.phone}</p>
                <p><strong>Адреса:</strong> {order.address}</p>
                <p><strong>Сума:</strong> <span style={{color: '#ff4500'}}>{order.total} грн</span></p>
                <hr style={{borderColor: '#222'}} />
                <div>
                  {order.items?.map((item, i) => (
                    <div key={i}>{item.name} — {item.price} грн</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}


      {/* --- ВКЛАДКА 2: КОРИСТУВАЧІ ТА ЇХ ПРОФІЛІ --- */}
      {activeTab === 'users' && (
        <div style={{ background: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          
          {selectedUser ? (
            /* КАБІНЕТ КЛІЄНТА (ДЕТАЛІ) */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#ff4500', fontFamily: 'Oswald', margin: 0 }}>ПРОФІЛЬ КЛІЄНТА</h2>
                <button 
                  onClick={() => setSelectedUser(null)} 
                  style={{ background: 'none', color: '#fff', border: '1px solid #fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  ⬅ Назад до списку
                </button>
              </div>

              {loadingDetails ? <p>Завантаження даних...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img 
                      src={selectedUser.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                      alt="Аватар" 
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff4500' }} 
                    />
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>{selectedUser.displayName || selectedUser.name || 'Без імені'}</h3>
                      <span style={{ background: selectedUser.role === 'admin' ? '#ff4500' : '#333', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {selectedUser.role === 'admin' ? 'АДМІН' : 'КЛІЄНТ'}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ background: '#000', padding: '15px', borderRadius: '5px', border: '1px solid #222' }}>
                    <p style={{ margin: '5px 0' }}><strong>ID:</strong> <span style={{ color: '#aaa' }}>{selectedUser.id}</span></p>
                    <p style={{ margin: '5px 0' }}><strong>Email:</strong> <span style={{ color: '#aaa' }}>{selectedUser.email}</span></p>
                    <p style={{ margin: '5px 0' }}><strong>Телефон:</strong> <span style={{ color: '#aaa' }}>{selectedUser.phone || 'Не вказано'}</span></p>
                    <p style={{ margin: '5px 0' }}><strong>Дата реєстрації:</strong> <span style={{ color: '#aaa' }}>
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleDateString() : 'Невідомо'}
                    </span></p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* СПИСОК УСІХ КОРИСТУВАЧІВ */
            <>
              <h2 style={{ color: '#ff4500', fontFamily: 'Oswald', marginTop: 0 }}>ВСІ КОРИСТУВАЧІ</h2>
              {loadingUsers ? <p>Завантаження користувачів...</p> : (
                <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
                  {users.length === 0 ? <p>Користувачів не знайдено.</p> : users.map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => handleUserClick(user.id)}
                      style={{ 
                        border: '1px solid #333', padding: '15px', borderRadius: '8px', background: '#000', 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0 }}>{user.email}</h4>
                        <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#888' }}>ID: {user.id}</p>
                      </div>
                      <span style={{ background: user.role === 'admin' ? '#ff4500' : '#222', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>
                        {user.role === 'admin' ? 'АДМІН' : 'КЛІЄНТ'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      )}

    </div>
  );
};

export default AdminPanel;