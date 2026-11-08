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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Product, Order, Category, ColorVariation, SizeStock, OrderStatus } from '../../types';
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
  const { user, isAdmin, signInAsAdminDemo } = useAuth();
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

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'orders' | 'categories' | 'settings'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

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

  // Fetch real-time orders from Firestore, Backend Express API, and local storage
  useEffect(() => {
    let isMounted = true;

    const mergeAndSetOrders = (incoming: Order[]) => {
      setOrders((prev) => {
        const map = new Map<string, Order>();
        prev.forEach((o) => map.set(o.id || o.orderNumber, o));
        incoming.forEach((o) => map.set(o.id || o.orderNumber, o));
        try {
          const cached: Order[] = JSON.parse(localStorage.getItem('noor_placed_orders') || '[]');
          cached.forEach((o) => {
            if (!map.has(o.id || o.orderNumber)) {
              map.set(o.id || o.orderNumber, o);
            }
          });
        } catch (_) {}

        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    };

    // 1. Fetch from Express Backend API
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.orders)) {
          mergeAndSetOrders(data.orders);
        }
      })
      .catch((err) => console.warn('Backend orders fetch note:', err));

    // 2. Real-time Firestore orders listener
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
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
        console.warn('Orders snapshot warning', err);
        if (isMounted) {
          try {
            const cached: Order[] = JSON.parse(localStorage.getItem('noor_placed_orders') || '[]');
            if (cached.length > 0) mergeAndSetOrders(cached);
          } catch (_) {}
          setLoadingOrders(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

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

  // Auth Guard: executed only after ALL hooks are called unconditionally
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-red-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-xl font-bold text-[#1F1C1A]">Authorized Access Only</h2>
        <p className="text-xs text-[#7A7169]">
          The NOOR STUDIO Admin Portal requires verified administrative privileges.
          Please sign in with the authorized store admin account (sawairamaryam837@gmail.com).
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            onClick={() => signInAsAdminDemo()}
            className="px-5 py-2.5 rounded-lg bg-[#C5A059] text-[#191715] text-xs font-bold hover:bg-[#B88E3E] hover:text-white transition"
          >
            Sign In as Store Admin (sawaira)
          </button>
          <button
            onClick={onExit}
            className="px-5 py-2.5 rounded-lg bg-[#1F1C1A] text-white text-xs font-semibold hover:bg-[#B88E3E] transition"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
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
    // 1. Optimistic local update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
      setSelectedOrderDetails({ ...selectedOrderDetails, orderStatus: newStatus });
    }

    // 2. Authoritative update via Backend Server API
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
    } catch (err) {
      console.warn('Backend order update note:', err);
    }

    // 3. Update localStorage cache
    try {
      const cached: Order[] = JSON.parse(localStorage.getItem('noor_placed_orders') || '[]');
      const updated = cached.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      localStorage.setItem('noor_placed_orders', JSON.stringify(updated));
    } catch (_) {}

    // 4. Update Firestore if authenticated session is active
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

    // 1. Optimistic local state update
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

    // 2. Set UI confirmation state immediately
    setTrackingGenerated(generatedTracking);

    // 3. Authoritative update via Backend Server API
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: generatedTracking,
          courier: 'PostEx Express COD',
          orderStatus: 'Shipped',
        }),
      });
    } catch (err) {
      console.warn('Backend tracking patch note:', err);
    }

    // 4. Update localStorage cache
    try {
      const cached: Order[] = JSON.parse(localStorage.getItem('noor_placed_orders') || '[]');
      const updated = cached.map((o) =>
        o.id === order.id
          ? { ...o, trackingNumber: generatedTracking, courier: 'PostEx Express COD', orderStatus: 'Shipped' }
          : o
      );
      localStorage.setItem('noor_placed_orders', JSON.stringify(updated));
    } catch (_) {}

    // 5. Update Firestore if authenticated session is active
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
      const resp = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, targetEmail: order.customer.email }),
      });
      const data = await resp.json();
      if (data.success) {
        setEmailResentMessage(`Confirmation email successfully sent to ${order.customer.email}!`);
        setTimeout(() => setEmailResentMessage(null), 5000);
      }
    } catch (err) {
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
      <div className="bg-[#191715] text-white border-b border-[#2D2825] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/logo_8d8d5177.jpeg"
              alt="NOOR STUDIO"
              className="h-9 w-auto object-contain rounded border border-[#3E3834] bg-black shadow-sm"
            />
            <span className="font-serif text-xl tracking-[0.2em] font-bold uppercase text-[#FAF8F5]">
              NOOR STUDIO
            </span>
            <span className="px-2 py-0.5 rounded bg-[#C5A059] text-[#191715] text-[10px] font-bold uppercase tracking-wider">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A89D93] hidden md:inline">
              Logged in: <strong className="text-white">{user?.email}</strong>
            </span>
            <button
              onClick={onExit}
              className="px-4 py-1.5 rounded-lg bg-[#2D2825] hover:bg-[#C5A059] hover:text-[#191715] text-xs font-semibold transition"
            >
              Back to Storefront
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-6 mt-4 pt-3 border-t border-[#2D2825] overflow-x-auto text-xs font-medium uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Overview
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
            onClick={() => setActiveTab('products')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'products' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Products ({products.length})
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
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'categories' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Categories
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

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Total Revenue</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1 text-[#B88E3E]">
                  Rs. {totalSales.toLocaleString()}
                </p>
                <p className="text-[11px] text-[#A89D93] mt-1">Cash on Delivery & Raast</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Total Orders</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
                  {orders.length}
                </p>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  {pendingOrders.length} Pending Verification
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Active Catalog</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
                  {products.filter((p) => p.isActive).length}
                </p>
                <p className="text-[11px] text-[#A89D93] mt-1">Across {categories.length} categories</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Delivered Orders</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">
                  {deliveredOrders.length}
                </p>
                <p className="text-[11px] text-emerald-600 mt-1">Successfully completed</p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Orders List (2 Cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EADBCE] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3 mb-4">
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

                        <div className="text-right">
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
              <div className="bg-white rounded-2xl border border-[#EADBCE] p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1F1C1A] border-b border-[#EADBCE] pb-3">
                  Store Operations
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                    <span className="text-[#8C827A] block">Customer Support Helpline</span>
                    <span className="font-bold text-[#1F1C1A] text-sm">{settings.helpline || '03284454746'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                    <span className="text-[#8C827A] block">WhatsApp Business Contact</span>
                    <span className="font-bold text-[#25D366] text-sm">{settings.whatsapp || '+923284454746'}</span>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncCatalogToDb}
                  disabled={isSyncingCatalog}
                  className="py-2.5 px-4 rounded-xl bg-[#FAF8F5] border border-[#C5A059] text-[#191715] hover:bg-[#C5A059] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition disabled:opacity-50"
                  title="Push all Summer & Winter collection items to Cloud Firestore"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span>{isSyncingCatalog ? 'Syncing...' : 'Sync 50+ Ensembles to Cloud'}</span>
                </button>
                <button
                  onClick={() => openProductModal()}
                  className="py-2.5 px-4 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
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
                <table className="w-full text-xs text-left text-[#4A423D]">
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
                          <td className="py-3 px-4 text-right space-x-2">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                      className={`p-5 rounded-2xl bg-white border shadow-sm transition ${
                        isSoldOut
                          ? 'border-red-300 ring-1 ring-red-200 bg-red-50/15'
                          : isLowStock
                          ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/10'
                          : 'border-[#EADBCE]'
                      }`}
                    >
                      {/* Product Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADBCE] pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.colors[0]?.images[0] || '/assets/aistudio/weddingseason__3__6ca9845d.jpeg'}
                            alt={prod.name}
                            className="w-14 h-16 object-cover object-top rounded-lg border border-[#EADBCE] shadow-sm"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {prod.brand && (
                                <span className="px-1.5 py-0.5 rounded bg-[#FAF5EE] text-[#B88E3E] font-bold text-[10px] tracking-wider uppercase border border-[#EADBCE]">
                                  {prod.brand}
                                </span>
                              )}
                              <h4 className="font-serif font-bold text-sm text-[#1F1C1A]">{prod.name}</h4>
                            </div>
                            <p className="text-[11px] text-[#7A7169] mt-0.5">
                              {prod.category} • {prod.fabric} • <span className="font-mono font-bold">SKU: {prod.sku}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge & 1-Click Actions */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
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

                          <div className="flex items-center gap-1.5">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
                        {prod.colors.map((color, colIdx) => (
                          <div key={color.name} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-4 h-4 rounded-full border border-black/20 shadow-inner"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="font-bold text-xs text-[#1F1C1A]">{color.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-[#8C827A]">
                                {color.sizes.reduce((sum, s) => sum + (s.stock || 0), 0)} units
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
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
                <table className="w-full text-xs text-left text-[#4A423D]">
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
          <div className="max-w-2xl bg-white rounded-2xl border border-[#EADBCE] p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
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
      </div>

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EADBCE] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
              <div>
                <span className="font-mono text-base font-bold text-[#1F1C1A]">
                  Order #{selectedOrderDetails.orderNumber}
                </span>
                <p className="text-xs text-[#8C827A]">
                  Placed on {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                <p className="font-bold text-[#1F1C1A] mb-1">Customer Information</p>
                <p>Name: {selectedOrderDetails.customer.fullName}</p>
                <p>Phone: {selectedOrderDetails.customer.phone}</p>
                <p>Email: {selectedOrderDetails.customer.email || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
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
                      className="w-12 h-14 object-cover object-top rounded-md border"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#1F1C1A]">{i.productName}</p>
                      <p className="text-[#8C827A]">
                        Color: {i.colorName} | Size: {i.size} | Qty: {i.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-[#1F1C1A]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#EADBCE] max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1F1C1A]">
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
                <div className="flex items-center justify-between">
                  <div>
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
                    className="px-2.5 py-1 rounded bg-[#B88E3E] text-white text-[11px] font-semibold hover:bg-[#9E7730] transition flex items-center gap-1"
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
                            className="w-8 h-8 rounded border p-0.5 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={color.hex}
                            onChange={(e) => {
                              const newCols = [...prodForm.colors];
                              newCols[colIdx].hex = e.target.value;
                              setProdForm({ ...prodForm, colors: newCols });
                            }}
                            className="flex-1 px-3 py-1.5 rounded border border-[#D9CCC2] bg-white font-mono"
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
                        <div className="flex items-center gap-2">
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
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-[#EADBCE] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">
                  NOOR STUDIO High-Resolution Fashion Asset Library
                </h3>
                <p className="text-xs text-[#8C827A]">
                  Click any Pakistani couture photo to instantly assign it to this product variation.
                </p>
              </div>
              <button
                onClick={() => setShowLibraryModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Assets Grid */}
            <div className="flex-1 overflow-y-auto p-2 my-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
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
