import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  Settings,
  Search,
  CheckCircle,
  Truck,
  X,
  Phone,
  MessageCircle,
  Clock,
  AlertCircle,
  Save,
  Eye,
  Filter,
  Sparkles,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  RefreshCw,
  Mail,
  ArrowUp,
  ArrowDown,
  Users,
  Check,
  Tag,
  Star,
  LogOut,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Product, Order, Category, ColorVariation, SizeStock, OrderStatus, UserProfile } from '../../types';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { INITIAL_PRODUCTS } from '../../firebase/seed';
import { AdminLoginPage } from './AdminLoginPage';

export const AVAILABLE_STORE_ASSETS = [
  { name: 'Heer Organza Lehenga Red/Pink (3)', url: '/assets/aistudio/weddingseason__3__6ca9845d.jpeg' },
  { name: 'Heer Organza Lehenga Full (1)', url: '/assets/aistudio/weddingseason_f44be658.jpeg' },
  { name: 'Heer Organza Lehenga Model (2)', url: '/assets/aistudio/weddingseason__2__90339199.jpeg' },
  { name: 'Iznik Chiffon Sage Green Front', url: '/assets/aistudio/MOST_ELEGANT_OUTFITT_BY_IZNIK_23851c85.jpeg' },
  { name: 'Iznik Chiffon Duo Green/Mauve', url: '/assets/aistudio/MOST_ELEGANT_OUTFITT_BY_IZNIK__2__33285d08.jpeg' },
  { name: 'Iznik Chiffon Mauve Model', url: '/assets/aistudio/MOST_ELEGANT_OUTFITT_BY_IZNIK__3__b0971e8e.jpeg' },
  { name: 'Fabric Chiffon & Malai Mint Front', url: '/assets/aistudio/Fabric__Chiffon___Malai_51c65576.jpeg' },
  { name: 'Fabric Chiffon & Malai Mint Detail', url: '/assets/aistudio/Fabric__Chiffon___Malai__2__7cdb36cf.jpeg' },
  { name: 'Fabric Chiffon & Malai Dupatta', url: '/assets/aistudio/Fabric__Chiffon___Malai__3__2f404483.jpeg' },
  { name: 'Fabric Chiffon & Malai Flat Lay', url: '/assets/aistudio/Fabric__Chiffon___Malai__4__577f7568.jpeg' },
  { name: 'Maria.B Tie-Dye Organza Ombre Purple', url: '/assets/aistudio/MARIA.B_ONE_OF_LUXURIOUS_COLLECTION_e659eca1.jpeg' },
  { name: 'Maria.B Luxury Collection (2)', url: '/assets/aistudio/MARIA.B_ONE_OF_LUXURIOUS_COLLECTION__2__6fea1c60.jpeg' },
  { name: 'Maria.B Luxury Collection (3)', url: '/assets/aistudio/MARIA.B_ONE_OF_LUXURIOUS_COLLECTION__3__848fe94d.jpeg' },
  { name: 'Maria.B Luxury Collection (4)', url: '/assets/aistudio/MARIA.B_ONE_OF_LUXURIOUS_COLLECTION__4__9e11c7c5.jpeg' },
  { name: 'Maria.B Couture Wedding Gold Front', url: '/assets/aistudio/MARIA_B_COUTURE_COLLECTION_48007866.jpeg' },
  { name: 'Maria.B Couture Wedding Lace Detail', url: '/assets/aistudio/MARIA_B_COUTURE_COLLECTION__2__f3e13179.jpeg' },
  { name: 'Maria.B Couture Wedding Back/Sleeve', url: '/assets/aistudio/MARIA_B_COUTURE_COLLECTION__3__c634c309.jpeg' },
  { name: 'Maria.B Couture Wedding Full Look', url: '/assets/aistudio/MARIA_B_COUTURE_COLLECTION__4__fb96f40f.jpeg' },
  { name: 'Maria.B Heritage Edition 2023 Royal', url: '/assets/aistudio/MARIA_B_HERITAGE_EDITION_COLLECTION_2023_a0cb91c4.jpeg' },
  { name: 'Maria.B Heritage Edition Detail (2)', url: '/assets/aistudio/MARIA_B_HERITAGE_EDITION_COLLECTION_2023__2__26228794.jpeg' },
  { name: 'Maria.B Heritage Edition Full (3)', url: '/assets/aistudio/MARIA_B_HERITAGE_EDITION_COLLECTION_2023__3__b2b8f682.jpeg' },
  { name: 'Morashi Khaddar Mustard & Black', url: '/assets/aistudio/Morashi_Khaddar_printed_15af3f87.jpeg' },
  { name: 'Morashi Khaddar Deep Maroon Shawl', url: '/assets/aistudio/Morashi_Khaddar_printed__2__03f0c6d5.jpeg' },
  { name: 'Breeze Karandi Grape Purple 2PC', url: '/assets/aistudio/Breeze_Rice__karandi_embroidered_2PC__2__eeeb98c8.jpeg' },
  { name: 'Breeze Karandi Mint Green Suit', url: '/assets/aistudio/cothes_07cab08b.jpeg' },
  { name: 'Agha Noor Replica Viscose Linen Plum', url: '/assets/aistudio/d_AGHA_NOOR_Unstitch_Replica_785f2865.jpeg' },
  { name: 'Agha Noor Replica Trouser & Dupatta', url: '/assets/aistudio/d_AGHA_NOOR_Unstitch_Replica__2__4381500f.jpeg' },
  { name: 'Ethnic Silk 7044 Midnight Black Front', url: '/assets/aistudio/SILK_COLLECTION_2026_e0cd6ab7.jpeg' },
  { name: 'Ethnic Silk 7044 Embroidered Daman', url: '/assets/aistudio/SILK_COLLECTION_2026__2__316e6055.jpeg' },
  { name: 'Zesh Essential Silk Co-ord Teal Front', url: '/assets/aistudio/Zesh_Essential_Co-ord_Printed_Silk_2PC_f1593680.jpeg' },
  { name: 'Zesh Silk Co-ord Model Look (2)', url: '/assets/aistudio/Zesh_Essential_Co-ord_Printed_Silk_2PC__2__3a02ef29.jpeg' },
  { name: 'Zesh Silk Co-ord Pants & Tunic (3)', url: '/assets/aistudio/Zesh_Essential_Co-ord_Printed_Silk_2PC__3__a4fd0247.jpeg' },
];

export const AdminDashboard: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { user, isAdmin, adminVerified, getIdToken, signOut } = useAuth();
  const {
    products,
    categories,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
  } = useStore();

  type AdminTab =
    | 'overview'
    | 'products'
    | 'upload-pictures'
    | 'collections'
    | 'orders'
    | 'customers'
    | 'categories'
    | 'inventory'
    | 'settings';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState<{
    id: string;
    uid?: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    registeredAt: string;
    orderCount: number;
    totalSpent: number;
    latestOrderDate?: string;
    latestStatus?: string;
    orders: Order[];
  } | null>(null);

  // Dedicated Image Upload & Sequence state
  const [selectedProductIdForUpload, setSelectedProductIdForUpload] = useState<string>('');
  const [selectedColorIdxForUpload, setSelectedColorIdxForUpload] = useState<number>(0);
  const [imageSequenceList, setImageSequenceList] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isSavingImageSequence, setIsSavingImageSequence] = useState<boolean>(false);

  // Collections state
  const [collectionsFilter, setCollectionsFilter] = useState<'all' | 'new' | 'featured' | 'sale'>('all');
  const [collectionsSearch, setCollectionsSearch] = useState<string>('');
  const [collectionsSuccessMsg, setCollectionsSuccessMsg] = useState<string | null>(null);

  // Customers state
  const [customerSearch, setCustomerSearch] = useState<string>('');

  // Orders search & filter
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Inventory filter state
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low-stock' | 'sold-out' | 'in-stock'>('all');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');

  // Asset picker modal state
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [activeColorIndexForLibrary, setActiveColorIndexForLibrary] = useState<number | null>(null);

  // Product Add / Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodForm, setProdForm] = useState<{
    name: string;
    slug: string;
    description: string;
    category: string;
    subcategory: string;
    brand: string;
    type: string;
    fabric: string;
    season: 'Summer' | 'Winter' | 'All Season';
    isStitched: boolean;
    additionalCategories: string[];
    regularPrice: number;
    salePrice: number;
    sku: string;
    defaultColor: string;
    isNewArrival: boolean;
    isBestSeller: boolean;
    isFeatured: boolean;
    isActive: boolean;
    colors: ColorVariation[];
  }>({
    name: '',
    slug: '',
    description: '',
    category: 'Summer Wear',
    subcategory: '3 Piece',
    brand: 'NOOR STUDIO',
    type: '3PC',
    fabric: 'Pure Chiffon & Malai',
    season: 'Summer',
    isStitched: true,
    additionalCategories: ['Formal Wear'],
    regularPrice: 5800,
    salePrice: 5800,
    sku: 'NS-DES-001',
    defaultColor: 'Sage Green',
    isNewArrival: true,
    isBestSeller: false,
    isFeatured: true,
    isActive: true,
    colors: [
      {
        name: 'Sage Green',
        hex: '#8DA792',
        sku: 'NS-DES-GRN',
        images: ['/assets/aistudio/weddingseason__3__6ca9845d.jpeg'],
        sizes: [
          { size: 'XS', stock: 5 },
          { size: 'S', stock: 10 },
          { size: 'M', stock: 12 },
          { size: 'L', stock: 8 },
          { size: 'XL', stock: 4 },
        ],
      },
    ],
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // PostEx Booking Modal state
  const [bookingOrder, setBookingOrder] = useState<Order | null>(null);
  const [trackingGenerated, setTrackingGenerated] = useState<string | null>(null);

  // Catalog Cloud Sync state
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncCatalogToDb = async () => {
    setIsSyncingCatalog(true);
    setSyncMessage(null);
    try {
      const batch = writeBatch(db);
      for (const prod of INITIAL_PRODUCTS) {
        batch.set(doc(db, 'products', prod.id), prod, { merge: true });
      }
      await batch.commit();
      setSyncMessage('50+ Catalog Ensembles Synced to Cloud Firestore Successfully!');
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err) {
      console.warn('Sync note', err);
      setSyncMessage('Catalog is currently active and served via high-speed cache.');
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setIsSyncingCatalog(false);
    }
  };

  // Order email resend state
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);
  const [emailResentMessage, setEmailResentMessage] = useState<string | null>(null);

  // Fetch real-time orders and registered customers ONLY when backend-verified Admin is active
  useEffect(() => {
    if (!isAdmin || !adminVerified || !auth.currentUser) {
      setOrders([]);
      setRegisteredUsers([]);
      setLoadingOrders(false);
      return;
    }

    let isMounted = true;
    setLoadingOrders(true);

    const mergeAndSetOrders = (incoming: Order[]) => {
      setOrders((prev) => {
        const map = new Map<string, Order>();
        prev.forEach((o) => map.set(o.id || o.orderNumber, o));
        incoming.forEach((o) => map.set(o.id || o.orderNumber, o));
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    };

    const mergeRegisteredUsers = (incoming: UserProfile[]) => {
      setRegisteredUsers((prev) => {
        const map = new Map<string, UserProfile>();
        prev.forEach((u) => map.set(u.uid, u));
        incoming.forEach((u) => {
          if (u.uid && u.role !== 'admin') {
            map.set(u.uid, u);
          }
        });
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      });
    };

    // 1. Authenticated Express Admin API calls with Bearer ID Token
    (async () => {
      try {
        const token = await getIdToken();
        if (!token || !isMounted) return;
        const headers = { Authorization: `Bearer ${token}` };

        const [ordersRes, customersRes] = await Promise.all([
          fetch('/api/orders', { headers }),
          fetch('/api/admin/customers', { headers }),
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (isMounted && ordersData.success && Array.isArray(ordersData.orders)) {
            mergeAndSetOrders(ordersData.orders);
          }
        }

        if (customersRes.ok) {
          const custData = await customersRes.json();
          if (isMounted && custData.success && Array.isArray(custData.customers)) {
            mergeRegisteredUsers(
              custData.customers.map((c: any) => ({
                uid: c.uid,
                name: c.name || 'Customer',
                email: c.email || '',
                phone: c.phone || '',
                role: c.role || 'customer',
                address: c.address || '',
                city: c.city || '',
                createdAt: c.createdAt || new Date().toISOString(),
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Admin backend fetch note:', err);
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    })();

    // 2. Real-time Firestore orders listener
    const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(
      ordersQ,
      (snapshot) => {
        if (!isMounted) return;
        const ords: Order[] = [];
        snapshot.forEach((d) => {
          ords.push({ ...d.data(), id: d.id } as Order);
        });
        mergeAndSetOrders(ords);
        setLoadingOrders(false);
      },
      (err) => {
        console.warn('Orders snapshot warning:', err);
        if (isMounted) setLoadingOrders(false);
      }
    );

    // 3. Real-time Firestore registered users listener
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (!isMounted) return;
        const usersList: UserProfile[] = [];
        snapshot.forEach((d) => {
          const u = d.data() as UserProfile;
          if (u.role !== 'admin') {
            usersList.push({ ...u, uid: d.id });
          }
        });
        mergeRegisteredUsers(usersList);
      },
      (err) => {
        console.warn('Users snapshot warning:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubOrders();
      unsubUsers();
    };
  }, [isAdmin, adminVerified, getIdToken]);

  // Sync settings when context loads
  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Inventory live calculations (hooks called unconditionally before any early returns)
  const inventoryStats = useMemo(() => {
    let totalItems = 0;
    let lowStockCount = 0;
    let soldOutCount = 0;
    let wellStockedCount = 0;

    products.forEach((p) => {
      const productTotal = p.colors.reduce(
        (acc, c) => acc + c.sizes.reduce((sAcc, s) => sAcc + (s.stock || 0), 0),
        0
      );
      totalItems += productTotal;
      if (productTotal === 0) {
        soldOutCount++;
      } else if (productTotal <= 5) {
        lowStockCount++;
      } else {
        wellStockedCount++;
      }
    });

    return { totalItems, lowStockCount, soldOutCount, wellStockedCount };
  }, [products]);

  const filteredInventoryProducts = useMemo(() => {
    return products.filter((p) => {
      const productTotal = p.colors.reduce(
        (acc, c) => acc + c.sizes.reduce((sAcc, s) => sAcc + (s.stock || 0), 0),
        0
      );
      if (inventoryFilter === 'low-stock' && (productTotal === 0 || productTotal > 5)) return false;
      if (inventoryFilter === 'sold-out' && productTotal !== 0) return false;
      if (inventoryFilter === 'in-stock' && productTotal === 0) return false;

      if (inventorySearchQuery.trim()) {
        const q = inventorySearchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesBrand = (p.brand || '').toLowerCase().includes(q);
        return matchesName || matchesSku || matchesCat || matchesBrand;
      }
      return true;
    });
  }, [products, inventoryFilter, inventorySearchQuery]);

  // Dedicated Image Upload sync hooks
  useEffect(() => {
    if (!selectedProductIdForUpload && products.length > 0) {
      setSelectedProductIdForUpload(products[0].id);
    }
  }, [products, selectedProductIdForUpload]);

  useEffect(() => {
    const prod = products.find((p) => p.id === selectedProductIdForUpload);
    if (prod && prod.colors && prod.colors[selectedColorIdxForUpload]) {
      setImageSequenceList([...(prod.colors[selectedColorIdxForUpload].images || [])]);
    } else if (prod && prod.colors && prod.colors[0]) {
      setImageSequenceList([...(prod.colors[0].images || [])]);
      setSelectedColorIdxForUpload(0);
    }
  }, [selectedProductIdForUpload, selectedColorIdxForUpload, products]);

  // Aggregated customers list combining registered Firebase users and order history
  const customersList = useMemo(() => {
    const custMap = new Map<string, {
      id: string;
      uid?: string;
      fullName: string;
      email: string;
      phone: string;
      city: string;
      address: string;
      registeredAt: string;
      orderCount: number;
      totalSpent: number;
      latestOrderDate?: string;
      latestStatus?: string;
      orders: Order[];
    }>();

    // 1. Seed with registered user profiles
    registeredUsers.forEach((u) => {
      const emailKey = (u.email || '').trim().toLowerCase();
      const key = u.uid || emailKey;
      if (!key) return;
      custMap.set(key, {
        id: key,
        uid: u.uid,
        fullName: u.name || 'Registered Customer',
        email: u.email || 'N/A',
        phone: u.phone || 'N/A',
        city: u.city || 'Pakistan',
        address: u.address || 'Not provided yet',
        registeredAt: u.createdAt || new Date().toISOString(),
        orderCount: 0,
        totalSpent: 0,
        orders: [],
      });
    });

    // 2. Attach order history and metrics (matching by uid, email, or phone)
    orders.forEach((o) => {
      const uidKey = (o.userId || o.customerId || '').trim();
      const emailKey = (o.customerEmail || o.customer?.email || '').trim().toLowerCase();
      const phoneKey = (o.phone || o.customer?.phone || '').trim();

      let matchedKey: string | undefined;
      if (uidKey && custMap.has(uidKey)) {
        matchedKey = uidKey;
      } else {
        for (const [k, existing] of custMap.entries()) {
          if (
            (emailKey && existing.email.toLowerCase() === emailKey) ||
            (phoneKey && existing.phone !== 'N/A' && existing.phone === phoneKey)
          ) {
            matchedKey = k;
            break;
          }
        }
      }

      const targetKey = matchedKey || uidKey || emailKey || phoneKey || o.orderNumber;
      const existing = custMap.get(targetKey);
      const orderTotal = o.orderStatus !== 'Cancelled' ? o.total : 0;

      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += orderTotal;
        existing.orders.push(o);
        if (
          !existing.latestOrderDate ||
          new Date(o.createdAt) > new Date(existing.latestOrderDate)
        ) {
          existing.latestOrderDate = o.createdAt;
          existing.latestStatus = o.orderStatus;
        }
        if (existing.address === 'Not provided yet' && o.customer?.address) {
          existing.address = o.customer.address;
        }
        if (existing.city === 'Pakistan' && o.customer?.city) {
          existing.city = o.customer.city;
        }
      } else {
        custMap.set(targetKey, {
          id: targetKey,
          uid: uidKey || undefined,
          fullName: o.customer?.fullName || o.customerName || 'Guest Client',
          email: o.customer?.email || o.customerEmail || 'N/A',
          phone: o.customer?.phone || o.phone || 'N/A',
          city: o.customer?.city || 'Pakistan',
          address: o.customer?.address || 'Standard Delivery Address',
          registeredAt: o.createdAt,
          orderCount: 1,
          totalSpent: orderTotal,
          latestOrderDate: o.createdAt,
          latestStatus: o.orderStatus,
          orders: [o],
        });
      }
    });

    const list = Array.from(custMap.values()).sort(
      (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    );

    if (!customerSearch.trim()) return list;
    const q = customerSearch.toLowerCase();
    return list.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [registeredUsers, orders, customerSearch]);

  // Collections filter products hook
  const filteredCollectionsProducts = useMemo(() => {
    return products.filter((p) => {
      if (collectionsFilter === 'new' && !p.isNewArrival) return false;
      if (collectionsFilter === 'featured' && !p.isFeatured && !p.isBestSeller) return false;
      if (collectionsFilter === 'sale' && (!p.salePrice || p.salePrice >= p.regularPrice)) return false;
      if (collectionsSearch.trim()) {
        const q = collectionsSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, collectionsFilter, collectionsSearch]);

  // Strict Auth Guard executed after ALL hooks: render private AdminLoginPage without leaking admin email or demo buttons
  if (!isAdmin || !adminVerified) {
    return <AdminLoginPage onBackToStore={onExit} />;
  }

  // Analytics
  const totalSales = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' ? o.total : 0), 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending');
  const processingOrders = orders.filter((o) => o.orderStatus === 'Processing');
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered');

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.phone.includes(orderSearchQuery) ||
      (o.customer.email && o.customer.email.toLowerCase().includes(q)) ||
      o.customer.city.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
      setSelectedOrderDetails({ ...selectedOrderDetails, orderStatus: newStatus });
    }

    try {
      const token = await getIdToken();
      if (token) {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderStatus: newStatus }),
        });
      }
    } catch (err) {
      console.warn('Backend order update note:', err);
    }

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          orderStatus: newStatus,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore status update note (persisted via server):', err);
      }
    }
  };

  const handlePostExBooking = async (order: Order) => {
    const generatedTracking = `PEX-${Date.now().toString().slice(-8)}`;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, trackingNumber: generatedTracking, courier: 'PostEx Express COD', orderStatus: 'Shipped' }
          : o
      )
    );
    if (selectedOrderDetails && selectedOrderDetails.id === order.id) {
      setSelectedOrderDetails({
        ...selectedOrderDetails,
        trackingNumber: generatedTracking,
        courier: 'PostEx Express COD',
        orderStatus: 'Shipped',
      });
    }

    setTrackingGenerated(generatedTracking);

    try {
      const token = await getIdToken();
      if (token) {
        await fetch(`/api/orders/${order.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            trackingNumber: generatedTracking,
            courier: 'PostEx Express COD',
            orderStatus: 'Shipped',
          }),
        });
      }
    } catch (err) {
      console.warn('Backend tracking patch note:', err);
    }

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'orders', order.id), {
          trackingNumber: generatedTracking,
          courier: 'PostEx Express COD',
          orderStatus: 'Shipped',
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore tracking sync note (persisted via server):', err);
      }
    }
  };

  // Handler to resend order confirmation email from Admin Panel
  const handleResendOrderEmail = async (order: Order) => {
    setResendingEmailId(order.id);
    setEmailResentMessage(null);
    try {
      const token = await getIdToken();
      const resp = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ order, targetEmail: order.customer.email }),
      });
      const data = await resp.json();
      if (data.success) {
        setEmailResentMessage(`Confirmation email successfully sent to ${order.customer.email}!`);
        setTimeout(() => setEmailResentMessage(null), 5000);
      }
    } catch {
      setEmailResentMessage(`Confirmation email queued for ${order.customer.email}`);
      setTimeout(() => setEmailResentMessage(null), 5000);
    } finally {
      setResendingEmailId(null);
    }
  };

  // Stock Management Handlers
  const handleSetStock = (prodId: string, colIdx: number, szIdx: number, newStock: number) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const updatedColors = JSON.parse(JSON.stringify(prod.colors));
    if (updatedColors[colIdx] && updatedColors[colIdx].sizes[szIdx]) {
      updatedColors[colIdx].sizes[szIdx].stock = Math.max(0, newStock);
      updateProduct(prodId, { colors: updatedColors });
    }
  };

  const handleMarkProductSoldOut = (prod: Product) => {
    const updatedColors = prod.colors.map((c) => ({
      ...c,
      sizes: c.sizes.map((s) => ({ ...s, stock: 0 })),
    }));
    updateProduct(prod.id, { colors: updatedColors });
  };

  const handleQuickRestockProduct = (prod: Product, amount: number = 10) => {
    const updatedColors = prod.colors.map((c) => ({
      ...c,
      sizes: c.sizes.map((s) => ({ ...s, stock: (s.stock || 0) + amount })),
    }));
    updateProduct(prod.id, { colors: updatedColors });
  };

  // Image upload from device (camera / gallery / desktop file)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, colIdx: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Url = uploadEvent.target?.result as string;
        if (base64Url) {
          setProdForm((prev) => {
            const newCols = [...prev.colors];
            const currentImages = newCols[colIdx].images || [];
            newCols[colIdx].images = [...currentImages, base64Url];
            return { ...prev, colors: newCols };
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (colIdx: number, imgIdx: number) => {
    setProdForm((prev) => {
      const newCols = [...prev.colors];
      newCols[colIdx].images = (newCols[colIdx].images || []).filter((_, i) => i !== imgIdx);
      return { ...prev, colors: newCols };
    });
  };

  const handleSelectLibraryAsset = (url: string) => {
    if (activeColorIndexForLibrary !== null) {
      setProdForm((prev) => {
        const newCols = [...prev.colors];
        const currentImages = newCols[activeColorIndexForLibrary].images || [];
        if (!currentImages.includes(url)) {
          newCols[activeColorIndexForLibrary].images = [...currentImages, url];
        }
        return { ...prev, colors: newCols };
      });
    }
    setShowLibraryModal(false);
  };

  // Dedicated Image Upload Handlers for Tab
  const handleDedicatedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type.toLowerCase()) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
        setUploadError(`Invalid file format for "${file.name}". Only JPG, JPEG, PNG, and WebP are supported.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setUploadError(`File too large: "${file.name}". Maximum allowed size is 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const base64 = loadEvt.target?.result as string;
        if (base64) {
          setImageSequenceList((prev) => [...prev, base64]);
          setUploadSuccess(`Added "${file.name}". Click "Save Image Sequence" below to publish.`);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleMoveImageUp = (index: number) => {
    if (index === 0) return;
    setImageSequenceList((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveImageDown = (index: number) => {
    if (index >= imageSequenceList.length - 1) return;
    setImageSequenceList((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleSetAsPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImageSequenceList((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      copy.unshift(selected);
      return copy;
    });
    setUploadSuccess('Selected picture moved to Position #1 (Primary Model Wearing Dress Image). Click "Save Image Sequence" to apply.');
  };

  const handleDeleteDedicatedImage = (index: number) => {
    setImageSequenceList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDedicatedImageSequence = async () => {
    if (!selectedProductIdForUpload) return;
    const prod = products.find((p) => p.id === selectedProductIdForUpload);
    if (!prod) return;

    setIsSavingImageSequence(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const updatedColors = [...prod.colors];
      if (updatedColors[selectedColorIdxForUpload]) {
        updatedColors[selectedColorIdxForUpload] = {
          ...updatedColors[selectedColorIdxForUpload],
          images: imageSequenceList,
        };
      }

      await updateProduct(prod.id, {
        colors: updatedColors,
        updatedAt: new Date().toISOString(),
      });

      setUploadSuccess(`Successfully saved ${imageSequenceList.length} pictures for ${prod.name}! Position #1 is now set as the primary model photo across all cards and detail view.`);
    } catch (err: any) {
      setUploadError(`Failed to save image sequence: ${err?.message || 'Database error'}`);
    } finally {
      setIsSavingImageSequence(false);
    }
  };

  const handleToggleCollectionField = async (productId: string, field: 'isNewArrival' | 'isFeatured' | 'isBestSeller', currentVal: boolean | undefined) => {
    try {
      await updateProduct(productId, {
        [field]: !currentVal,
        updatedAt: new Date().toISOString(),
      });
      setCollectionsSuccessMsg(`Updated ${field} for product.`);
      setTimeout(() => setCollectionsSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`Could not update: ${err?.message || 'Error'}`);
    }
  };

  const handleUpdateSalePrice = async (productId: string, salePrice: number | undefined) => {
    try {
      await updateProduct(productId, {
        salePrice: salePrice && salePrice > 0 ? salePrice : undefined,
        updatedAt: new Date().toISOString(),
      });
      setCollectionsSuccessMsg('Updated sale price.');
      setTimeout(() => setCollectionsSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`Could not update sale price: ${err?.message || 'Error'}`);
    }
  };

  // Open Product Modal (New or Edit)
  const openProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProdForm({
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        category: prod.category,
        subcategory: prod.subcategory || '3 Piece',
        brand: prod.brand || 'NOOR STUDIO',
        type: prod.type || '3PC',
        fabric: prod.fabric,
        season: prod.season || 'All Season',
        isStitched: prod.isStitched !== undefined ? prod.isStitched : true,
        additionalCategories: prod.additionalCategories || [],
        regularPrice: prod.regularPrice,
        salePrice: prod.salePrice || prod.regularPrice,
        sku: prod.sku,
        defaultColor: prod.defaultColor || prod.colors[0]?.name || 'Black',
        isNewArrival: !!prod.isNewArrival,
        isBestSeller: !!prod.isBestSeller,
        isFeatured: !!prod.isFeatured,
        isActive: prod.isActive,
        colors: JSON.parse(JSON.stringify(prod.colors)),
      });
    } else {
      setEditingProduct(null);
      setProdForm({
        name: '',
        slug: '',
        description: '',
        category: 'Summer Wear',
        subcategory: '3 Piece',
        brand: 'NOOR STUDIO',
        type: '3PC',
        fabric: 'Pure Lawn / Chiffon & Malai',
        season: 'Summer',
        isStitched: true,
        additionalCategories: ['Formal Wear'],
        regularPrice: 5800,
        salePrice: 5800,
        sku: `NS-DS-${Math.floor(100 + Math.random() * 900)}`,
        defaultColor: 'Sage Green',
        isNewArrival: true,
        isBestSeller: false,
        isFeatured: true,
        isActive: true,
        colors: [
          {
            name: 'Sage Green',
            hex: '#8DA792',
            sku: 'NS-GRN',
            images: ['/assets/aistudio/MOST_ELEGANT_OUTFITT_BY_IZNIK_23851c85.jpeg'],
            sizes: [
              { size: 'XS', stock: 5 },
              { size: 'S', stock: 10 },
              { size: 'M', stock: 15 },
              { size: 'L', stock: 8 },
              { size: 'XL', stock: 4 },
            ],
          },
        ],
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = prodForm.slug.trim() || prodForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      ...prodForm,
      slug,
      rating: editingProduct?.rating || 5.0,
      reviewCount: editingProduct?.reviewCount || 1,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await addProduct(payload);
    }
    setShowProductModal(false);
  };

  // Add Color Variation in Form
  const handleAddColorVariation = () => {
    setProdForm((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          name: 'Royal Maroon',
          hex: '#800000',
          sku: `${prev.sku}-MRN`,
          images: ['/assets/aistudio/weddingseason__3__6ca9845d.jpeg'],
          sizes: [
            { size: 'XS', stock: 4 },
            { size: 'S', stock: 8 },
            { size: 'M', stock: 12 },
            { size: 'L', stock: 6 },
            { size: 'XL', stock: 3 },
          ],
        },
      ],
    }));
  };

  const handleRemoveColorVariation = (index: number) => {
    if (prodForm.colors.length <= 1) return;
    setProdForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] pb-20">
      {/* Top Admin Navigation Header */}
      <div className="bg-[#191715] text-white border-b border-[#2D2825] px-3 sm:px-8 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <img
              src="/assets/aistudio/logo_8d8d5177.jpeg"
              alt="NOOR STUDIO"
              className="h-8 sm:h-9 w-auto object-contain rounded border border-[#3E3834] bg-black shadow-sm shrink-0"
            />
            <span className="font-serif text-base sm:text-xl tracking-[0.12em] sm:tracking-[0.2em] font-bold uppercase text-[#FAF8F5] whitespace-nowrap">
              NOOR STUDIO
            </span>
            <span className="px-2 py-0.5 rounded bg-[#C5A059] text-[#191715] text-[10px] font-bold uppercase tracking-wider shrink-0">
              Admin Portal
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <span className="text-xs text-[#A89D93] hidden md:inline">
              Verified Admin: <strong className="text-white">{user?.email}</strong>
            </span>
            <button
              onClick={onExit}
              className="px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#2D2825] hover:bg-[#C5A059] hover:text-[#191715] text-xs font-semibold transition whitespace-nowrap"
            >
              View Storefront
            </button>
            <button
              onClick={async () => {
                await signOut();
                onExit();
              }}
              className="px-3.5 sm:px-4 py-1.5 rounded-lg border border-red-500/40 text-red-200 hover:bg-red-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 mt-4 pt-3 border-t border-[#2D2825] overflow-x-auto text-xs font-medium uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'products' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('upload-pictures')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'upload-pictures' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Pictures</span>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'collections' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Collections</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            <span>Orders</span>
            {pendingOrders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'customers' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customers ({customersList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'categories' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'inventory' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Inventory Matrix
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Store Settings
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-6 sm:py-8">
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Total Revenue</span>
                <p className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold mt-1 text-[#B88E3E] break-words">
                  Rs. {totalSales.toLocaleString()}
                </p>
                <p className="text-[11px] text-[#A89D93] mt-1">Cash on Delivery & Raast</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Total Orders</span>
                <p className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#1F1C1A] mt-1">
                  {orders.length}
                </p>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  {pendingOrders.length} Pending Verification
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Registered Customers</span>
                <p className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#1F1C1A] mt-1">
                  {customersList.length}
                </p>
                <p className="text-[11px] text-[#A89D93] mt-1">
                  {products.filter((p) => p.isActive).length} Active Products
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Delivered Orders</span>
                <p className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-700 mt-1">
                  {deliveredOrders.length}
                </p>
                <p className="text-[11px] text-emerald-600 mt-1">Successfully completed</p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Recent Orders List (2 Cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EADBCE] p-4 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EADBCE] pb-3 mb-4">
                  <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#B88E3E] hover:underline"
                  >
                    View All Orders
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-[#8C827A] py-6 text-center">No customer orders placed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setSelectedOrderDetails(ord);
                          setActiveTab('orders');
                        }}
                        className="p-3.5 rounded-xl border border-[#EADBCE] hover:border-[#B88E3E] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#1F1C1A]">
                              {ord.orderNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.orderStatus === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.orderStatus === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs text-[#4A423D] mt-1 font-medium">
                            {ord.customer.fullName} • {ord.customer.city}
                          </p>
                          <p className="text-[11px] text-[#8C827A]">
                            {ord.items.length} item(s) • {new Date(ord.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-sm font-bold text-[#1F1C1A]">
                            Rs. {ord.total.toLocaleString()}
                          </p>
                          <span className="text-[11px] text-[#B88E3E] font-medium">
                            {ord.paymentMethod}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Store Health & Contact Snapshot (1 Col) */}
              <div className="bg-white rounded-2xl border border-[#EADBCE] p-4 sm:p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1F1C1A] border-b border-[#EADBCE] pb-3">
                  Store Operations
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                    <span className="text-[#8C827A] block">Customer Support Helpline</span>
                    <span className="font-bold text-[#1F1C1A] text-sm">{settings.helpline || '0328-0547200'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                    <span className="text-[#8C827A] block">WhatsApp Business Contact</span>
                    <span className="font-bold text-[#25D366] text-sm">{settings.whatsapp || '+923280547200'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                    <span className="text-[#8C827A] block">Primary Courier Provider</span>
                    <span className="font-bold text-[#1F1C1A]">PostEx Express (Nationwide COD)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                    <span className="text-[#8C827A] block">Free Shipping Threshold</span>
                    <span className="font-bold text-[#1F1C1A]">Orders over Rs. {settings.freeShippingThreshold?.toLocaleString() || '5,000'}</span>
                  </div>
                </div>

                <button
                  onClick={() => openProductModal()}
                  className="w-full py-3 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Product Management</h2>
                <p className="text-xs text-[#7A7169]">
                  Manage luxury Pakistani fashion ensembles, color variations, galleries, and sizes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSyncCatalogToDb}
                  disabled={isSyncingCatalog}
                  className="w-full xs:w-auto justify-center py-2.5 px-4 rounded-xl bg-[#FAF8F5] border border-[#C5A059] text-[#191715] hover:bg-[#C5A059] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition disabled:opacity-50"
                  title="Push all Summer & Winter collection items to Cloud Firestore"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>{isSyncingCatalog ? 'Syncing...' : 'Sync 50+ Ensembles to Cloud'}</span>
                </button>
                <button
                  onClick={() => openProductModal()}
                  className="w-full xs:w-auto justify-center py-2.5 px-4 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {syncMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncMessage}</span>
              </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-[#EADBCE] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-xs text-left text-[#4A423D]">
                  <thead className="bg-[#FAF8F5] text-[#1F1C1A] uppercase tracking-wider font-semibold border-b border-[#EADBCE]">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (PKR)</th>
                      <th className="py-3 px-4">Color Variations</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]">
                    {products.map((p) => {
                      const totalStock = p.colors.reduce(
                        (sum, c) => sum + c.sizes.reduce((sSum, s) => sSum + s.stock, 0),
                        0
                      );
                      return (
                        <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={p.colors[0]?.images[0] || '/assets/aistudio/weddingseason__3__6ca9845d.jpeg'}
                              alt={p.name}
                              className="w-12 h-14 object-cover object-top rounded-lg border border-[#EADBCE] shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-xs text-[#1F1C1A] line-clamp-1">{p.name}</p>
                              <p className="text-[11px] text-[#A89D93] font-mono">SKU: {p.sku}</p>
                              <div className="flex gap-1 mt-1">
                                {p.isNewArrival && (
                                  <span className="text-[9px] bg-black text-white px-1.5 py-0.2 rounded font-bold">
                                    NEW
                                  </span>
                                )}
                                {p.isBestSeller && (
                                  <span className="text-[9px] bg-[#B88E3E] text-white px-1.5 py-0.2 rounded font-bold">
                                    BESTSELLER
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#1F1C1A]">
                            {p.category} {p.subcategory ? `• ${p.subcategory}` : ''}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#1F1C1A]">
                            Rs. {(p.salePrice || p.regularPrice).toLocaleString()}
                            {p.salePrice && p.salePrice < p.regularPrice && (
                              <span className="block text-[10px] text-gray-400 line-through">
                                Rs. {p.regularPrice.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {p.colors.map((c) => (
                                <span
                                  key={c.name}
                                  className="w-4 h-4 rounded-full border border-black/20"
                                  style={{ backgroundColor: c.hex }}
                                  title={`${c.name} (${c.sizes.reduce((sum, s) => sum + s.stock, 0)} in stock)`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-[#8C827A] mt-1 block">
                              Total Stock: {totalStock} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => openProductModal(p)}
                              className="p-1.5 rounded bg-gray-100 hover:bg-[#B88E3E] hover:text-white transition"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 rounded bg-gray-100 hover:bg-red-600 hover:text-white transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= INVENTORY & STOCK ALERT SYSTEM TAB ================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADBCE] pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest font-bold text-[#B88E3E]">
                  Live Warehouse & Storefront Synchronization
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Inventory & Stock Control</h2>
                <p className="text-xs text-[#7A7169]">
                  Manage stock levels, automated Sold Out status, and low stock alert thresholds in real time.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-Sync Active
                </span>
              </div>
            </div>

            {/* Inventory KPI Summary Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#EADBCE] shadow-sm">
                <p className="text-[11px] font-semibold text-[#8C827A] uppercase">Total Units in Stock</p>
                <p className="text-2xl font-bold text-[#1F1C1A] mt-1 font-mono">{inventoryStats.totalItems}</p>
                <p className="text-[10px] text-[#A89D93] mt-0.5">Across all sizes & variations</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#EADBCE] shadow-sm">
                <p className="text-[11px] font-semibold text-emerald-700 uppercase">Available Ensembles</p>
                <p className="text-2xl font-bold text-emerald-800 mt-1 font-mono">{inventoryStats.wellStockedCount}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">&gt; 5 units available</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-amber-900 uppercase">Low Stock Alert</p>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-amber-900 mt-1 font-mono">{inventoryStats.lowStockCount}</p>
                <p className="text-[10px] text-amber-700 mt-0.5">≤ 5 units (Urgent warning)</p>
              </div>

              <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-red-900 uppercase">Sold Out / Depleted</p>
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-900 mt-1 font-mono">{inventoryStats.soldOutCount}</p>
                <p className="text-[10px] text-red-700 mt-0.5">0 units (Marked Sold Out)</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EADBCE]">
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-[#A89D93] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by Name, SKU, Category, Brand..."
                  value={inventorySearchQuery}
                  onChange={(e) => setInventorySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D9CCC2] text-xs focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
                <button
                  onClick={() => setInventoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-semibold ${
                    inventoryFilter === 'all'
                      ? 'bg-[#1F1C1A] text-white shadow-sm'
                      : 'bg-[#FAF8F5] text-[#5A524C] hover:bg-gray-100'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setInventoryFilter('low-stock')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-semibold flex items-center gap-1.5 ${
                    inventoryFilter === 'low-stock'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span>⚠️ Low Stock</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                    {inventoryStats.lowStockCount}
                  </span>
                </button>
                <button
                  onClick={() => setInventoryFilter('sold-out')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-semibold flex items-center gap-1.5 ${
                    inventoryFilter === 'sold-out'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  <span>🔴 Sold Out</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                    {inventoryStats.soldOutCount}
                  </span>
                </button>
                <button
                  onClick={() => setInventoryFilter('in-stock')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-semibold ${
                    inventoryFilter === 'in-stock'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  In Stock ({inventoryStats.wellStockedCount})
                </button>
              </div>
            </div>

            {/* Inventory Items List */}
            <div className="space-y-4">
              {filteredInventoryProducts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-[#EADBCE]">
                  <p className="text-sm font-semibold text-[#1F1C1A]">No Ensembles Match This Stock Filter</p>
                  <p className="text-xs text-[#7A7169] mt-1">Adjust search keywords or select another filter.</p>
                </div>
              ) : (
                filteredInventoryProducts.map((prod) => {
                  const productTotal = prod.colors.reduce(
                    (acc, c) => acc + c.sizes.reduce((sAcc, s) => sAcc + (s.stock || 0), 0),
                    0
                  );
                  const isSoldOut = productTotal === 0;
                  const isLowStock = !isSoldOut && productTotal <= 5;

                  return (
                    <div
                      key={prod.id}
                      className={`p-3.5 sm:p-5 rounded-2xl bg-white border shadow-sm transition ${
                        isSoldOut
                          ? 'border-red-300 ring-1 ring-red-200 bg-red-50/15'
                          : isLowStock
                          ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/10'
                          : 'border-[#EADBCE]'
                      }`}
                    >
                      {/* Product Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#EADBCE] pb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prod.colors[0]?.images[0] || '/assets/aistudio/weddingseason__3__6ca9845d.jpeg'}
                            alt={prod.name}
                            className="w-14 h-16 object-cover object-top rounded-lg border border-[#EADBCE] shadow-sm shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {prod.brand && (
                                <span className="px-1.5 py-0.5 rounded bg-[#FAF5EE] text-[#B88E3E] font-bold text-[10px] tracking-wider uppercase border border-[#EADBCE]">
                                  {prod.brand}
                                </span>
                              )}
                              <h4 className="font-serif font-bold text-sm text-[#1F1C1A] truncate">{prod.name}</h4>
                            </div>
                            <p className="text-[11px] text-[#7A7169] mt-0.5">
                              {prod.category} • {prod.fabric} • <span className="font-mono font-bold">SKU: {prod.sku}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge & 1-Click Actions */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-center">
                          {isSoldOut ? (
                            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              🔴 SOLD OUT (0 left)
                            </span>
                          ) : isLowStock ? (
                            <span className="px-3 py-1 rounded-full bg-amber-500 text-[#1F1C1A] text-xs font-bold uppercase tracking-wider shadow-sm animate-pulse">
                              ⚠️ LOW STOCK: Only {productTotal} left!
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                              ✅ IN STOCK: {productTotal} units
                            </span>
                          )}

                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => handleMarkProductSoldOut(prod)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-600 hover:text-white text-red-800 text-[11px] font-semibold border border-red-200 transition"
                              title="Set all sizes to 0 stock (Sold Out)"
                            >
                              Mark Sold Out
                            </button>
                            <button
                              onClick={() => handleQuickRestockProduct(prod, 10)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#B88E3E] hover:text-white text-[#1F1C1A] text-[11px] font-semibold border border-[#D9CCC2] transition"
                              title="Add 10 units to each size"
                            >
                              Restock (+10)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sizes and Variants Matrix */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-3">
                        {prod.colors.map((color, colIdx) => (
                          <div key={color.name} className="p-3 sm:p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-4 h-4 rounded-full border border-black/20 shadow-inner shrink-0"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="font-bold text-xs text-[#1F1C1A] truncate">{color.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-[#8C827A] shrink-0">
                                {color.sizes.reduce((sum, s) => sum + (s.stock || 0), 0)} units
                              </span>
                            </div>

                            <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 text-xs">
                              {color.sizes.map((s, szIdx) => {
                                const sizeSoldOut = (s.stock || 0) === 0;
                                const sizeLow = !sizeSoldOut && (s.stock || 0) <= 3;

                                return (
                                  <div
                                    key={s.size}
                                    className={`p-2 rounded-lg border text-center transition ${
                                      sizeSoldOut
                                        ? 'bg-red-50/70 border-red-200 text-red-900'
                                        : sizeLow
                                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                                        : 'bg-white border-[#D9CCC2] text-[#1F1C1A]'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-[11px]">{s.size}</span>
                                      {sizeSoldOut ? (
                                        <span className="text-[9px] font-bold text-red-600 uppercase">Out</span>
                                      ) : sizeLow ? (
                                        <span className="text-[9px] font-bold text-amber-600 uppercase">Low</span>
                                      ) : null}
                                    </div>

                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() =>
                                          handleSetStock(prod.id, colIdx, szIdx, (s.stock || 0) - 1)
                                        }
                                        className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-xs font-bold text-black flex items-center justify-center"
                                        title="Decrease stock"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        min={0}
                                        value={s.stock || 0}
                                        onChange={(e) =>
                                          handleSetStock(
                                            prod.id,
                                            colIdx,
                                            szIdx,
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        className="font-mono font-bold text-xs w-10 text-center bg-white border border-gray-300 rounded py-0.5"
                                      />
                                      <button
                                        onClick={() =>
                                          handleSetStock(prod.id, colIdx, szIdx, (s.stock || 0) + 1)
                                        }
                                        className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-xs font-bold text-black flex items-center justify-center"
                                        title="Increase stock"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= ORDERS TAB ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Customer Orders Management</h2>
              <p className="text-xs text-[#7A7169]">
                View nationwide orders, update fulfillment statuses, and book shipments with PostEx.
              </p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EADBCE]">
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-[#A89D93] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by Order #, Name, Phone..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D9CCC2] text-xs focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
                {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                        orderStatusFilter === status
                          ? 'bg-[#1F1C1A] text-white font-semibold'
                          : 'bg-[#FAF8F5] text-[#5A524C] hover:bg-gray-100'
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-[#EADBCE] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-xs text-left text-[#4A423D]">
                  <thead className="bg-[#FAF8F5] text-[#1F1C1A] uppercase tracking-wider font-semibold border-b border-[#EADBCE]">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Courier & Tracking</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          No matching orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#FAF8F5]/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-[#1F1C1A]">
                            {ord.orderNumber}
                            <span className="block text-[10px] text-[#A89D93] font-sans font-normal">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-[#1F1C1A]">{ord.customer.fullName}</p>
                            <p className="text-[11px] text-[#6F665F]">{ord.customer.phone}</p>
                            <p className="text-[10px] text-[#B88E3E] truncate max-w-[150px]" title={ord.customer.email}>
                              {ord.customer.email || 'N/A'}
                            </p>
                            <p className="text-[10px] text-[#A89D93]">{ord.customer.city}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold">{ord.items.length} item(s)</span>
                            <span className="block text-[10px] text-[#8C827A] line-clamp-1">
                              {ord.items.map((i) => `${i.productName} (${i.colorName}/${i.size})`).join(', ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#1F1C1A]">
                            Rs. {ord.total.toLocaleString()}
                            <span className="block text-[10px] text-emerald-700 font-normal">
                              {ord.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#D9CCC2] text-xs font-semibold focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            {ord.trackingNumber ? (
                              <div>
                                <span className="font-mono text-xs text-blue-700 font-bold">
                                  {ord.trackingNumber}
                                </span>
                                <span className="block text-[10px] text-gray-500">{ord.courier}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handlePostExBooking(ord)}
                                className="px-2 py-1 rounded bg-[#B88E3E] text-white text-[10px] font-semibold hover:bg-[#9E7730] transition flex items-center gap-1"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Book PostEx</span>
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrderDetails(ord)}
                              className="px-2.5 py-1 rounded bg-gray-100 hover:bg-[#1F1C1A] hover:text-white text-xs font-medium transition"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= CATEGORIES TAB ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Categories Management</h2>
                <p className="text-xs text-[#7A7169]">
                  Manage store navigation categories, subcategories, and banner photos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-3">
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 relative">
                    <img
                      src={cat.image || '/assets/aistudio/weddingseason__3__6ca9845d.jpeg'}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                      Order: {cat.order}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-base text-[#1F1C1A]">{cat.name}</h4>
                    <p className="text-xs text-[#7A7169] mt-1 line-clamp-2">{cat.description}</p>
                  </div>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="pt-2 border-t border-[#F2ECE6]">
                      <span className="text-[11px] font-bold text-[#1F1C1A] block mb-1">Subcategories:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.subcategories.map((sub) => (
                          <span key={sub} className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#EADBCE] text-[10px]">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SETTINGS TAB ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-2xl border border-[#EADBCE] p-4 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="border-b border-[#EADBCE] pb-3">
              <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Store Settings & Contact</h2>
              <p className="text-xs text-[#7A7169] mt-0.5">
                Update NOOR STUDIO official business parameters, helpline, and shipping rates.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Store settings updated successfully!</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateSettings(settingsForm);
                setSettingsSaved(true);
                setTimeout(() => setSettingsSaved(false), 3000);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Brand Name</label>
                <input
                  type="text"
                  value={settingsForm.brandName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Customer Helpline (Voice)</label>
                  <input
                    type="text"
                    value={settingsForm.helpline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, helpline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">WhatsApp Support Number</label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Official Support Email</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Website URL</label>
                  <input
                    type="url"
                    value={settingsForm.websiteUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, websiteUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Standard Delivery Fee (PKR)</label>
                  <input
                    type="number"
                    value={settingsForm.shippingFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shippingFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Free Delivery Minimum (PKR)</label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThreshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Top Announcement Banner</label>
                <textarea
                  rows={2}
                  value={settingsForm.announcement}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider transition"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= DEDICATED PRODUCT IMAGE UPLOAD & SEQUENCE TAB ================= */}
        {activeTab === 'upload-pictures' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADBCE] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Product Image Upload & Sequence Manager</h2>
                <p className="text-xs text-[#7A7169] mt-1">
                  Upload multiple high-resolution photos and manage the exact sequence. Model wearing the dress must always be picture #1.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveDedicatedImageSequence}
                  disabled={isSavingImageSequence}
                  className="py-2.5 px-5 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-[#C5A059]" />
                  <span>{isSavingImageSequence ? 'Saving...' : 'Save Image Sequence'}</span>
                </button>
              </div>
            </div>

            {/* MANDATORY 5-STEP IMAGE SEQUENCE INSTRUCTION BOX */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF8F5] via-[#FFFDFB] to-[#FAF8F5] border border-[#C5A059]/40 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B88E3E]">
                <Sparkles className="w-4 h-4 text-[#B88E3E]" />
                <span>Mandatory NOOR STUDIO Fashion Image Sequence (Client Rule #6):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] text-[#4A423D]">
                <div className="p-2.5 rounded-xl bg-white border border-[#C5A059] font-bold text-[#1F1C1A] shadow-xs">
                  <span className="text-[#C5A059] block text-xs">1. FIRST IMAGE</span>
                  Model wearing the dress (Main card & cover)
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#EADBCE]">
                  <span className="font-bold text-[#7A7169] block text-xs">2. Front View</span>
                  Dress full front silhouette
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#EADBCE]">
                  <span className="font-bold text-[#7A7169] block text-xs">3. Back View</span>
                  Dress back & dupatta styling
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#EADBCE]">
                  <span className="font-bold text-[#7A7169] block text-xs">4. Fabric Macro</span>
                  Embroidery & texture close-up
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#EADBCE]">
                  <span className="font-bold text-[#7A7169] block text-xs">5. Details</span>
                  Laces, tassels & stitching details
                </div>
              </div>
            </div>

            {/* Feedback notifications */}
            {uploadError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {/* Product & Variation Selector */}
            <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1C1A] uppercase tracking-wider mb-1.5">
                    Select Product to Manage Pictures
                  </label>
                  <select
                    value={selectedProductIdForUpload}
                    onChange={(e) => {
                      setSelectedProductIdForUpload(e.target.value);
                      setSelectedColorIdxForUpload(0);
                      setUploadError(null);
                      setUploadSuccess(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-white text-xs font-semibold text-[#1F1C1A] focus:outline-none focus:border-[#B88E3E]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku}) — {p.category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Variation Pills (if product has multiple) */}
                {(() => {
                  const currentProd = products.find((p) => p.id === selectedProductIdForUpload);
                  if (!currentProd || !currentProd.colors || currentProd.colors.length <= 1) return null;
                  return (
                    <div>
                      <label className="block text-xs font-bold text-[#1F1C1A] uppercase tracking-wider mb-1.5">
                        Select Color Variation
                      </label>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {currentProd.colors.map((c, idx) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setSelectedColorIdxForUpload(idx);
                              setUploadError(null);
                              setUploadSuccess(null);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition ${
                              selectedColorIdxForUpload === idx
                                ? 'bg-[#1F1C1A] text-white border-[#1F1C1A] shadow-xs'
                                : 'bg-[#FAF8F5] text-[#5A524C] border-[#D9CCC2] hover:border-[#1F1C1A]'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-black/20"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span>{c.name} ({c.images?.length || 0} pics)</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Upload Controls */}
              <div className="border-t border-[#F2ECE6] pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#B88E3E] text-[#191715] hover:text-white text-xs font-bold uppercase tracking-wider transition shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>Upload Pictures from Device</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={handleDedicatedImageUpload}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveColorIndexForLibrary(selectedColorIdxForUpload);
                      setShowLibraryModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C5A059] bg-[#FAF8F5] text-[#191715] hover:bg-[#C5A059] text-xs font-bold uppercase tracking-wider transition"
                  >
                    <ImageIcon className="w-4 h-4 text-[#B88E3E]" />
                    <span>Pick from NOOR Photos</span>
                  </button>
                </div>
                <span className="text-[11px] text-[#7A7169]">
                  Supported: <strong>JPG, JPEG, PNG, WebP</strong> (Max 10MB each)
                </span>
              </div>
            </div>

            {/* Picture Sequence Cards Grid */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="font-serif text-sm font-bold text-[#1F1C1A] uppercase tracking-wider">
                  Current Picture Sequence ({imageSequenceList.length} Photos)
                </h3>
                <span className="text-xs text-[#7A7169]">
                  Use <strong>Move Up / Down</strong> or <strong>Set as Primary</strong> to adjust sequence
                </span>
              </div>

              {imageSequenceList.length === 0 ? (
                <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border-2 border-dashed border-[#D9CCC2] space-y-3">
                  <ImageIcon className="w-10 h-10 text-[#C5A059] mx-auto opacity-60" />
                  <p className="text-sm font-semibold text-[#1F1C1A]">No Pictures in this Product Gallery</p>
                  <p className="text-xs text-[#7A7169] max-w-sm mx-auto">
                    Click <strong>Upload Pictures from Device</strong> above to add JPG, JPEG, PNG, or WebP photos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {imageSequenceList.map((imgUrl, idx) => {
                    const isPrimary = idx === 0;
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-2xl overflow-hidden bg-white border-2 shadow-sm flex flex-col transition duration-200 ${
                          isPrimary
                            ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30'
                            : 'border-[#EADBCE] hover:border-[#B88E3E]'
                        }`}
                      >
                        {/* Sequence Badge */}
                        <div className="absolute top-2 left-2 z-10">
                          {isPrimary ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#1F1C1A] text-[#C5A059] text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1 border border-[#C5A059]">
                              <Star className="w-3 h-3 fill-[#C5A059]" />
                              <span>#1 Model (Primary)</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold shadow-md">
                              #{idx + 1} {idx === 1 ? 'Front' : idx === 2 ? 'Back' : idx === 3 ? 'Fabric' : 'Detail'}
                            </span>
                          )}
                        </div>

                        {/* Image Preview */}
                        <div className="relative aspect-[3/4] w-full bg-[#FAF8F5] overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`Product pic ${idx + 1}`}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>

                        {/* Sequence Actions */}
                        <div className="p-2.5 bg-[#FAF8F5] border-t border-[#EADBCE] flex items-center justify-between gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveImageUp(idx)}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg bg-white border border-[#D9CCC2] text-[#1F1C1A] hover:bg-[#B88E3E] hover:text-white transition disabled:opacity-30"
                              title="Move Earlier in Sequence"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImageDown(idx)}
                              disabled={idx === imageSequenceList.length - 1}
                              className="p-1.5 rounded-lg bg-white border border-[#D9CCC2] text-[#1F1C1A] hover:bg-[#B88E3E] hover:text-white transition disabled:opacity-30"
                              title="Move Later in Sequence"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetAsPrimaryImage(idx)}
                              className="px-2 py-1 rounded-md bg-[#C5A059] hover:bg-[#B88E3E] text-[#191715] hover:text-white text-[10px] font-bold uppercase transition"
                              title="Set as First / Primary Image"
                            >
                              Make #1
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteDedicatedImage(idx)}
                            className="p-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition"
                            title="Delete Picture"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save Button Footer */}
            {imageSequenceList.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <p className="text-xs text-[#5A524C]">
                  Ensure position #1 is the <strong>model wearing the dress</strong> before saving.
                </p>
                <button
                  type="button"
                  onClick={handleSaveDedicatedImageSequence}
                  disabled={isSavingImageSequence}
                  className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-[#C5A059]" />
                  <span>{isSavingImageSequence ? 'Saving...' : 'Save Image Sequence to Product'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= MANAGE COLLECTIONS TAB (NEW ARRIVALS, FEATURED, SALE) ================= */}
        {activeTab === 'collections' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADBCE] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Collections & Visibility Management</h2>
                <p className="text-xs text-[#7A7169] mt-1">
                  Manage New Arrivals showcase, Featured collections, Bestsellers, and Sale markdowns.
                </p>
              </div>
            </div>

            {collectionsSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{collectionsSuccessMsg}</span>
              </div>
            )}

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: `All Products (${products.length})` },
                  { id: 'new', label: `New Arrivals (${products.filter((p) => p.isNewArrival).length})` },
                  { id: 'featured', label: `Featured (${products.filter((p) => p.isFeatured || p.isBestSeller).length})` },
                  { id: 'sale', label: `On Sale (${products.filter((p) => p.salePrice && p.salePrice < p.regularPrice).length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCollectionsFilter(f.id as any)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${
                      collectionsFilter === f.id
                        ? 'bg-[#1F1C1A] text-white shadow-sm'
                        : 'bg-white border border-[#D9CCC2] text-[#5A524C] hover:border-[#1F1C1A]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#7A7169]" />
                <input
                  type="text"
                  value={collectionsSearch}
                  onChange={(e) => setCollectionsSearch(e.target.value)}
                  placeholder="Search ensemble or SKU..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9CCC2] bg-white text-xs focus:outline-none focus:border-[#B88E3E]"
                />
              </div>
            </div>

            {/* Collections Table */}
            <div className="bg-white rounded-2xl border border-[#EADBCE] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-xs text-left text-[#4A423D]">
                  <thead className="bg-[#FAF8F5] text-[#1F1C1A] uppercase tracking-wider font-semibold border-b border-[#EADBCE]">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">New Arrival</th>
                      <th className="py-3 px-4 text-center">Featured</th>
                      <th className="py-3 px-4 text-center">Best Seller</th>
                      <th className="py-3 px-4">Regular Price</th>
                      <th className="py-3 px-4">Sale Price (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]">
                    {filteredCollectionsProducts.map((p) => {
                      const discount = p.salePrice && p.salePrice < p.regularPrice
                        ? Math.round(((p.regularPrice - p.salePrice) / p.regularPrice) * 100)
                        : null;
                      return (
                        <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={p.colors[0]?.images[0] || '/assets/aistudio/weddingseason__3__6ca9845d.jpeg'}
                              alt={p.name}
                              className="w-10 h-12 object-cover object-top rounded-lg border border-[#EADBCE] shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-xs text-[#1F1C1A] line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-[#8C827A] font-mono">SKU: {p.sku}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#1F1C1A]">
                            {p.category}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleCollectionField(p.id, 'isNewArrival', p.isNewArrival)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                p.isNewArrival
                                  ? 'bg-black text-white'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              {p.isNewArrival ? '✓ NEW' : '+ Add'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleCollectionField(p.id, 'isFeatured', p.isFeatured)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                p.isFeatured
                                  ? 'bg-[#C5A059] text-[#191715]'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              {p.isFeatured ? '✓ FEATURED' : '+ Add'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleCollectionField(p.id, 'isBestSeller', p.isBestSeller)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                p.isBestSeller
                                  ? 'bg-[#B88E3E] text-white'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              {p.isBestSeller ? '✓ BESTSELLER' : '+ Add'}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#1F1C1A]">
                            Rs. {p.regularPrice.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                defaultValue={p.salePrice || ''}
                                placeholder="Sale PKR"
                                onBlur={(e) => {
                                  const val = e.target.value ? Number(e.target.value) : undefined;
                                  if (val !== p.salePrice) {
                                    handleUpdateSalePrice(p.id, val);
                                  }
                                }}
                                className="w-24 px-2 py-1 rounded border border-[#D9CCC2] text-xs font-semibold focus:outline-none focus:border-[#B88E3E]"
                              />
                              {discount && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                  -{discount}%
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= CUSTOMERS DIRECTORY TAB ================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADBCE] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Registered Customers &amp; Order History</h2>
                <p className="text-xs text-[#7A7169] mt-1">
                  View registered customer profiles, contact details, registration dates, and individual order history.
                </p>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#7A7169]" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9CCC2] bg-white text-xs focus:outline-none focus:border-[#B88E3E]"
                />
              </div>
            </div>

            {/* Customer Stats Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] shadow-xs">
                <span className="text-xs text-[#7A7169]">Total Customers</span>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#1F1C1A] mt-1">{customersList.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] shadow-xs">
                <span className="text-xs text-[#7A7169]">Total Orders</span>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#1F1C1A] mt-1">{orders.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] shadow-xs">
                <span className="text-xs text-[#7A7169]">Total Revenue</span>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#B88E3E] mt-1 break-words">
                  Rs. {totalSales.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] shadow-xs">
                <span className="text-xs text-[#7A7169]">Repeat Customers</span>
                <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
                  {customersList.filter((c) => c.orderCount > 1).length}
                </p>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl border border-[#EADBCE] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-xs text-left text-[#4A423D]">
                  <thead className="bg-[#FAF8F5] text-[#1F1C1A] uppercase tracking-wider font-semibold border-b border-[#EADBCE]">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Email &amp; Phone</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-center">Orders Placed</th>
                      <th className="py-3 px-4">Total Spent (PKR)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]">
                    {customersList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#8C827A]">
                          No customers match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      customersList.map((c) => (
                        <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition">
                          <td className="py-3 px-4">
                            <p className="font-bold text-xs text-[#1F1C1A]">{c.fullName}</p>
                            <span className="text-[10px] text-[#8C827A]">{c.city}</span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-[#1F1C1A]">{c.email}</p>
                            <p className="text-[11px] text-[#6F665F]">{c.phone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-[#1F1C1A] flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#B88E3E]" />
                              <span>{new Date(c.registeredAt).toLocaleDateString()}</span>
                            </p>
                            {c.latestOrderDate && (
                              <span className="text-[10px] text-[#8C827A]">
                                Last order: {new Date(c.latestOrderDate).toLocaleDateString()} ({c.latestStatus})
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EADBCE] font-bold text-[#1F1C1A]">
                              {c.orderCount}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#1F1C1A]">
                            Rs. {c.totalSpent.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedCustomerProfile(c)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Profile</span>
                              </button>
                              {c.phone && c.phone !== 'N/A' && (
                                <a
                                  href={`https://wa.me/92${c.phone.replace(/^0/, '').replace(/\D/g, '')}?text=Assalam-o-Alaikum%20${encodeURIComponent(c.fullName)}%2C%20thank%20you%20for%20shopping%20with%20NOOR%20STUDIO.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold shadow-xs transition"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= CUSTOMER PROFILE & ORDER HISTORY MODAL ================= */}
      {selectedCustomerProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-[#EADBCE] max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-[#EADBCE] pb-3 gap-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1F1C1A]">
                  {selectedCustomerProfile.fullName}
                </h3>
                <p className="text-xs text-[#8C827A] mt-0.5">
                  Registered: {new Date(selectedCustomerProfile.registeredAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerProfile(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] space-y-1">
                <p className="font-bold text-[#1F1C1A]">Contact &amp; Account</p>
                <p className="break-all">Email: {selectedCustomerProfile.email}</p>
                <p>Phone: {selectedCustomerProfile.phone}</p>
                {selectedCustomerProfile.uid && (
                  <p className="text-[10px] font-mono text-[#8C827A] break-all">
                    UID: {selectedCustomerProfile.uid}
                  </p>
                )}
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] space-y-1">
                <p className="font-bold text-[#1F1C1A]">Delivery &amp; Summary</p>
                <p>City: {selectedCustomerProfile.city}</p>
                <p>Address: {selectedCustomerProfile.address}</p>
                <p className="font-bold text-[#B88E3E]">
                  {selectedCustomerProfile.orderCount} Orders • Rs. {selectedCustomerProfile.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="font-bold text-xs uppercase tracking-wider text-[#1F1C1A]">
                Customer Order History ({selectedCustomerProfile.orders.length})
              </p>
              {selectedCustomerProfile.orders.length === 0 ? (
                <p className="text-xs text-[#8C827A] p-4 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] text-center">
                  This registered customer has not placed any orders yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomerProfile.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-[#EADBCE] text-xs"
                    >
                      <div>
                        <p className="font-mono font-bold text-[#1F1C1A]">#{ord.orderNumber}</p>
                        <p className="text-[11px] text-[#7A7169]">
                          {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} item(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EADBCE] font-semibold">
                          {ord.orderStatus}
                        </span>
                        <span className="font-bold text-[#B88E3E]">
                          Rs. {ord.total.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomerProfile(null);
                            setSelectedOrderDetails(ord);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#1F1C1A] text-white hover:bg-[#B88E3E] text-[11px] font-semibold transition"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl border border-[#EADBCE] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start sm:items-center justify-between border-b border-[#EADBCE] pb-3 gap-2">
              <div className="min-w-0">
                <span className="font-mono text-sm sm:text-base font-bold text-[#1F1C1A]">
                  Order #{selectedOrderDetails.orderNumber}
                </span>
                <p className="text-xs text-[#8C827A]">
                  Placed on {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] min-w-0">
                <p className="font-bold text-[#1F1C1A] mb-1">Customer Information</p>
                <p>Name: {selectedOrderDetails.customer.fullName}</p>
                <p>Phone: {selectedOrderDetails.customer.phone}</p>
                <p className="break-all">Email: {selectedOrderDetails.customer.email || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] min-w-0">
                <p className="font-bold text-[#1F1C1A] mb-1">Shipping Address</p>
                <p>{selectedOrderDetails.customer.address}</p>
                <p>City: {selectedOrderDetails.customer.city}</p>
                {selectedOrderDetails.customer.notes && (
                  <p className="text-amber-800 mt-1">Note: {selectedOrderDetails.customer.notes}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="font-bold text-xs text-[#1F1C1A] uppercase tracking-wider mb-2">
                Purchased Ensembles
              </p>
              <div className="space-y-2">
                {selectedOrderDetails.items.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg border border-[#EADBCE] text-xs">
                    <img
                      src={i.image}
                      alt={i.productName}
                      className="w-12 h-14 object-cover object-top rounded-md border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1F1C1A] truncate">{i.productName}</p>
                      <p className="text-[#8C827A]">
                        Color: {i.colorName} | Size: {i.size} | Qty: {i.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-[#1F1C1A] shrink-0">
                      Rs. {(i.price * i.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-[#EADBCE] text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {selectedOrderDetails.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{selectedOrderDetails.shippingCost === 0 ? 'FREE' : `Rs. ${selectedOrderDetails.shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1F1C1A] pt-1">
                <span>Total Payable (COD):</span>
                <span className="font-serif text-[#B88E3E]">
                  Rs. {selectedOrderDetails.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Email notification toast if resent */}
            {emailResentMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{emailResentMessage}</span>
              </div>
            )}

            {/* Actions: Resend Email, WhatsApp confirmation & PostEx Booking */}
            <div className="pt-3 border-t border-[#EADBCE] flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                disabled={resendingEmailId === selectedOrderDetails.id}
                onClick={() => handleResendOrderEmail(selectedOrderDetails)}
                className="flex-1 py-2.5 px-3 rounded-lg bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Mail className="w-4 h-4 text-[#C5A059]" />
                <span>
                  {resendingEmailId === selectedOrderDetails.id ? 'Sending Email...' : 'Resend Order Email'}
                </span>
              </button>

              <a
                href={`https://wa.me/${selectedOrderDetails.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum ${selectedOrderDetails.customer.fullName}, Thank you for your order with NOOR STUDIO (Order #${selectedOrderDetails.orderNumber}). Your order of Rs. ${selectedOrderDetails.total.toLocaleString()} is confirmed and will be dispatched via PostEx Express courier.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-lg bg-[#25D366] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Confirmation</span>
              </a>

              {!selectedOrderDetails.trackingNumber && (
                <button
                  onClick={() => handlePostExBooking(selectedOrderDetails)}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#B88E3E] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#9E7730] transition"
                >
                  <Truck className="w-4 h-4" />
                  <span>Generate PostEx Tracking</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT PRODUCT MODAL ================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-8 shadow-2xl border border-[#EADBCE] max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3 gap-2">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1F1C1A]">
                {editingProduct ? 'Edit Fashion Ensemble' : 'Add New Fashion Ensemble'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mah-e-Noor Handcrafted Organza Peshwas"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              {/* Category, Subcategory, Season & Stitched Status Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Primary Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:outline-none focus:border-[#B88E3E]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Season Filter</label>
                  <select
                    value={prodForm.season || 'All Season'}
                    onChange={(e) => setProdForm({ ...prodForm, season: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:outline-none focus:border-[#B88E3E]"
                  >
                    <option value="Summer">Summer Wear</option>
                    <option value="Winter">Winter Wear</option>
                    <option value="All Season">All Season / Festive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Stitching Format</label>
                  <select
                    value={prodForm.isStitched ? 'stitched' : 'unstitched'}
                    onChange={(e) => setProdForm({ ...prodForm, isStitched: e.target.value === 'stitched' })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:outline-none focus:border-[#B88E3E]"
                  >
                    <option value="stitched">Stitched (Ready to Wear)</option>
                    <option value="unstitched">Unstitched (3PC Fabric)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Brand Name</label>
                  <input
                    type="text"
                    list="brand-suggestions"
                    value={prodForm.brand || 'NOOR STUDIO'}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    placeholder="e.g. Maria.B, Iznik, Heer Collection"
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:outline-none focus:border-[#B88E3E]"
                  />
                  <datalist id="brand-suggestions">
                    <option value="NOOR STUDIO" />
                    <option value="Maria.B" />
                    <option value="Iznik" />
                    <option value="Ethnic" />
                    <option value="Heer Collection" />
                    <option value="Breeze" />
                    <option value="Morashi" />
                    <option value="Zesh" />
                    <option value="Agha Noor" />
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Silhouette / Type</label>
                  <select
                    value={prodForm.subcategory}
                    onChange={(e) => setProdForm({ ...prodForm, subcategory: e.target.value, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:outline-none focus:border-[#B88E3E]"
                  >
                    <option value="3 Piece">3 Piece (Shirt, Trouser, Dupatta)</option>
                    <option value="2 Piece">2 Piece (Shirt + Trouser)</option>
                    <option value="1 Piece">1 Piece (Shirt / Kurti)</option>
                    <option value="Lehenga 3PC">Lehenga 3PC (Bridal/Party)</option>
                    <option value="Co-Ord 2PC">Co-Ord 2PC (Western-Fusion)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Regular Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.regularPrice}
                    onChange={(e) => setProdForm({ ...prodForm, regularPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Sale Discount Price (PKR)</label>
                  <input
                    type="number"
                    value={prodForm.salePrice}
                    onChange={(e) => setProdForm({ ...prodForm, salePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Fabric & Material Composition</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chiffon & Malai with Silk Dupatta or Pure Khaddar"
                  value={prodForm.fabric}
                  onChange={(e) => setProdForm({ ...prodForm, fabric: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Product Description</label>
                <textarea
                  rows={3}
                  required
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              {/* Badges / Checkboxes */}
              <div className="flex flex-wrap gap-4 py-2 border-y border-[#EADBCE]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isNewArrival}
                    onChange={(e) => setProdForm({ ...prodForm, isNewArrival: e.target.checked })}
                  />
                  <span>Mark as New Arrival</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isBestSeller}
                    onChange={(e) => setProdForm({ ...prodForm, isBestSeller: e.target.checked })}
                  />
                  <span>Mark as Best Seller</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isFeatured}
                    onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                  />
                  <span>Featured Collection</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isActive}
                    onChange={(e) => setProdForm({ ...prodForm, isActive: e.target.checked })}
                  />
                  <span>Active in Store</span>
                </label>
              </div>

              {/* DYNAMIC COLOR VARIATIONS & DIRECT DEVICE PHOTO UPLOAD */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-[#1F1C1A] uppercase tracking-wider text-xs block">
                      Color Variations & Photo Uploads ({prodForm.colors.length})
                    </span>
                    <span className="text-[11px] text-[#8C827A]">
                      Upload photos directly from your phone/computer or choose from NOOR STUDIO catalogue
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColorVariation}
                    className="px-2.5 py-1 rounded bg-[#B88E3E] text-white text-[11px] font-semibold hover:bg-[#9E7730] transition flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Color</span>
                  </button>
                </div>

                {prodForm.colors.map((color, colIdx) => (
                  <div key={colIdx} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#1F1C1A]">
                        Color Variation #{colIdx + 1}
                      </span>
                      {prodForm.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColorVariation(colIdx)}
                          className="text-red-600 hover:text-red-800 text-[11px] font-semibold"
                        >
                          Remove Color
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Color Name</label>
                        <input
                          type="text"
                          required
                          value={color.name}
                          onChange={(e) => {
                            const newCols = [...prodForm.colors];
                            newCols[colIdx].name = e.target.value;
                            setProdForm({ ...prodForm, colors: newCols });
                          }}
                          className="w-full px-3 py-1.5 rounded border border-[#D9CCC2] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Hex Color Code</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={color.hex}
                            onChange={(e) => {
                              const newCols = [...prodForm.colors];
                              newCols[colIdx].hex = e.target.value;
                              setProdForm({ ...prodForm, colors: newCols });
                            }}
                            className="w-8 h-8 rounded border p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={color.hex}
                            onChange={(e) => {
                              const newCols = [...prodForm.colors];
                              newCols[colIdx].hex = e.target.value;
                              setProdForm({ ...prodForm, colors: newCols });
                            }}
                            className="min-w-0 flex-1 px-3 py-1.5 rounded border border-[#D9CCC2] bg-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Variant SKU</label>
                        <input
                          type="text"
                          value={color.sku}
                          onChange={(e) => {
                            const newCols = [...prodForm.colors];
                            newCols[colIdx].sku = e.target.value;
                            setProdForm({ ...prodForm, colors: newCols });
                          }}
                          className="w-full px-3 py-1.5 rounded border border-[#D9CCC2] bg-white"
                        />
                      </div>
                    </div>

                    {/* PHOTO UPLOAD & ASSET SELECTOR FOR THIS COLOR */}
                    <div className="p-3 bg-white rounded-lg border border-[#D9CCC2] space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="block text-[11px] font-bold text-[#1F1C1A]">
                          Product Photos for {color.name || 'this variation'} ({color.images?.length || 0})
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Direct Device Upload */}
                          <label className="cursor-pointer px-2.5 py-1 rounded-md bg-[#1F1C1A] text-white text-[11px] font-medium hover:bg-[#B88E3E] transition flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload from Device / Camera</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => handleImageFileUpload(e, colIdx)}
                            />
                          </label>

                          {/* Pick from Library */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveColorIndexForLibrary(colIdx);
                              setShowLibraryModal(true);
                            }}
                            className="px-2.5 py-1 rounded-md bg-[#F4EBE1] text-[#7A4B1F] text-[11px] font-semibold hover:bg-[#EADBCE] transition flex items-center gap-1.5"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>NOOR Photos</span>
                          </button>
                        </div>
                      </div>

                      {/* Photo Thumbnail Gallery */}
                      {color.images && color.images.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {color.images.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className="relative group w-20 h-24 rounded-lg overflow-hidden border border-[#D9CCC2] bg-[#F7F4EE]">
                              <img
                                src={imgUrl}
                                alt={`Variation photo ${imgIdx + 1}`}
                                className="w-full h-full object-cover object-top"
                              />
                              {imgIdx === 0 && (
                                <span className="absolute bottom-0 inset-x-0 bg-[#B88E3E] text-white text-[8px] font-bold text-center py-0.5 tracking-wider uppercase">
                                  Main
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(colIdx, imgIdx)}
                                title="Remove Image"
                                className="absolute top-1 right-1 w-5 h-5 bg-black/75 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] transition"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center border border-dashed border-[#D9CCC2] rounded-lg text-xs text-[#8C827A]">
                          No photos added yet. Click <strong>Upload from Device</strong> or <strong>NOOR Photos</strong> above.
                        </div>
                      )}

                      {/* Manual URL input fallback */}
                      <div className="pt-1">
                        <input
                          type="url"
                          placeholder="Or paste external high-resolution image URL..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                const newCols = [...prodForm.colors];
                                newCols[colIdx].images = [...(newCols[colIdx].images || []), val];
                                setProdForm({ ...prodForm, colors: newCols });
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                          className="w-full px-2.5 py-1 text-[11px] rounded border border-[#EADBCE] bg-[#FAF8F5]"
                        />
                      </div>
                    </div>

                    {/* Size and Stock */}
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Sizes & Stock Levels (Total Units)</label>
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
                        {color.sizes.map((s, szIdx) => (
                          <div key={s.size} className="p-2 rounded bg-white border border-[#D9CCC2] text-center">
                            <span className="font-bold text-[10px] block text-[#1F1C1A]">{s.size}</span>
                            <input
                              type="number"
                              min={0}
                              value={s.stock}
                              onChange={(e) => {
                                const newCols = [...prodForm.colors];
                                newCols[colIdx].sizes[szIdx].stock = Number(e.target.value);
                                setProdForm({ ...prodForm, colors: newCols });
                              }}
                              className={`w-full text-center border-t mt-1 pt-1 font-mono font-bold text-xs ${
                                s.stock === 0 ? 'text-red-600 bg-red-50' : 'text-[#1F1C1A]'
                              }`}
                            />
                            {s.stock === 0 ? (
                              <span className="text-[9px] font-bold text-red-600 block">Sold Out</span>
                            ) : s.stock <= 3 ? (
                              <span className="text-[9px] font-semibold text-amber-600 block">Low Stock</span>
                            ) : (
                              <span className="text-[9px] text-green-700 block">In Stock</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EADBCE]">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1F1C1A] text-white font-semibold hover:bg-[#B88E3E] transition shadow-md"
                >
                  Save & Publish to Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PHOTO LIBRARY PICKER MODAL ================= */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-[#EADBCE] max-h-[88vh] flex flex-col">
            <div className="flex items-start sm:items-center justify-between border-b border-[#EADBCE] pb-3 gap-2">
              <div className="min-w-0">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#1F1C1A]">
                  NOOR STUDIO High-Resolution Fashion Asset Library
                </h3>
                <p className="text-xs text-[#8C827A]">
                  Click any Pakistani couture photo to instantly assign it to this product variation.
                </p>
              </div>
              <button
                onClick={() => setShowLibraryModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-sm shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Assets Grid */}
            <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 my-3 sm:my-4 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
              {AVAILABLE_STORE_ASSETS.map((asset, idx) => {
                const label = asset.name;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectLibraryAsset(asset.url)}
                    className="group relative cursor-pointer rounded-xl overflow-hidden border-2 border-transparent hover:border-[#B88E3E] bg-[#FAF8F5] transition shadow-sm hover:shadow-md"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={asset.url}
                        alt={label}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-1.5 bg-white text-center">
                      <p className="text-[10px] font-semibold text-[#1F1C1A] truncate" title={label}>
                        {label}
                      </p>
                      <button
                        type="button"
                        className="w-full mt-1 py-1 rounded bg-[#F4EBE1] group-hover:bg-[#B88E3E] group-hover:text-white text-[#7A4B1F] text-[10px] font-bold transition"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#EADBCE]">
              <button
                type="button"
                onClick={() => setShowLibraryModal(false)}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold"
              >
                Close Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
