import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddSaleModal from '../components/AddSaleModal';
import NetworkBanner from '../components/NetworkBanner';
import { deleteSale } from '../database/salesActions';
import { useNetworkStatus } from '../hook/useNetworkStatus';
import { useSales } from '../hook/useSales';

// ─── CRM Section Data ──────────────────────────────────────────────────────────
const CRM_SECTIONS = [
  { key: 'contacts', label: 'Contacts',   icon: '👥', count: 142 },
  { key: 'leads',    label: 'Leads',      icon: '🎯', count: 28  },
  { key: 'deals',    label: 'Deals',      icon: '🤝', count: 9   },
  { key: 'tasks',    label: 'Tasks',      icon: '✅', count: 17  },
];

// ─── SyncStatusCard ────────────────────────────────────────────────────────────
function SyncStatusCard({ isOnline, isConnected }) {
  const loading = isConnected === null;

  const config = loading
    ? { color: '#94a3b8', icon: '⏳', title: 'Checking connection…', body: '' }
    : isOnline
    ? {
        color: '#22c55e',
        icon: '✅',
        title: 'All systems go',
        body: 'Your data is syncing in real time. WatermelonDB changes will be pushed to the server automatically.',
      }
    : {
        color: '#ef4444',
        icon: '📴',
        title: 'Offline mode active',
        body: 'All edits are saved locally in WatermelonDB. They will sync automatically the moment connectivity is restored.',
      };

  return (
    <View style={[styles.card, { borderLeftColor: config.color }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{config.icon}</Text>
        <Text style={[styles.cardTitle, { color: config.color }]}>
          {config.title}
        </Text>
      </View>
      {Boolean(config.body) && (
        <Text style={styles.cardBody}>{config.body}</Text>
      )}
    </View>
  );
}

// ─── ConnectionInfoCard ────────────────────────────────────────────────────────
function ConnectionInfoCard({ connectionType, isInternetReachable }) {
  const rows = [
    { label: 'Type',               value: connectionType       ?? '—' },
    { label: 'Internet Reachable', value: isInternetReachable === null
        ? 'Checking…'
        : isInternetReachable
        ? 'Yes'
        : 'No (captive portal or no route)' },
  ];

  return (
    <View style={[styles.card, { borderLeftColor: '#6366f1' }]}>
      <Text style={styles.sectionLabel}>Connection Details</Text>
      {rows.map(({ label, value }) => (
        <View key={label} style={styles.infoRow}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{String(value)}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── CRMCard ───────────────────────────────────────────────────────────────────
function CRMCard({ icon, label, count, isOnline }) {
  return (
    <TouchableOpacity style={styles.crmCard} activeOpacity={0.75}>
      <Text style={styles.crmIcon}>{icon}</Text>
      <Text style={styles.crmCount}>{count}</Text>
      <Text style={styles.crmLabel}>{label}</Text>
      <Text style={styles.crmHint}>
        {isOnline ? 'Live data' : 'Cached data'}
      </Text>
    </TouchableOpacity>
  );
}

// ─── SaleRow ───────────────────────────────────────────────────────────────────
function SaleRow({ sale }) {
  const total = (sale.price * sale.quantity).toFixed(2);

  async function handleDelete() {
    try {
      await deleteSale(sale);
    } catch (e) {
      console.warn('Delete failed', e);
    }
  }

  return (
    <View style={styles.saleRow}>
      <View style={styles.saleInfo}>
        <Text style={styles.saleProduct}>{sale.productName}</Text>
        <Text style={styles.saleMeta}>
          {sale.quantity} × ${sale.price.toFixed(2)} ={' '}
          <Text style={styles.saleTotal}>${total}</Text>
        </Text>
      </View>
      <View style={styles.saleRight}>
        <View
          style={[
            styles.syncBadge,
            { backgroundColor: sale.synced ? '#dcfce7' : '#fef9c3' },
          ]}
        >
          <Text
            style={[
              styles.syncBadgeText,
              { color: sale.synced ? '#16a34a' : '#b45309' },
            ]}
          >
            {sale.synced ? '✓ Synced' : '⏳ Local'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── DashboardScreen ───────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { isConnected, isInternetReachable, connectionType, isOnline } =
    useNetworkStatus();
  const { sales, loading } = useSales();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>CRM Dashboard</Text>
            <Text style={styles.headerSub}>Welcome back 👋</Text>
          </View>
          {/* Minimal live indicator dot in the header corner */}
          <View
            style={[
              styles.liveDot,
              { backgroundColor: isOnline ? '#22c55e' : '#ef4444' },
            ]}
          />
        </View>

        {/* ── Network Banner (reusable component) ──────────────────── */}
        <NetworkBanner />

        {/* ── Sync Status Card ─────────────────────────────────────── */}
        <SyncStatusCard isOnline={isOnline} isConnected={isConnected} />

        {/* ── Connection Info ───────────────────────────────────────── */}
        <ConnectionInfoCard
          connectionType={connectionType}
          isInternetReachable={isInternetReachable}
        />

        {/* ── CRM Sections Grid ─────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Modules</Text>
        <View style={styles.grid}>
          {CRM_SECTIONS.map(({ key, ...section }) => (
            <CRMCard key={key} {...section} isOnline={isOnline} />
          ))}
        </View>

        {/* ── Sales (WatermelonDB) ──────────────────────────────────── */}
        <View style={styles.salesHeader}>
          <Text style={styles.sectionLabel}>Sales Records (WatermelonDB)</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addBtnText}>+ Add Sale</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            style={{ marginTop: 20 }}
            color="#6366f1"
            size="large"
          />
        ) : sales.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No sales yet.</Text>
            <Text style={styles.emptyHint}>
              Tap "+ Add Sale" to write your first record to SQLite.
            </Text>
          </View>
        ) : (
          <View style={styles.salesList}>
            {sales.map((sale) => (
              <SaleRow key={sale.id} sale={sale} />
            ))}
            <Text style={styles.salesCount}>
              {sales.length} record{sales.length !== 1 ? 's' : ''} stored locally
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Add Sale Modal ───────────────────────────────────────────── */}
      <AddSaleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  liveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  // Shared card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardBody: {
    marginTop: 6,
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },

  // Connection info
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 2,
  },

  // Sales section
  salesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    marginTop: 8,
  },
  addBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  salesList: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  salesCount: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  saleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  saleInfo: {
    flex: 1,
    marginRight: 10,
  },
  saleProduct: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  saleMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  saleTotal: {
    fontWeight: '700',
    color: '#0f172a',
  },
  saleRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  syncBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptyHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  // CRM grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  crmCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: '44%',
    margin: '3%',
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  crmIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  crmCount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  crmLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  crmHint: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
