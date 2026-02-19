import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import './App.css';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
function App() {
  // 1. СТАНИ ДЛЯ ФОРМИ ЗАМОВЛЕННЯ
  // СТАНИ: РЕДАГУВАННЯ ТОВАРУ
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductForm, setEditProductForm] = useState({
    name: '', price: '', description: '', category: '', image: ''
  });
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // 2. ІНШІ СТАНИ (Кошик, Каталог)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Всі');
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // 3. СТАНИ ДЛЯ ТОВАРІВ (З FIREBASE)
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // 4. СТАНИ ДЛЯ АВТОРИЗАЦІЇ ТА ПРОФІЛЮ
  const [user, setUser] = useState(null); 
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Дані для редагування профілю
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // 5. СТАНИ ДЛЯ АДМІНКИ (ДОДАВАННЯ ТОВАРУ)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Взуття');
  const [newProductImage, setNewProductImage] = useState('');

  // 6. СТАНИ: ДЕТАЛІ ТОВАРУ ТА ВІДГУКИ
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [reviews, setReviews] = useState([]); 
  const [newReviewText, setNewReviewText] = useState(''); 
  const [newReviewRating, setNewReviewRating] = useState(5); 
  const [isLoadingReviews, setIsLoadingReviews] = useState(false); 

  // 7. СТАНИ: ПЕРЕГЛЯД ЗАМОВЛЕНЬ (АДМІН)
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [ordersList, setOrdersList] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // 8. СТАНИ: ПЕРЕГЛЯД КОРИСТУВАЧІВ (АДМІН)
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null); 
  const [loadingUserDetails, setLoadingUserDetails] = useState(false); 
const [selectedAdminUserOrders, setSelectedAdminUserOrders] = useState([]); 
  const [isLoadingAdminUserOrders, setIsLoadingAdminUserOrders] = useState(false);
  // 9. СТАНИ: ПЕРЕГЛЯД ВЛАСНИХ ЗАМОВЛЕНЬ (КОРИСТУВАЧ)
  const [userOrdersList, setUserOrdersList] = useState([]);
  const [isLoadingUserOrders, setIsLoadingUserOrders] = useState(false);

  // Хто у нас адмін:
  const ADMIN_EMAIL = "ilukrostik20@gmail.com"; 
  const isAdmin = user && user.email === ADMIN_EMAIL;

  const categories = ['Всі', 'Взуття', 'Одяг', 'Інвентар', 'Тренажери', 'Аксесуари'];

  const filteredProducts = products.filter(product => {
  // Перевірка категорії
  const matchesCategory = activeCategory === 'Всі' || product.category === activeCategory;
  // Перевірка пошуку
  const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
  
  return matchesCategory && matchesSearch;
});

  // Оновлений підрахунок суми з урахуванням кількості
const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  // --- ЕФЕКТИ ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserProfile(data);
          setEditName(data.displayName || '');
          setEditPhone(data.phone || '');
          setEditAvatar(data.photoURL || '');
          
          setName(data.displayName || '');
          setPhone(data.phone || '');
        }
      } else {
        setUserProfile(null);
      }
    });

    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map(doc => ({
          id: doc.id, 
          ...doc.data() 
        }));
        setProducts(productsArray); 
        setIsLoadingProducts(false); 
      } catch (error) {
        console.error("Помилка при завантаженні товарів:", error);
        setIsLoadingProducts(false);
      }
    };

    fetchProducts(); 
    return () => unsubscribe();
  }, []);

  // --- ФУНКЦІЇ АВТОРИЗАЦІЇ ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      let userCredential;
      if (isLoginMode) {
        userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        alert("Ви успішно увійшли!");
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        alert("Реєстрація успішна!");
      }

      const loggedInUser = userCredential.user;
      await setDoc(doc(db, "users", loggedInUser.uid), {
        email: loggedInUser.email,
        role: loggedInUser.email === ADMIN_EMAIL ? 'admin' : 'user',
        lastActivity: serverTimestamp()
      }, { merge: true });

      setIsAuthModalOpen(false); 
      setAuthEmail('');
      setAuthPassword('');
    } catch (error) {
      console.error("Помилка авторизації:", error);
      setAuthError("Помилка! Перевірте дані.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileModalOpen(false);
      alert("Ви вийшли з акаунта");
    } catch (error) {
      console.error("Помилка виходу:", error);
    }
  };

  // --- ФУНКЦІЇ ПРОФІЛЮ ---
  const handleOpenProfile = async () => {
    if (!user) return;
    setIsProfileModalOpen(true);
    setIsLoadingUserOrders(true);
    try {
      const q = query(collection(db, "orders"), where("customerEmail", "==", user.email));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      ordersData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setUserOrdersList(ordersData);
    } catch (error) {
      console.error("Помилка завантаження історії замовлень:", error);
    } finally {
      setIsLoadingUserOrders(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: editName,
        phone: editPhone,
        photoURL: editAvatar
      });
      setUserProfile({ ...userProfile, displayName: editName, phone: editPhone, photoURL: editAvatar });
      setName(editName);
      setPhone(editPhone);
      alert("✅ Дані профілю успішно оновлено!");
    } catch (error) {
      console.error(error);
      alert("Помилка при збереженні профілю.");
    }
  };

  // --- МАГАЗИН ТА КОШИК ---
  const handleOrder = async () => {
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        userName: name, phone: phone, address: address, total: totalPrice,
        items: cartItems.map(item => ({ name: item.name, price: item.price, quantity: item.quantity || 1 })),
        payment: paymentMethod, customerEmail: user ? user.email : "Гість",
        createdAt: serverTimestamp(),
        status: 'Нове'
      });
      alert(`Дякуємо, ${name}! Замовлення №${docRef.id.slice(0,5)} прийнято.`);
      setIsOrderFormOpen(false); setCartItems([]); setAddress('');
    } catch (e) {
      alert("Помилка! Не вдалося зберегти замовлення.");
    }
  };

// 1. Відкрити модалку з даними обраного товару
  const handleEditProductClick = (product) => {
    setEditingProductId(product.id);
    setEditProductForm({
      name: product.name || '',
      price: product.price || '',
      description: product.description || '',
      category: product.category || '',
      image: product.image || '' 
    });
    setIsEditProductModalOpen(true);
  };

  // 2. Зберегти зміни в Firebase
  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    if (!editingProductId) return;

    try {
      const productRef = doc(db, 'products', editingProductId);
      await updateDoc(productRef, {
        name: editProductForm.name,
        price: Number(editProductForm.price),
        description: editProductForm.description,
        category: editProductForm.category,
        image: editProductForm.image
      });

      // Оновлюємо товари на екрані без перезавантаження
      setProducts(prev => prev.map(p => 
        p.id === editingProductId ? { ...p, ...editProductForm, price: Number(editProductForm.price) } : p
      ));
      
      setIsEditProductModalOpen(false);
      setEditingProductId(null);
      alert('Товар успішно оновлено! ✅');
    } catch (error) {
      console.error("Помилка при редагуванні товару:", error);
      alert('Помилка при оновленні товару ❌');
    }
  };

  const addToCart = (product, e) => {
    if (e) e.stopPropagation(); 
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    
    // --- ВИКЛИКАЄМО НОВУ ПЛАШКУ ЗАМІСТЬ ALERT ---
    setToastMessage(`🛒 "${product.name}" додано в кошик!`);
    setTimeout(() => {
      setToastMessage(''); // Ховаємо через 3 секунди
    }, 3000);
  };

  const handleUpdateQuantity = (itemId, delta) => {
    setCartItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = (item.quantity || 1) + delta;
        // Кількість не може бути меншою за 1
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  // --- АДМІНКА: ДОДАВАННЯ/ВИДАЛЕННЯ ТОВАРУ ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      const docRef = await addDoc(collection(db, "products"), {
        name: newProductName, price: Number(newProductPrice), 
        category: newProductCategory, image: newProductImage, createdAt: serverTimestamp()
      });
      setProducts([...products, { id: docRef.id, name: newProductName, price: Number(newProductPrice), category: newProductCategory, image: newProductImage }]);
      alert("✅ Товар успішно додано!");
      setIsAddProductModalOpen(false); setNewProductName(''); setNewProductPrice(''); setNewProductImage(''); setNewProductCategory('Взуття');
    } catch (error) { alert("Помилка! Не вдалося додати товар."); }
  };

  const handleDeleteProduct = async (productId, e) => {
    e.stopPropagation(); 
    if (!isAdmin) return; 
    if (!window.confirm("🚨 Видалити цей товар?")) return;
    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts(products.filter(product => product.id !== productId));
      alert("🗑️ Товар видалено!");
    } catch (error) { alert("Помилка! Не вдалося видалити товар."); }
  };

  // --- АДМІНКА: ЗАМОВЛЕННЯ ТА КОРИСТУВАЧІ ---
  const handleOpenOrders = async () => {
    setIsOrdersModalOpen(true); setIsLoadingOrders(true);
    try {
      const snap = await getDocs(collection(db, "orders"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setOrdersList(data);
    } catch (error) { alert("Не вдалося завантажити замовлення."); } 
    finally { setIsLoadingOrders(false); }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!isAdmin) return;
    if (!window.confirm("🚨 Видалити це замовлення?")) return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
      setOrdersList(ordersList.filter(order => order.id !== orderId));
    } catch (error) { console.error(error); }
  };
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      // Оновлюємо статус у списку адміна миттєво
      setOrdersList(ordersList.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) { 
      console.error("Помилка при оновленні статусу", error); 
    }
  };

  const handleOpenUsers = async () => {
    setIsUsersModalOpen(true); setIsLoadingUsers(true); setSelectedAdminUser(null);
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsersList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {} 
    finally { setIsLoadingUsers(false); }
  };

  const handleAdminUserClick = async (userObj) => {
    setLoadingUserDetails(true);
    setIsLoadingAdminUserOrders(true);
    setSelectedAdminUserOrders([]); // Очищуємо попередні замовлення
    
    try {
      // 1. Завантажуємо свіжі дані користувача (аватарку, ім'я)
      const userDocRef = doc(db, 'users', userObj.id);
      const userDocSnap = await getDoc(userDocRef);
      let userData = userObj;
      if (userDocSnap.exists()) {
        userData = { id: userDocSnap.id, ...userDocSnap.data() };
      }
      setSelectedAdminUser(userData);

      // 2. Шукаємо всі замовлення, де email співпадає з email цього користувача
      const q = query(collection(db, "orders"), where("customerEmail", "==", userData.email));
      const ordersSnap = await getDocs(q);
      const ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Сортуємо від найновіших до найстаріших
      ordersData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setSelectedAdminUserOrders(ordersData);

    } catch (error) {
      console.error("Помилка завантаження деталей клієнта:", error);
    } finally {
      setLoadingUserDetails(false);
      setIsLoadingAdminUserOrders(false);
    }
  };

  // --- ДЕТАЛІ ТОВАРУ ТА ВІДГУКИ ---
  const openProductDetails = async (product) => {
    setSelectedProduct(product); setIsLoadingReviews(true);
    try {
      const q = query(collection(db, "reviews"), where("productId", "==", product.id));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {} 
    finally { setIsLoadingReviews(false); }
  };

  const closeProductDetails = () => { setSelectedProduct(null); setReviews([]); setNewReviewText(''); };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    const authorName = userProfile?.displayName || (user ? user.email.split('@')[0] : "Анонімний спортсмен"); 
    const reviewData = { productId: selectedProduct.id, author: authorName, text: newReviewText, rating: newReviewRating, createdAt: new Date().toISOString() };
    try {
      const docRef = await addDoc(collection(db, "reviews"), reviewData);
      setReviews([...reviews, { id: docRef.id, ...reviewData }]);
      setNewReviewText(''); setNewReviewRating(5);
    } catch (error) { alert("Не вдалося додати відгук."); }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!isAdmin) return;
    if (!window.confirm("🚨 Видалити цей відгук?")) return;
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      setReviews(reviews.filter(r => r.id !== reviewId));
      alert("🗑️ Відгук видалено!");
    } catch (error) {
      console.error("Помилка видалення відгуку:", error);
      alert("Помилка при видаленні.");
    }
  };

  const renderStars = (rating) => '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          VIGOR
          <svg className="logo-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ff0000" />
                <stop offset="50%" stopColor="#ff4d4d" />
                <stop offset="100%" stopColor="#ffea00" />
              </linearGradient>
            </defs>
            <path 
              d="M256 0c0 0-100 150-100 250c0 55 45 100 100 100s100-45 100-100c0-100-100-250-100-250zm0 310c-33 0-60-27-60-60c0-60 60-150 60-150s60 90 60 150c0 33-27 60-60 60z" 
              fill="url(#fireGradient)"
            />
            <path d="M190 400c-40-40-50-100-30-150c-30 40-40 90-30 140c10 50 50 90 100 100c-20-20-30-50-40-90z" fill="#ff4d4d" />
            <path d="M322 400c40-40 50-100 30-150c30 40 40 90 30 140c-10 50-50 90-100 100c20-20 30-50 40-90z" fill="#ff4d4d" />
          </svg>
        </div>
        <nav className="nav">
          <a href="#">Головна</a><a href="#catalog">Каталог</a><a href="#about">Про нас</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          {user ? (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {isAdmin && <span style={{ backgroundColor: '#ff9900', color: '#000', fontSize: '11px', fontWeight: 'bold', padding: '3px 6px', borderRadius: '4px' }}>АДМІН</span>}
              <div 
                onClick={handleOpenProfile}
                style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#222', cursor: 'pointer', overflow: 'hidden', border: '2px solid #ff4d4d', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s' }}
                title="Мій кабінет"
              >
                {editAvatar ? <img src={editAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" /> : <span style={{ fontSize: '18px' }}>👤</span>}
              </div>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }} onClick={handleOpenProfile}>
                {editName || user.email.split('@')[0]}
              </span>
              <button onClick={handleLogout} className="cta-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Вийти</button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="cta-button" style={{ padding: '8px 20px', fontSize: '14px' }}>УВІЙТИ</button>
          )}

          <button className="cart-btn-modern" onClick={() => setIsCartOpen(true)}>
            <div className="cart-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cart-svg">
                <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartItems.length > 0 && <span className="cart-badge">{cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}</span>}
            </div>
            <span className="cart-text">КОШИК</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-subtitle">Premium Sport Equipment</span>
          <h1>ПЕРЕВИЩУЙ СВОЇ<br/><span className="outline-text">МОЖЛИВОСТІ</span></h1>
          <p>Професійне екіпірування для тих, хто не шукає виправдань.</p>
          <div className="hero-btns">
            <a href="#catalog" className="cta-button">ДО КАТАЛОГУ</a>
            <a href="#about" className="cta-secondary">ПРО НАС</a>
          </div>
        </div>
      </section>

      {/* КАТАЛОГ */}
      <main id="catalog" className="catalog-section">
        <h2 className="section-title">Каталог товарів</h2>
        {/* ПОЛЕ ПОШУКУ */}
<div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
  <input
    type="text"
    placeholder="Пошук товару за назвою..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    style={{
      width: '100%',
      maxWidth: '400px',
      padding: '10px 20px',
      borderRadius: '20px',
      border: '1px solid #333',
      background: '#111',
      color: '#fff',
      outline: 'none'
    }}
  />
</div>
        <div className="category-filters">
          {categories.map(cat => (
            <button key={cat} className={`filter-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {isLoadingProducts ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#ff4d4d', fontSize: '20px' }}>Завантажуємо товари з хмари... ⏳</div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div className="product-card" key={product.id} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => openProductDetails(product)}>
                {isAdmin && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
  <button 
    onClick={(e) => { e.stopPropagation(); handleEditProductClick(product); }} 
    style={{ background: '#ff9900', color: '#111', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
  >
    ✏️ Редаг.
  </button>
  <button 
    onClick={(e) => handleDeleteProduct(product.id, e)} 
    style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
  >
    🗑️ Видалити
  </button>
</div>
                )}
                <div className="product-image-wrapper"><img src={product.image} alt={product.name} /></div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="category-tag">{product.category}</p>
                  <div className="product-footer">
                    <span className="price">{product.price} грн</span>
                    <button className="buy-btn" onClick={(e) => addToCart(product, e)}>Купити</button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && <p style={{ color: '#fff', gridColumn: '1 / -1', textAlign: 'center' }}>У цій категорії поки немає товарів.</p>}
          </div>
        )}
      </main>
    

      {/* АДМІН-ПАНЕЛЬ */}
      {isAdmin && (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 1000 }}>
          <button onClick={() => setIsAddProductModalOpen(true)} className="cta-button" style={{ padding: '12px', fontSize: '14px', boxShadow: '0 4px 15px rgba(255, 77, 77, 0.5)' }}>➕ ДОДАТИ ТОВАР</button>
          <button onClick={handleOpenOrders} className="cta-secondary" style={{ padding: '12px', fontSize: '14px', backgroundColor: '#111', color: '#fff', border: '1px solid #ff4d4d' }}>📦 ЗАМОВЛЕННЯ</button>
          <button onClick={handleOpenUsers} className="cta-secondary" style={{ padding: '12px', fontSize: '14px', backgroundColor: '#111', color: '#fff', border: '1px solid #ff4d4d' }}>👥 КОРИСТУВАЧІ</button>
        </div>
      )}

      {/* МОДАЛКА: АВТОРИЗАЦІЯ */}
      {isAuthModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%', padding: '25px' }}>
            <h2>{isLoginMode ? 'Вхід в акаунт' : 'Реєстрація'}</h2>
            <button className="close-modal" onClick={() => setIsAuthModalOpen(false)}>✕</button>
            {authError && <p style={{ color: '#ff4d4d', marginBottom: '15px', fontWeight: 'bold' }}>{authError}</p>}
            <form onSubmit={handleAuth} className="order-form">
              <div className="input-group">
                <label>Email</label>
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required placeholder="Введіть email" />
              </div>
              <div className="input-group">
                <label>Пароль</label>
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required placeholder="Введіть пароль" />
              </div>
              <button type="submit" className="confirm-order-btn" style={{ marginTop: '10px' }}>
                {isLoginMode ? 'УВІЙТИ' : 'ЗАРЕЄСТРУВАТИСЯ'}
              </button>
            </form>
            <p style={{ marginTop: '20px', textAlign: 'center', cursor: 'pointer', color: '#aaa', fontSize: '14px' }} onClick={() => setIsLoginMode(!isLoginMode)}>
              {isLoginMode ? 'Немає акаунту? ' : 'Вже є акаунт? '}
              <span style={{ color: '#ff4d4d', textDecoration: 'underline' }}>{isLoginMode ? 'Створити' : 'Увійти'}</span>
            </p>
          </div>
        </div>
      )}

      {/* МОДАЛКА: ДОДАТИ ТОВАР */}
      {isAddProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddProductModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', padding: '25px' }}>
            <h2>Додати новий товар</h2>
            <button className="close-modal" onClick={() => setIsAddProductModalOpen(false)}>✕</button>
            <form onSubmit={handleAddProduct} className="order-form">
              <div className="input-group">
                <label>Назва товару</label>
                <input type="text" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required placeholder="Наприклад: Кросівки Nike" />
              </div>
              <div className="input-group">
                <label>Ціна (грн)</label>
                <input type="number" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} required placeholder="2500" />
              </div>
              <div className="input-group">
                <label>Категорія</label>
                <select value={newProductCategory} onChange={(e) => setNewProductCategory(e.target.value)} style={{ padding: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #333', borderRadius: '5px' }}>
                  {categories.filter(c => c !== 'Всі').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>URL зображення (посилання)</label>
                <input type="url" value={newProductImage} onChange={(e) => setNewProductImage(e.target.value)} required placeholder="https://..." />
              </div>
              <button type="submit" className="confirm-order-btn" style={{ marginTop: '15px' }}>ДОДАТИ В КАТАЛОГ</button>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛКА: ПЕРЕГЛЯД ЗАМОВЛЕНЬ (АДМІН) */}
      {isOrdersModalOpen && (
        <div className="modal-overlay" onClick={() => setIsOrdersModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%', maxHeight: '85vh', overflowY: 'auto', padding: '25px' }}>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '15px' }}>📦 Всі замовлення клієнтів</h2>
            <button className="close-modal" onClick={() => setIsOrdersModalOpen(false)}>✕</button>
            {isLoadingOrders ? <p style={{ color: '#888', marginTop: '20px' }}>Завантаження замовлень...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                {ordersList.map(order => (
                  <div key={order.id} style={{ background: '#1a1a1a', padding: '15px', borderRadius: '10px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                      <strong style={{ fontSize: '18px', color: '#fff' }}>{order.userName} ({order.phone})</strong>
                      <span style={{ color: '#ff4d4d', fontWeight: 'bold', fontSize: '18px' }}>{order.total} грн</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
                      📍 {order.address} <br/> 
                      📧 {order.customerEmail} <br/>
                      💳 {order.payment === 'card' ? 'Картка' : 'Готівка'}
                    </p>
                    <ul style={{ fontSize: '14px', color: '#ccc', paddingLeft: '20px', background: '#111', padding: '10px 10px 10px 30px', borderRadius: '8px' }}>
                      {order.items?.map((item, i) => <li key={i} style={{ marginBottom: '5px' }}>{item.name} x{item.quantity || 1} — {item.price * (item.quantity || 1)} грн</li>)}
                    </ul>
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
  <span style={{ fontSize: '14px', color: '#aaa' }}>Статус:</span>
  <select 
    value={order.status || 'Нове'} 
    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
    style={{ padding: '6px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px', outline: 'none', cursor: 'pointer' }}
  >
    <option value="Нове">Нове</option>
    <option value="В обробці">В обробці</option>
    <option value="Відправлено">Відправлено</option>
    <option value="Виконано">Виконано</option>
    <option value="Скасовано">Скасовано</option>
  </select>
</div>
                    <button onClick={() => handleDeleteOrder(order.id)} style={{ marginTop: '15px', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                      🗑️ Видалити замовлення
                    </button>
                  </div>
                ))}
                {ordersList.length === 0 && <p style={{ color: '#888', textAlign: 'center' }}>Поки що немає жодного замовлення.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* МОДАЛКА: КОРИСТУВАЧІ (АДМІН) */}
      {isUsersModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUsersModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%', maxHeight: '85vh', overflowY: 'auto', padding: '25px' }}>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '15px' }}>👥 Зареєстровані користувачі</h2>
            <button className="close-modal" onClick={() => setIsUsersModalOpen(false)}>✕</button>
            
            {isLoadingUsers ? <p style={{ color: '#888', marginTop: '20px' }}>Завантаження списку...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', maxHeight: selectedAdminUser ? '200px' : '600px', overflowY: 'auto', paddingRight: '10px', transition: 'max-height 0.3s' }}>
                {usersList.map(u => (
                  <div key={u.id} style={{ background: '#1a1a1a', padding: '15px', borderRadius: '10px', border: selectedAdminUser?.id === u.id ? '1px solid #ff4d4d' : '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', transition: '0.2s' }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '16px' }}>{u.displayName || 'Без імені'}</strong>
                      <p style={{ fontSize: '14px', color: '#aaa', margin: '5px 0' }}>{u.email}</p>
                    </div>
                    <button onClick={() => handleAdminUserClick(u)} className="cta-secondary" style={{ padding: '8px 15px', fontSize: '12px' }}>
                      {loadingUserDetails && selectedAdminUser?.id === u.id ? 'Завантаження...' : 'Відкрити профіль'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Деталі обраного користувача */}
            {selectedAdminUser && (
               <div style={{ marginTop: '20px', padding: '25px', background: '#111', borderRadius: '15px', border: '1px dashed #444', position: 'relative' }}>
                 <button onClick={() => setSelectedAdminUser(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: '#222', border: 'none', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✕</button>
                 
                 <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                   
                   {/* Аватар та інфо */}
                   <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                       <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#222', overflow: 'hidden', border: '2px solid #ff4d4d', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         {selectedAdminUser.photoURL ? <img src={selectedAdminUser.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" /> : <div style={{ fontSize: '30px' }}>👤</div>}
                       </div>
                       <div>
                         <h3 style={{ color: '#fff', margin: '0 0 5px 0' }}>{selectedAdminUser.displayName || 'Не вказано'}</h3>
                         <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: selectedAdminUser.role === 'admin' ? '#ff9900' : '#333', color: selectedAdminUser.role === 'admin' ? '#000' : '#fff' }}>
                           {selectedAdminUser.role === 'admin' ? 'АДМІН' : 'КЛІЄНТ'}
                         </span>
                       </div>
                     </div>
                     
                     <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '10px' }}>
                       <p style={{ color: '#ccc', marginBottom: '8px', fontSize: '14px' }}><strong style={{ color: '#888' }}>Email:</strong><br/>{selectedAdminUser.email}</p>
                       <p style={{ color: '#ccc', marginBottom: '8px', fontSize: '14px' }}><strong style={{ color: '#888' }}>Телефон:</strong><br/>{selectedAdminUser.phone || 'Не вказано'}</p>
                     </div>
                   </div>

                   {/* Замовлення клієнта */}
                   <div style={{ flex: '2 1 350px' }}>
                     <h4 style={{ color: '#fff', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>📦 Історія замовлень ({selectedAdminUserOrders?.length || 0})</h4>
                     
                     {isLoadingAdminUserOrders ? (
                       <p style={{ color: '#888', fontSize: '14px' }}>Завантаження замовлень...</p>
                     ) : selectedAdminUserOrders?.length > 0 ? (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                         {selectedAdminUserOrders.map(order => (
                           <div key={order.id} style={{ background: '#1a1a1a', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                               <span style={{ color: '#aaa', fontSize: '12px' }}>ID: {order.id.slice(0, 8)}</span>
                               <strong style={{ color: '#ff4d4d', fontSize: '14px' }}>{order.total} грн</strong>
                             </div>
                             <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '5px' }}>
                               {order.items?.map(i => `${i.name} (x${i.quantity || 1})`).join(', ')}
                             </div>
                             <div style={{ fontSize: '11px', color: '#666' }}>
                               📍 {order.address} | 💳 {order.payment === 'card' ? 'Картка' : 'Готівка'}
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px dashed #333' }}>
                         <div style={{ fontSize: '30px', marginBottom: '10px' }}>🛒</div>
                         <p style={{ color: '#888', fontSize: '14px' }}>Цей користувач ще не робив замовлень.</p>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
            )}
          </div>
        </div>
      )}

{/* МОДАЛКА: РЕДАГУВАННЯ ТОВАРУ */}
      {isEditProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditProductModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '95%', padding: '25px' }}>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>✏️ Редагувати товар</h2>
            <button className="close-modal" onClick={() => setIsEditProductModalOpen(false)}>✕</button>
            
            <form onSubmit={handleSaveProductEdit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', marginBottom: '5px', display: 'block' }}>Назва товару</label>
                <input 
                  type="text" 
                  value={editProductForm.name} 
                  onChange={(e) => setEditProductForm({...editProductForm, name: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#888', marginBottom: '5px', display: 'block' }}>Ціна (грн)</label>
                  <input 
                    type="number" 
                    value={editProductForm.price} 
                    onChange={(e) => setEditProductForm({...editProductForm, price: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#888', marginBottom: '5px', display: 'block' }}>Категорія</label>
                  <input 
                    type="text" 
                    value={editProductForm.category} 
                    onChange={(e) => setEditProductForm({...editProductForm, category: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#888', marginBottom: '5px', display: 'block' }}>URL картинки</label>
                <input 
                  type="text" 
                  value={editProductForm.image} 
                  onChange={(e) => setEditProductForm({...editProductForm, image: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#888', marginBottom: '5px', display: 'block' }}>Опис</label>
                <textarea 
                  value={editProductForm.description} 
                  onChange={(e) => setEditProductForm({...editProductForm, description: e.target.value})} 
                  rows="4"
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" className="cta-primary" style={{ padding: '12px', marginTop: '10px', width: '100%' }}>
                💾 Зберегти зміни
              </button>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛКА: ПРОФІЛЬ ТА ІСТОРІЯ ЗАМОВЛЕНЬ */}
      {isProfileModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
            <div className="cart-header">
              <h2>Мій кабінет</h2>
              <button className="close-modal" onClick={() => setIsProfileModalOpen(false)}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginTop: '20px' }}>
              <div style={{ flex: '1 1 300px', background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #333' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#222', margin: '0 auto 15px', overflow: 'hidden', border: '3px solid #ff4d4d', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {editAvatar ? <img src={editAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" /> : <div style={{ fontSize: '50px' }}>👤</div>}
                  </div>
                  <p style={{ color: '#888', fontSize: '14px' }}>{user.email}</p>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="order-form">
                  <div className="input-group">
                    <label>Ім'я</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ваше ім'я" />
                  </div>
                  <div className="input-group">
                    <label>Телефон</label>
                    <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+380..." />
                  </div>
                  <div className="input-group">
                    <label>URL фото (Аватарка)</label>
                    <input type="url" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} placeholder="https://посилання-на-фото.jpg" />
                  </div>
                  <button type="submit" className="confirm-order-btn" style={{ marginBottom: '10px' }}>ЗБЕРЕГТИ ДАНІ</button>
                </form>
              </div>

              <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', color: '#fff' }}>📦 Мої замовлення</h3>
                {isLoadingUserOrders ? (
                  <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Завантаження...</p>
                ) : userOrdersList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px', marginTop: '15px' }}>
                    {userOrdersList.map(o => (
                      <div key={o.id} style={{ background: '#1a1a1a', padding: '15px', borderRadius: '10px', border: '1px solid #333' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #444', paddingBottom: '10px', marginBottom: '10px' }}>
                          <span style={{ color: '#aaa', fontSize: '13px' }}>ID: {o.id.slice(0, 8)}...</span>
                          <strong style={{ color: '#ff4d4d' }}>{o.total} грн</strong>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#ddd', fontSize: '14px' }}>
                          {o.items?.map((item, i) => <li key={i}>{item.name} x{item.quantity || 1} — {item.price * (item.quantity || 1)} грн</li>)}
                        </ul>
                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div style={{ fontSize: '13px', color: '#888' }}>
    📍 {o.address} | 💳 {o.payment === 'card' ? 'Картка' : 'Готівка'}
  </div>
  
  <span style={{ 
    padding: '4px 10px', 
    borderRadius: '12px', 
    fontSize: '11px', 
    fontWeight: 'bold', 
    backgroundColor: 
      (o.status === 'Виконано') ? 'rgba(76, 175, 80, 0.1)' : 
      (o.status === 'Відправлено') ? 'rgba(255, 152, 0, 0.1)' :
      (o.status === 'Скасовано') ? 'rgba(244, 67, 54, 0.1)' : 
      'rgba(33, 150, 243, 0.1)',
    color: 
      (o.status === 'Виконано') ? '#4caf50' : 
      (o.status === 'Відправлено') ? '#ff9800' :
      (o.status === 'Скасовано') ? '#f44336' : 
      '#2196f3',
    border: `1px solid ${
      (o.status === 'Виконано') ? '#4caf50' : 
      (o.status === 'Відправлено') ? '#ff9800' :
      (o.status === 'Скасовано') ? '#f44336' : 
      '#2196f3'
    }`
  }}>
    {o.status || 'Нове'}
  </span>
</div>
    `                   </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: '#111', borderRadius: '15px', border: '1px dashed #333', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '15px' }}>
                    <div style={{ fontSize: '50px', marginBottom: '15px', color: '#555' }}>🛒</div>
                    <h3 style={{ color: '#fff', marginBottom: '10px' }}>У ВАС ЩЕ НЕМАЄ ЗАМОВЛЕНЬ</h3>
                    <p style={{ color: '#888', marginBottom: '20px', fontSize: '14px' }}>Перейдіть до каталогу та зробіть першу покупку!</p>
                    <button className="cta-button" onClick={() => setIsProfileModalOpen(false)}>ДО КАТАЛОГУ</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА: ДЕТАЛІ ТОВАРУ ТА ВІДГУКИ */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeProductDetails} style={{ zIndex: 9000 }}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%', display: 'flex', flexWrap: 'wrap', gap: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="close-modal" onClick={closeProductDetails} style={{ position: 'absolute', top: '15px', right: '20px' }}>✕</button>
            <div style={{ flex: '1 1 300px' }}>
              <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', borderRadius: '15px', objectFit: 'cover', backgroundColor: '#fff' }} />
              <h2 style={{ marginTop: '20px', fontSize: '28px', color: '#fff' }}>{selectedProduct.name}</h2>
              <p style={{ color: '#ff4d4d', fontSize: '16px', fontWeight: 'bold', margin: '10px 0' }}>Категорія: {selectedProduct.category}</p>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginTop: '10px' }}>{selectedProduct.price} грн</div>
              {/* БЛОК З ОПИСОМ ТОВАРУ */}
{selectedProduct.description && (
  <p style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.5', margin: '15px 0' }}>
    {selectedProduct.description}
  </p>
)}
              <button className="cta-button" style={{ width: '100%', marginTop: '20px', padding: '15px', fontSize: '16px' }} onClick={() => { addToCart(selectedProduct); alert("Товар додано в кошик!"); }}>
                ДОДАТИ В КОШИК 🛒
              </button>
            </div>
            <div style={{ flex: '1 1 400px', backgroundColor: '#111', padding: '20px', borderRadius: '15px' }}>
              <h3 style={{ color: '#fff', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Відгуки клієнтів ({reviews.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                {isLoadingReviews ? (
                  <p style={{ color: '#888' }}>Завантажуємо відгуки...</p>
                ) : reviews.length === 0 ? (
                  <p style={{ color: '#888', fontStyle: 'italic' }}>Поки немає відгуків. Будьте першим!</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong style={{ color: '#ff4d4d' }}>{review.author}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <span style={{ fontSize: '16px', letterSpacing: '1px' }}>
                            {renderStars(review.rating)}
                          </span>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteReview(review.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                            >
                              ✕ Видалити
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5' }}>{review.text}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddReview} style={{ borderTop: '2px solid #333', paddingTop: '20px' }}>
                <h4 style={{ color: '#fff', marginBottom: '10px' }}>Залишити відгук</h4>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ color: '#888', marginRight: '10px' }}>Оцінка:</label>
                  <select value={newReviewRating} onChange={(e) => setNewReviewRating(Number(e.target.value))} style={{ padding: '5px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '5px' }}>
                    <option value="5">⭐⭐⭐⭐⭐ (Відмінно)</option>
                    <option value="4">⭐⭐⭐⭐ (Добре)</option>
                    <option value="3">⭐⭐⭐ (Нормально)</option>
                    <option value="2">⭐⭐ (Погано)</option>
                    <option value="1">⭐ (Жахливо)</option>
                  </select>
                </div>
                <textarea placeholder="Напишіть ваші враження..." value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#222', color: '#fff', resize: 'vertical', minHeight: '80px', marginBottom: '10px' }} required />
                <button type="submit" style={{ backgroundColor: '#333', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>ВІДПРАВИТИ ВІДГУК</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ПРО НАС */}
      <section id="about" style={{ padding: '100px 20px', backgroundColor: '#0a0a0a', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <span style={{ color: '#ff4d4d', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '14px', fontWeight: 'bold' }}>Історія VIGOR</span>
          <h2 style={{ fontSize: '42px', marginTop: '10px', marginBottom: '50px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Більше, ніж просто <span style={{ color: '#ff4d4d' }}>магазин</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div style={{ backgroundColor: '#161616', padding: '40px 30px', borderRadius: '20px', borderBottom: '4px solid #ff4d4d' }}>
              <div style={{ fontSize: '45px', marginBottom: '20px' }}>🏆</div>
              <h3 style={{ fontSize: '22px', marginBottom: '15px', fontWeight: '700' }}>Преміум якість</h3>
              <p style={{ color: '#a0a0a0', fontSize: '15px', lineHeight: '1.6' }}>Ми відбираємо лише найкраще екіпірування від світових брендів.</p>
            </div>
            <div style={{ backgroundColor: '#161616', padding: '40px 30px', borderRadius: '20px', borderBottom: '4px solid #ff4d4d' }}>
              <div style={{ fontSize: '45px', marginBottom: '20px' }}>⚡</div>
              <h3 style={{ fontSize: '22px', marginBottom: '15px', fontWeight: '700' }}>Швидкість</h3>
              <p style={{ color: '#a0a0a0', fontSize: '15px', lineHeight: '1.6' }}>Блискавична доставка по всій Україні.</p>
            </div>
            <div style={{ backgroundColor: '#161616', padding: '40px 30px', borderRadius: '20px', borderBottom: '4px solid #ff4d4d' }}>
              <div style={{ fontSize: '45px', marginBottom: '20px' }}>🤝</div>
              <h3 style={{ fontSize: '22px', marginBottom: '15px', fontWeight: '700' }}>Експертність</h3>
              <p style={{ color: '#a0a0a0', fontSize: '15px', lineHeight: '1.6' }}>Наша команда — це фанати спорту. Ми завжди готові допомогти.</p>
            </div>
          </div>
        </div>
      </section>

      {/* МОДАЛКА: КОШИК */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header"><h2>КОШИК</h2><button className="close-cart" onClick={() => setIsCartOpen(false)}>✕</button></div>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div className="cart-item-new" key={item.id}>
                  <img src={item.image} alt="" className="cart-item-img" />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <span>{item.price} грн x {item.quantity || 1}</span>
                  </div>
                  <button className="delete-item" onClick={() => removeFromCart(item.id)}>🗑️</button>
                  {/* БЛОК КЕРУВАННЯ КІЛЬКІСТЮ ТА ВИДАЛЕННЯ */}
<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
  
  {/* Кнопки + та - */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <button 
      onClick={() => handleUpdateQuantity(item.id, -1)}
      style={{ background: '#333', color: '#fff', border: '1px solid #555', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      -
    </button>
    <span style={{ color: '#fff', fontSize: '14px', minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>
      {item.quantity || 1}
    </span>
    <button 
      onClick={() => handleUpdateQuantity(item.id, 1)}
      style={{ background: '#ff4d4d', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      +
    </button>
  </div>

  {/* Кнопка видалення */}
  <button 
    onClick={() => removeFromCart(item.id)} 
    style={{ background: 'transparent', border: 'none', color: '#ff4d4d', fontSize: '18px', cursor: 'pointer', padding: '0' }}
    title="Видалити товар"
  >
    🗑️
  </button>

</div>
                </div>
              ))}
              {cartItems.length === 0 && <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>Кошик порожній 🦖</p>}
            </div>
            {cartItems.length > 0 && (
              <div className="cart-total-footer">
                <div className="total-row"><span>РАЗОМ:</span><span className="total-amount">{totalPrice} грн</span></div>
                <button className="checkout-btn-new" onClick={() => { setIsCartOpen(false); setIsOrderFormOpen(true); }}>ОФОРМИТИ ЗАМОВЛЕННЯ</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* МОДАЛКА: ФОРМА ЗАМОВЛЕННЯ */}
      {isOrderFormOpen && (
        <div className="modal-overlay" onClick={() => setIsOrderFormOpen(false)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '20px' }}>
            <div className="cart-header"><h2>Оформлення замовлення</h2><button className="close-modal" onClick={() => setIsOrderFormOpen(false)}>✕</button></div>
            <form className="order-form" onSubmit={(e) => { e.preventDefault(); handleOrder(); }}>
              <div className="input-group">
                <label>Ваше ім'я</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Номер телефону</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Адреса доставки</label>
                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Спосіб оплати</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="card">Картка</option>
                  <option value="cash">Готівка при отриманні</option>
                </select>
              </div>
              <button type="submit" className="confirm-order-btn" style={{ width: '100%', marginTop: '10px', padding: '15px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                ПІДТВЕРДИТИ ЗАМОВЛЕННЯ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer-modern">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo footer-logo-style">
              VIGOR
              <svg className="logo-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="fireGradientFooter" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#ff0000" />
                    <stop offset="50%" stopColor="#ff4d4d" />
                    <stop offset="100%" stopColor="#ffea00" />
                  </linearGradient>
                </defs>
                <path d="M256 0c0 0-100 150-100 250c0 55 45 100 100 100s100-45 100-100c0-100-100-250-100-250zm0 310c-33 0-60-27-60-60c0-60 60-150 60-150s60 90 60 150c0 33-27 60-60 60z" fill="url(#fireGradientFooter)" />
                <path d="M190 400c-40-40-50-100-30-150c-30 40-40 90-30 140c10 50 50 90 100 100c-20-20-30-50-40-90z" fill="#ff4d4d" />
                <path d="M322 400c40-40 50-100 30-150c30 40 40 90 30 140c-10 50-50 90-100 100c20-20 30-50 40-90z" fill="#ff4d4d" />
              </svg>
            </div>
            <p style={{ marginTop: '15px' }}>Твій шлях до нових вершин починається тут.</p>
          </div>
          
          <div className="footer-section">
            <h4>Контакти</h4>
            <p>📞 +380 96 941 01 96</p>
            <p>✉️ ilukrostik20@gmail.com</p>
            <p>📍 м. Коломия, вул. Спортивна, 1</p>
          </div>

          <div className="footer-section">
            <h4>Ми в соцмережах</h4>
            <div className="social-links">
              <span className="social-item">Instagram</span>
              <span className="social-item">Telegram</span>
              <span className="social-item">Facebook</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} VIGOR. Всі права захищені. 🦾</p>
        </div>
      </footer>
      {/* ПЛАШКА СПОВІЩЕННЯ (TOAST) З АНІМАЦІЄЮ */}
      {toastMessage && (
        <>
          <style>
            {`
              @keyframes slideUpFade {
                from { opacity: 0; transform: translateY(40px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
          <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            background: '#4caf50', 
            color: '#fff',
            padding: '15px 25px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
            zIndex: 9999,
            fontSize: '15px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideUpFade 0.4s ease-out forwards' /* <--- Ось тут додано анімацію */
          }}>
            {toastMessage}
          </div>
        </>
      )}
    </div>
  );
}

export default App;